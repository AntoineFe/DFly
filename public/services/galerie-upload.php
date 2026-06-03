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

        // Charger l'image HD une seule fois
        $img = galerie_load_gd($hdPath, $mime);
        if ($img) {
            // Version web (1440p) depuis HD
            $webImg = galerie_scale_gd($img, $WEB_SHORT);
            galerie_save_gd($webImg, $dest, $mime, 88);

            // Ratio depuis la version web
            $w = imagesx($webImg);
            $h = imagesy($webImg);

            // Miniature depuis la version web déjà réduite (beaucoup plus rapide)
            $thumbImg = galerie_scale_gd($webImg, $THUMB_SHORT);
            galerie_save_gd($thumbImg, $thumbPath, $mime, 82);

            imagedestroy($img);
            imagedestroy($webImg);
            imagedestroy($thumbImg);

            if ($w > 0 && $h > 0) {
                $metaFilesPath = $destDir . '/_meta_files.json';
                $ratios = file_exists($metaFilesPath) ? (json_decode(file_get_contents($metaFilesPath), true) ?? []) : [];
                $ratios[$origName] = round($w / $h, 4);
                file_put_contents($metaFilesPath, json_encode($ratios), LOCK_EX);
            }
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

// ── Helpers GD ────────────────────────────────────────────────────────────────

function galerie_load_gd($src, $mime) {
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($src); break;
        case 'image/png':  $img = @imagecreatefrompng($src);  break;
        case 'image/webp': $img = @imagecreatefromwebp($src); break;
        case 'image/gif':  $img = @imagecreatefromgif($src);  break;
        default: return false;
    }
    if (!$img) return false;

    // Correction orientation EXIF
    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif        = @exif_read_data($src);
        $orientation = $exif['Orientation'] ?? 1;
        switch ($orientation) {
            case 3: $img = imagerotate($img, 180, 0);  break;
            case 6: $img = imagerotate($img, -90, 0); break;
            case 8: $img = imagerotate($img, 90, 0);  break;
        }
    }
    return $img;
}

function galerie_scale_gd($img, $minShort) {
    $w = imagesx($img);
    $h = imagesy($img);

    if (min($w, $h) <= $minShort) return $img; // déjà plus petit

    if ($w <= $h) {
        $nw = $minShort;
        $nh = (int)round($h * $minShort / $w);
    } else {
        $nh = $minShort;
        $nw = (int)round($w * $minShort / $h);
    }

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
