<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';
$session = galerie_require_auth();
if (!galerie_has_auth($session, 'admin', 'R')) {
    http_response_code(403);
    exit(json_encode(['ok' => false, 'error' => 'Accès refusé']));
}

list(, $cfg) = galerie_db();

$body    = json_decode(file_get_contents('php://input'), true);
$ent     = galerie_ent_slug($body['ent'] ?? $session['shortDescEnt']);
$subPath = preg_replace('/\.\./', '', $body['path'] ?? '');
$subPath = trim($subPath, '/');
$meta    = $body['meta'] ?? [];

// Champs autorisés uniquement
$clean = [];
foreach (['title', 'subtitle', 'message', 'videoHtml', 'printUrl', 'printLabel'] as $k) {
    if (isset($meta[$k])) $clean[$k] = (string)$meta[$k];
}

$paths = galerie_ent_paths($cfg, $ent);
$dir   = $paths['galerie_root'] . ($subPath !== '' ? '/' . $subPath : '');

if (!is_dir($dir)) {
    http_response_code(404);
    exit(json_encode(['ok' => false, 'error' => 'Dossier introuvable']));
}

$written = file_put_contents($dir . '/_meta.json', json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
if ($written === false) {
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'Écriture impossible']));
}

echo json_encode(['ok' => true, 'meta' => $clean]);
