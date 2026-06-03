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

$THUMB_SHORT = 230;   // px — côté court miniature
$WEB_SHORT   = 1440;  // px — côté court grand format
$IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

$useImagick = extension_loaded('imagick');

$results = [];

foreach ($_FILES as $file) {
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
        $results[] = ['name' => $origName, 'ok' => false, 'error' => 'Déplacement fichier impossible'];
        continue;
    }

    if (in_array($mime, $IMAGE_TYPES)) {
        rename($tmpPath, $hdPath);

        if ($useImagick) {
            galerie_resize_imagick($hdPath, $dest,      $WEB_SHORT,   92);
            galerie_resize_imagick($hdPath, $thumbPath, $THUMB_SHORT, 82);
        } else {
            galerie_resize_gd($hdPath, $dest,      $WEB_SHORT,   $mime, 92);
            galerie_resize_gd($hdPath, $thumbPath, $THUMB_SHORT, $mime, 82);
        }

        // Stocker le ratio largeur/hauteur de la version web
        if ($useImagick) {
            try {
                $im = new Imagick($dest);
                $w  = $im->getImageWidth();
                $h  = $im->getImageHeight();
                $im->destroy();
            } catch (Exception $e) { $w = 0; $h = 0; }
        } else {
            $img = @imagecreatefromstring(file_get_contents($dest));
            if ($img) { $w = imagesx($img); $h = imagesy($img); imagedestroy($img); }
            else { $w = 0; $h = 0; }
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

echo json_encode(['ok' => true, 'files' => $results]);

// ── Redimensionnement Imagick ─────────────────────────────────────────────────

function galerie_resize_imagick($src, $dest, $minShort, $quality = 85) {
    try {
        $im = new Imagick($src);
        // Auto-rotation EXIF
        $im->autoOrient();
        // Strip métadonnées (gain de poids)
        $im->stripImage();

        $w = $im->getImageWidth();
        $h = $im->getImageHeight();

        if (min($w, $h) > $minShort) {
            if ($w <= $h) {
                $nw = $minShort;
                $nh = (int)round($h * $minShort / $w);
            } else {
                $nh = $minShort;
                $nw = (int)round($w * $minShort / $h);
            }
            $im->resizeImage($nw, $nh, Imagick::FILTER_LANCZOS, 1);
        }

        $format = strtolower($im->getImageFormat());
        if ($format === 'jpeg' || $format === 'jpg') {
            $im->setImageCompressionQuality($quality);
            $im->setInterlaceScheme(Imagick::INTERLACE_JPEG); // JPEG progressif
        } elseif ($format === 'webp') {
            $im->setImageCompressionQuality($quality);
        }

        $im->writeImage($dest);
        $im->destroy();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// ── Redimensionnement GD (fallback) ──────────────────────────────────────────

function galerie_resize_gd($src, $dest, $minShort, $mime, $quality = 85) {
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($src); break;
        case 'image/png':  $img = @imagecreatefrompng($src);  break;
        case 'image/webp': $img = @imagecreatefromwebp($src); break;
        case 'image/gif':  $img = @imagecreatefromgif($src);  break;
        default: return false;
    }
    if (!$img) return false;

    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif        = @exif_read_data($src);
        $orientation = $exif['Orientation'] ?? 1;
        switch ($orientation) {
            case 3: $img = imagerotate($img, 180, 0);  break;
            case 6: $img = imagerotate($img, -90, 0); break;
            case 8: $img = imagerotate($img, 90, 0);  break;
        }
    }

    $w = imagesx($img);
    $h = imagesy($img);

    $short = min($w, $h);
    if ($short <= $minShort) {
        $nw = $w; $nh = $h;
    } elseif ($w <= $h) {
        $nw = $minShort;
        $nh = (int)round($h * $minShort / $w);
    } else {
        $nh = $minShort;
        $nw = (int)round($w * $minShort / $h);
    }

    $out = imagecreatetruecolor($nw, $nh);
    if ($mime === 'image/png') { imagealphablending($out, false); imagesavealpha($out, true); }
    imagecopyresampled($out, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imagedestroy($img);

    switch ($mime) {
        case 'image/jpeg': return imagejpeg($out, $dest, $quality);
        case 'image/png':  return imagepng($out, $dest, 6);
        case 'image/webp': return imagewebp($out, $dest, $quality);
        case 'image/gif':  return imagegif($out, $dest);
    }
    imagedestroy($out);
    return false;
}
