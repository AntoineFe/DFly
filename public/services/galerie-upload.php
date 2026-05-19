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

    // Sauvegarder l'upload dans un fichier temporaire
    $tmpPath = $destDir . '/_tmp_' . $origName;
    if (!move_uploaded_file($file['tmp_name'], $tmpPath)) {
        $results[] = ['name' => $origName, 'ok' => false, 'error' => 'Déplacement fichier impossible'];
        continue;
    }

    if (in_array($mime, $IMAGE_TYPES)) {
        // Grand format : 1440px côté court → dossier galerie
        galerie_resize($tmpPath, $dest, $WEB_SHORT, $mime, 92);
        // Miniature : 230px côté court → dossier thumbnails
        galerie_resize($tmpPath, $thumbPath, $THUMB_SHORT, $mime, 82);
        @unlink($tmpPath);
    } else {
        // Vidéo ou autre : déplacer directement
        rename($tmpPath, $dest);
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

// ── Redimensionnement ─────────────────────────────────────────────────────────

function galerie_resize($src, $dest, $minShort, $mime, $quality = 85) {
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($src); break;
        case 'image/png':  $img = @imagecreatefrompng($src);  break;
        case 'image/webp': $img = @imagecreatefromwebp($src); break;
        case 'image/gif':  $img = @imagecreatefromgif($src);  break;
        default: return false;
    }
    if (!$img) return false;

    // Corriger l'orientation EXIF avant redimensionnement
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

    // Redimensionner selon le côté court
    $short = min($w, $h);
    if ($short <= $minShort) {
        // Déjà plus petit que la cible — sauvegarder tel quel
        $nw = $w;
        $nh = $h;
    } elseif ($w <= $h) {
        $nw = $minShort;
        $nh = (int)round($h * $minShort / $w);
    } else {
        $nh = $minShort;
        $nw = (int)round($w * $minShort / $h);
    }

    $out = imagecreatetruecolor($nw, $nh);

    if ($mime === 'image/png') {
        imagealphablending($out, false);
        imagesavealpha($out, true);
    }

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
