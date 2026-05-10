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

[, $cfg] = galerie_db();

$body    = json_decode(file_get_contents('php://input'), true);
$ent     = galerie_ent_slug($body['ent'] ?? $session['shortDescEnt']);
$subPath = preg_replace('/\.\./', '', $body['path'] ?? '');
$name    = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $body['name'] ?? '');
$name    = trim($name);

if ($name === '') {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Nom de dossier invalide']));
}

$subPath  = trim($subPath, '/');
$paths    = galerie_ent_paths($cfg, $ent);
$newDir   = $paths['galerie_root']    . ($subPath !== '' ? '/' . $subPath : '') . '/' . $name;
$newThumb = $paths['thumbnails_root'] . ($subPath !== '' ? '/' . $subPath : '') . '/' . $name;

if (is_dir($newDir)) {
    http_response_code(409);
    exit(json_encode(['ok' => false, 'error' => 'Ce dossier existe déjà']));
}

if (!@mkdir($newDir, 0755, true) || !@mkdir($newThumb, 0755, true)) {
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Création dossier impossible']));
}

echo json_encode(['ok' => true, 'name' => $name]);
