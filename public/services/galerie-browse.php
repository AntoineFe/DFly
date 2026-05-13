<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'galerie', 'R');

list(, $cfg) = galerie_db();

// Le client ne peut voir que son propre dossier (shortDescEnt)
// Un admin peut passer ?ent=shortDesc pour voir n'importe quel client
$isAdmin = galerie_has_auth($session, 'admin', 'R');

if (isset($_GET['ent'])) {
    $requestedSlug = galerie_ent_slug($_GET['ent']);
    $allowedSlugs  = array_map('galerie_ent_slug', array_column($session['ents'], 'shortDesc'));
    if ($isAdmin || in_array($requestedSlug, $allowedSlugs)) {
        $entSlug = $requestedSlug;
    } else {
        http_response_code(403);
        exit(json_encode(['ok' => false, 'error' => 'Accès refusé à ce client']));
    }
} else {
    $entSlug = galerie_ent_slug($session['shortDescEnt']);
}

$subPath = isset($_GET['path']) ? $_GET['path'] : '';
// Sécurité : interdire les traversées de répertoire
$subPath = preg_replace('/\.\./', '', $subPath);
$subPath = ltrim($subPath, '/');

$paths     = galerie_ent_paths($cfg, $entSlug);
$baseDir   = $paths['galerie_root'];
$targetDir = $subPath !== '' ? $baseDir . '/' . $subPath : $baseDir;

if (!is_dir($targetDir)) {
    $logFile = __DIR__ . '/galerie-browse.log';
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' | 404 | targetDir=' . $targetDir . ' | baseDir=' . $baseDir . ' | pro_root=' . $cfg['pro_root'] . PHP_EOL, FILE_APPEND | LOCK_EX);
    http_response_code(404);
    exit(json_encode(['ok' => false, 'error' => 'Dossier introuvable']));
}

$IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$VIDEO_EXT = ['mp4', 'mov', 'avi', 'webm'];

$dirs  = [];
$files = [];

foreach (scandir($targetDir) as $item) {
    if ($item === '.' || $item === '..') continue;
    $full = $targetDir . '/' . $item;
    if (is_dir($full)) {
        // Image de couverture : première image du sous-dossier (thumbnails)
        $thumbDir = $paths['thumbnails_root'] . '/' . ($subPath !== '' ? $subPath . '/' : '') . $item;
        $cover    = null;
        if (is_dir($thumbDir)) {
            foreach (scandir($thumbDir) as $tf) {
                $ext = strtolower(pathinfo($tf, PATHINFO_EXTENSION));
                if (in_array($ext, $IMAGE_EXT)) {
                    $cover = $paths['thumbnails_url'] . '/' . ($subPath !== '' ? $subPath . '/' : '') . $item . '/' . $tf;
                    break;
                }
            }
        }
        // Lire meta si présent
        $metaFile = $full . '/_meta.json';
        $meta     = file_exists($metaFile) ? json_decode(file_get_contents($metaFile), true) : null;
        $dirs[] = ['name' => $item, 'cover' => $cover, 'meta' => $meta];
    } else {
        if ($item === '_meta.json') continue;
        $ext  = strtolower(pathinfo($item, PATHINFO_EXTENSION));
        $type = in_array($ext, $IMAGE_EXT) ? 'image' : (in_array($ext, $VIDEO_EXT) ? 'video' : null);
        if (!$type) continue;

        $relPath  = ($subPath !== '' ? $subPath . '/' : '') . $item;
        $thumbUrl = null;
        if ($type === 'image') {
            $thumbPath = $paths['thumbnails_root'] . '/' . $relPath;
            if (file_exists($thumbPath)) {
                $thumbUrl = $paths['thumbnails_url'] . '/' . $relPath;
            }
        }
        $files[] = [
            'name'     => $item,
            'type'     => $type,
            'url'      => $paths['galerie_url'] . '/' . $relPath,
            'thumbUrl' => $thumbUrl ?? ($paths['galerie_url'] . '/' . $relPath),
        ];
    }
}

// Lire meta du dossier courant
$metaFile    = $targetDir . '/_meta.json';
$currentMeta = file_exists($metaFile) ? json_decode(file_get_contents($metaFile), true) : null;

echo json_encode([
    'ok'      => true,
    'path'    => $subPath,
    'ent'     => $entSlug,
    'meta'    => $currentMeta,
    'dirs'    => $dirs,
    'files'   => $files,
]);
