<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'galerie', 'R');

list(, $cfg) = galerie_db();

$body    = json_decode(file_get_contents('php://input'), true);
$version = ($body['version'] ?? 'hd') === 'hd' ? 'hd' : 'web';
$files   = $body['files'] ?? [];
$subPath = preg_replace('/\.\./', '', $body['path'] ?? '');
$subPath = ltrim($subPath, '/');

if (empty($files) || !is_array($files)) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Aucun fichier sélectionné']));
}

$isAdmin = galerie_has_auth($session, 'admin', 'R');

if (isset($body['ent'])) {
    $requestedSlug = galerie_ent_slug($body['ent']);
    $allowedSlugs  = array_map('galerie_ent_slug', array_column($session['ents'], 'shortDesc'));
    if ($isAdmin || in_array($requestedSlug, $allowedSlugs)) {
        $entSlug = $requestedSlug;
    } else {
        http_response_code(403);
        exit(json_encode(['ok' => false, 'error' => 'Accès refusé']));
    }
} else {
    $entSlug = galerie_ent_slug($session['shortDescEnt']);
}

$paths  = galerie_ent_paths($cfg, $entSlug);
$srcDir = ($version === 'hd' ? $paths['hd_root'] : $paths['galerie_root'])
        . ($subPath !== '' ? '/' . $subPath : '');

$tmpZip  = sys_get_temp_dir() . '/' . uniqid('dfly_sel_', true) . '.zip';
$zip     = new ZipArchive();
if ($zip->open($tmpZip, ZipArchive::CREATE) !== true) {
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Impossible de créer l\'archive']));
}

$IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$added = 0;
foreach ($files as $filename) {
    $filename = basename($filename); // sécurité
    $ext      = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    if (!in_array($ext, $IMAGE_EXT)) continue;
    $fullPath = $srcDir . '/' . $filename;
    // Si version HD demandée mais fichier absent, fallback sur galerie
    if ($version === 'hd' && !file_exists($fullPath)) {
        $fullPath = $paths['galerie_root'] . ($subPath !== '' ? '/' . $subPath : '') . '/' . $filename;
    }
    if (file_exists($fullPath)) {
        $zip->addFile($fullPath, $filename);
        $added++;
    }
}
$zip->close();

if ($added === 0) {
    @unlink($tmpZip);
    http_response_code(404);
    exit(json_encode(['ok' => false, 'error' => 'Aucun fichier trouvé']));
}

$label   = $added === 1 ? pathinfo($files[0], PATHINFO_FILENAME) : ($subPath ? basename($subPath) : $entSlug);
$suffix  = $version === 'hd' ? '_HD' : '_1440p';
$zipName = $label . $suffix . '.zip';

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipName . '"');
header('Content-Length: ' . filesize($tmpZip));
header('Cache-Control: no-store');

readfile($tmpZip);
@unlink($tmpZip);
