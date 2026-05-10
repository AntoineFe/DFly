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

if (!is_dir($destDir)) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Dossier destination introuvable']));
}

if (!is_dir($thumbDir)) @mkdir($thumbDir, 0755, true);

$THUMB_SIZE  = 460; // px (côté le plus long)
$IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

$results = [];

foreach ($_FILES as $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $results[] = ['name' => $file['name'], 'ok' => false, 'error' => 'Erreur upload'];
        continue;
    }

    $origName = basename($file['name']);
    $mime     = mime_content_type($file['tmp_name']);
    $dest     = $destDir . '/' . $origName;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        $results[] = ['name' => $origName, 'ok' => false, 'error' => 'Déplacement fichier impossible'];
        continue;
    }

    // Générer miniature pour les images
    if (in_array($mime, $IMAGE_TYPES)) {
        $thumbPath = $thumbDir . '/' . $origName;
        galerie_make_thumb($dest, $thumbPath, $THUMB_SIZE, $mime);
    }

    $relPath = ($subPath !== '' ? $subPath . '/' : '') . $origName;
    $results[] = [
        'name'     => $origName,
        'ok'       => true,
        'url'      => $paths['galerie_url']    . '/' . $relPath,
        'thumbUrl' => $paths['thumbnails_url'] . '/' . $relPath,
    ];
}

echo json_encode(['ok' => true, 'files' => $results]);

// ── Génération miniature ──────────────────────────────────────────────────────

function galerie_make_thumb($src, $dest, $maxSize, $mime) {
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($src); break;
        case 'image/png':  $img = @imagecreatefrompng($src);  break;
        case 'image/webp': $img = @imagecreatefromwebp($src); break;
        case 'image/gif':  $img = @imagecreatefromgif($src);  break;
        default: return false;
    }
    if (!$img) return false;

    $w = imagesx($img);
    $h = imagesy($img);

    if ($w >= $h) {
        $nw = $maxSize;
        $nh = (int)round($h * $maxSize / $w);
    } else {
        $nh = $maxSize;
        $nw = (int)round($w * $maxSize / $h);
    }

    $thumb = imagecreatetruecolor($nw, $nh);

    // Conserver la transparence pour PNG
    if ($mime === 'image/png') {
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
    }

    imagecopyresampled($thumb, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);

    // Lire l'orientation EXIF et corriger
    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($src);
        $orientation = $exif['Orientation'] ?? 1;
        switch ($orientation) {
            case 3: $thumb = imagerotate($thumb, 180, 0); break;
            case 6: $thumb = imagerotate($thumb, -90, 0); break;
            case 8: $thumb = imagerotate($thumb, 90, 0);  break;
        }
    }

    switch ($mime) {
        case 'image/jpeg': return imagejpeg($thumb, $dest, 85);
        case 'image/png':  return imagepng($thumb, $dest, 6);
        case 'image/webp': return imagewebp($thumb, $dest, 85);
        case 'image/gif':  return imagegif($thumb, $dest);
    }
    return false;
}
