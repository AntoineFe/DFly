<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'galerie', 'R');

list(, $cfg) = galerie_db();

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
$subPath = preg_replace('/\.\./', '', $subPath);
$subPath = ltrim($subPath, '/');

$offset = max(0, (int)($_GET['offset'] ?? 0));
$limit  = min(50, max(1, (int)($_GET['limit']  ?? 30)));

$paths  = galerie_ent_paths($cfg, $entSlug);
$hdDir  = $paths['hd_root'] . ($subPath !== '' ? '/' . $subPath : '');

if (!is_dir($hdDir)) {
    http_response_code(404);
    exit(json_encode(['ok' => false, 'error' => 'Aucune photo HD disponible']));
}

$IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

$allFiles = [];
foreach (scandir($hdDir) as $item) {
    if ($item === '.' || $item === '..') continue;
    $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
    if (in_array($ext, $IMAGE_EXT) && is_file($hdDir . '/' . $item)) {
        $allFiles[] = $item;
    }
}
sort($allFiles);

$total = count($allFiles);
$batch = array_slice($allFiles, $offset, $limit);

if (empty($batch)) {
    http_response_code(404);
    exit(json_encode(['ok' => false, 'error' => 'Aucune photo dans ce lot']));
}

// Nom du ZIP
$folderName = $subPath !== '' ? basename($subPath) : $entSlug;
$batchLabel = $total > $limit ? '_lot' . (intdiv($offset, $limit) + 1) : '';
$zipName    = $folderName . $batchLabel . '_HD.zip';

$tmpZip = sys_get_temp_dir() . '/' . uniqid('dfly_hd_', true) . '.zip';

$zip = new ZipArchive();
if ($zip->open($tmpZip, ZipArchive::CREATE) !== true) {
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Impossible de créer l\'archive']));
}

foreach ($batch as $filename) {
    $zip->addFile($hdDir . '/' . $filename, $filename);
    $zip->setCompressionName($filename, ZipArchive::CM_STORE);
}
$zip->close();

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipName . '"');
header('Content-Length: ' . filesize($tmpZip));
header('Cache-Control: no-store');

readfile($tmpZip);
@unlink($tmpZip);
