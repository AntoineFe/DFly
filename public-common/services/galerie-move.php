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

$body     = json_decode(file_get_contents('php://input'), true);
$ent      = galerie_ent_slug($body['ent'] ?? $session['shortDescEnt']);
$type     = $body['type'] ?? 'files'; // 'folder' or 'files'
$srcPath  = trim(preg_replace('/\.\./', '', $body['srcPath']  ?? ''), '/');
$destPath = trim(preg_replace('/\.\./', '', $body['destPath'] ?? ''), '/');
$files    = $body['files'] ?? []; // empty = all files

$paths = galerie_ent_paths($cfg, $ent);
$roots = [
    $paths['galerie_root'],
    $paths['thumbnails_root'],
    $paths['hd_root'],
];

if ($type === 'folder') {
    if ($srcPath === '') {
        http_response_code(400);
        exit(json_encode(['ok' => false, 'error' => 'Dossier source invalide']));
    }
    $folderName = basename($srcPath);

    foreach ($roots as $root) {
        $src  = $root . '/' . $srcPath;
        $dest = $root . ($destPath !== '' ? '/' . $destPath : '') . '/' . $folderName;
        if (!is_dir($src)) continue;
        if (is_dir($dest)) {
            http_response_code(409);
            exit(json_encode(['ok' => false, 'error' => 'Un dossier du même nom existe déjà à destination']));
        }
        $destParent = dirname($dest);
        if (!is_dir($destParent)) @mkdir($destParent, 0755, true);
        if (!rename($src, $dest)) {
            http_response_code(500);
            exit(json_encode(['ok' => false, 'error' => 'Déplacement impossible']));
        }
    }
} else {
    // Move files
    $IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $VIDEO_EXT = ['mp4', 'mov', 'avi', 'webm'];

    // If files list is empty, move all media files from srcPath
    if (empty($files)) {
        $srcDir = $paths['galerie_root'] . ($srcPath !== '' ? '/' . $srcPath : '');
        if (!is_dir($srcDir)) {
            http_response_code(404);
            exit(json_encode(['ok' => false, 'error' => 'Dossier source introuvable']));
        }
        foreach (scandir($srcDir) as $item) {
            if ($item === '.' || $item === '..' || $item === '_meta.json') continue;
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            if (in_array($ext, $IMAGE_EXT) || in_array($ext, $VIDEO_EXT)) {
                $files[] = $item;
            }
        }
    }

    foreach ($roots as $root) {
        $src  = $root . ($srcPath  !== '' ? '/' . $srcPath  : '');
        $dest = $root . ($destPath !== '' ? '/' . $destPath : '');
        if (!is_dir($dest)) @mkdir($dest, 0755, true);
        foreach ($files as $filename) {
            $filename = basename($filename);
            $srcFile  = $src  . '/' . $filename;
            $destFile = $dest . '/' . $filename;
            if (file_exists($srcFile)) rename($srcFile, $destFile);
        }
    }
}

echo json_encode(['ok' => true]);
