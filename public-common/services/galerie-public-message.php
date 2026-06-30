<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';

$jsonFile = __DIR__ . '/cms/galerie-public-message.json';

// ── GET : lecture publique ─────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($jsonFile)) {
        exit(json_encode(['ok' => true, 'html_top' => '', 'html_bottom' => '']));
    }
    $data = json_decode(file_get_contents($jsonFile), true) ?? [];
    exit(json_encode([
        'ok'         => true,
        'html_top'   => $data['html_top']    ?? $data['html'] ?? '',
        'html_bottom' => $data['html_bottom'] ?? '',
    ]));
}

// ── POST : sauvegarde (admin uniquement) ──────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $session = galerie_require_auth();
    galerie_require_level($session, 'admin', 'R');

    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    if (!is_dir(dirname($jsonFile))) @mkdir(dirname($jsonFile), 0755, true);
    file_put_contents($jsonFile, json_encode([
        'html_top'    => $body['html_top']    ?? '',
        'html_bottom' => $body['html_bottom'] ?? '',
    ], JSON_UNESCAPED_UNICODE));
    exit(json_encode(['ok' => true]));
}

http_response_code(405);
exit(json_encode(['ok' => false]));
