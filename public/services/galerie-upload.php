<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'upload', 'C');

list(, $cfg) = galerie_db();

$ent     = galerie_ent_slug($_POST['ent'] ?? $session['shortDescEnt']);
$subPath = preg_replace('/\.\./', '', $_POST['path'] ?? '');
$subPath = trim($subPath, '/');

$paths    = galerie_ent_paths($cfg, $ent);
$destDir  = $paths['galerie_root']    . ($subPath !== '' ? '/' . $subPath : '');
$thumbDir = $paths['thumbnails_root'] . ($subPath !== '' ? '/' . $subPath : '');
$hdDir    = $paths['hd_root']         . ($subPath !== '' ? '/' . $subPath : '');

if (!is_dir($destDir))  @mkdir($destDir,  0755, true);
if (!is_dir($thumbDir)) @mkdir($thumbDir, 0755, true);
if (!is_dir($hdDir))    @mkdir($hdDir,    0755, true);

if (!is_dir($destDir)) {
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Impossible de créer le dossier destination']));
}

$IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$VIDEO_EXT   = ['mp4', 'mov', 'avi', 'webm'];

$results = [];

// ── Mode client-resize : file_hd + file_web + file_thumb envoyés pré-construits
if (isset($_FILES['file_web'])) {
    $origName = basename($_POST['filename'] ?? ($_FILES['file_web']['name'] ?? 'photo.jpg'));
    $ratio    = isset($_POST['ratio']) ? (float)$_POST['ratio'] : null;

    $ok = true;

    // HD original
    if (isset($_FILES['file_hd']) && $_FILES['file_hd']['error'] === UPLOAD_ERR_OK) {
        if (!move_uploaded_file($_FILES['file_hd']['tmp_name'], $hdDir . '/' . $origName)) $ok = false;
    }
    // Version web
    if ($_FILES['file_web']['error'] === UPLOAD_ERR_OK) {
        if (!move_uploaded_file($_FILES['file_web']['tmp_name'], $destDir . '/' . $origName)) $ok = false;
    } else { $ok = false; }
    // Miniature
    if (isset($_FILES['file_thumb']) && $_FILES['file_thumb']['error'] === UPLOAD_ERR_OK) {
        move_uploaded_file($_FILES['file_thumb']['tmp_name'], $thumbDir . '/' . $origName);
    }

    // Stocker le ratio
    if ($ratio && $ok) {
        $metaFilesPath = $destDir . '/_meta_files.json';
        $ratios = file_exists($metaFilesPath) ? (json_decode(file_get_contents($metaFilesPath), true) ?? []) : [];
        $ratios[$origName] = round($ratio, 4);
        file_put_contents($metaFilesPath, json_encode($ratios), LOCK_EX);
    }

    $relPath = ($subPath !== '' ? $subPath . '/' : '') . $origName;
    $results[] = [
        'name'     => $origName,
        'ok'       => $ok,
        'url'      => $paths['galerie_url']    . '/' . $relPath,
        'thumbUrl' => $paths['thumbnails_url'] . '/' . $relPath,
        'hdUrl'    => $paths['hd_url']         . '/' . $relPath,
    ];

// ── Mode legacy : serveur redimensionne (vidéos + fallback)
} else {
    $THUMB_SHORT = 230;
    $WEB_SHORT   = 1440;
    $useImagick  = extension_loaded('imagick');

    foreach ($_FILES as $key => $file) {
        if ($key === 'file_hd' || $key === 'file_web' || $key === 'file_thumb') continue;
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $results[] = ['name' => $file['name'], 'ok' => false, 'error' => 'Erreur upload'];
            continue;
        }

        $origName  = basename($file['name']);
        $mime      = mime_content_type($file['tmp_name']);
        $dest      = $destDir  . '/' . $origName;
        $thumbPath = $thumbDir . '/' . $origName;
        $hdPath    = $hdDir    . '/' . $origName;

        $tmpPath = $destDir . '/_tmp_' . $origName;
        if (!move_uploaded_file($file['tmp_name'], $tmpPath)) {
            $results[] = ['name' => $origName, 'ok' => false, 'error' => 'Déplacement impossible'];
            continue;
        }

        if (in_array($mime, $IMAGE_TYPES)) {
            rename($tmpPath, $hdPath);
            $w = 0; $h = 0;
            if ($useImagick && $mime === 'image/jpeg') {
                galerie_process_imagick($hdPath, $dest, $thumbPath, $WEB_SHORT, $THUMB_SHORT, $w, $h);
            } else {
                galerie_process_gd($hdPath, $dest, $thumbPath, $mime, $WEB_SHORT, $THUMB_SHORT, $w, $h);
            }
            if ($w > 0 && $h > 0) {
                $metaFilesPath = $destDir . '/_meta_files.json';
                $ratios = file_exists($metaFilesPath) ? (json_decode(file_get_contents($metaFilesPath), true) ?? []) : [];
                $ratios[$origName] = round($w / $h, 4);
                file_put_contents($metaFilesPath, json_encode($ratios), LOCK_EX);
            }
        } else {
            rename($tmpPath, $dest);
        }

        $relPath = ($subPath !== '' ? $subPath . '/' : '') . $origName;
        $results[] = [
            'name'     => $origName,
            'ok'       => true,
            'url'      => $paths['galerie_url']    . '/' . $relPath,
            'thumbUrl' => $paths['thumbnails_url'] . '/' . $relPath,
            'hdUrl'    => in_array($mime, $IMAGE_TYPES) ? $paths['hd_url'] . '/' . $relPath : null,
        ];
    }
}

echo json_encode(['ok' => true, 'files' => $results]);

// ── Imagick JPEG ──────────────────────────────────────────────────────────────

function galerie_process_imagick($src, $dest, $thumbPath, $webShort, $thumbShort, &$w, &$h) {
    try {
        $hint = ($webShort * 3) . 'x' . ($webShort * 3);
        $im = new Imagick();
        $im->setOption('jpeg:size', $hint);
        $im->readImage($src);
        $im->autoOrient();
        $im->stripImage();
        $iw = $im->getImageWidth(); $ih = $im->getImageHeight();
        if (min($iw, $ih) > $webShort) {
            if ($iw <= $ih) { $nw = $webShort; $nh = (int)round($ih * $webShort / $iw); }
            else            { $nh = $webShort; $nw = (int)round($iw * $webShort / $ih); }
            $im->resizeImage($nw, $nh, Imagick::FILTER_LANCZOS, 1);
        }
        $im->setImageCompressionQuality(88);
        $im->setInterlaceScheme(Imagick::INTERLACE_JPEG);
        $im->writeImage($dest);
        $w = $im->getImageWidth(); $h = $im->getImageHeight();
        if (min($w, $h) > $thumbShort) {
            if ($w <= $h) { $tw = $thumbShort; $th = (int)round($h * $thumbShort / $w); }
            else          { $th = $thumbShort; $tw = (int)round($w * $thumbShort / $h); }
            $im->resizeImage($tw, $th, Imagick::FILTER_LANCZOS, 1);
        }
        $im->setImageCompressionQuality(82);
        $im->writeImage($thumbPath);
        $im->destroy();
        return true;
    } catch (Exception $e) { return false; }
}

// ── GD fallback ───────────────────────────────────────────────────────────────

function galerie_process_gd($src, $dest, $thumbPath, $mime, $webShort, $thumbShort, &$w, &$h) {
    $img = galerie_load_gd($src, $mime);
    if (!$img) return false;
    $webImg = galerie_scale_gd($img, $webShort);
    galerie_save_gd($webImg, $dest, $mime, 88);
    $w = imagesx($webImg); $h = imagesy($webImg);
    $thumbImg = galerie_scale_gd($webImg, $thumbShort);
    galerie_save_gd($thumbImg, $thumbPath, $mime, 82);
    imagedestroy($img);
    if ($webImg !== $img) imagedestroy($webImg);
    if ($thumbImg !== $webImg) imagedestroy($thumbImg);
    return true;
}

function galerie_load_gd($src, $mime) {
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($src); break;
        case 'image/png':  $img = @imagecreatefrompng($src);  break;
        case 'image/webp': $img = @imagecreatefromwebp($src); break;
        case 'image/gif':  $img = @imagecreatefromgif($src);  break;
        default: return false;
    }
    if (!$img) return false;
    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($src);
        $o    = $exif['Orientation'] ?? 1;
        if ($o === 3) $img = imagerotate($img, 180, 0);
        elseif ($o === 6) $img = imagerotate($img, -90, 0);
        elseif ($o === 8) $img = imagerotate($img,  90, 0);
    }
    return $img;
}

function galerie_scale_gd($img, $minShort) {
    $w = imagesx($img); $h = imagesy($img);
    if (min($w, $h) <= $minShort) return $img;
    if ($w <= $h) { $nw = $minShort; $nh = (int)round($h * $minShort / $w); }
    else          { $nh = $minShort; $nw = (int)round($w * $minShort / $h); }
    $out = imagecreatetruecolor($nw, $nh);
    imagecopyresampled($out, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
    return $out;
}

function galerie_save_gd($img, $dest, $mime, $quality = 85) {
    switch ($mime) {
        case 'image/jpeg': return imagejpeg($img, $dest, $quality);
        case 'image/png':  return imagepng($img, $dest, 6);
        case 'image/webp': return imagewebp($img, $dest, $quality);
        case 'image/gif':  return imagegif($img, $dest);
    }
    return false;
}
