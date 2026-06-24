<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$harmonie = trim($_GET['harmonie'] ?? '');
if (!$harmonie || !in_array($harmonie, FESTIVAL_HARMONIES)) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
}

list($link) = festival_db();
$row = festival_get_row($link, $harmonie);
mysqli_close($link);

if (!$row) {
    exit(json_encode(['ok' => true, 'statut_global' => 'ouvert', 'responsable' => null]));
}

$resp = $row['data']['responsable'];
exit(json_encode([
    'ok'            => true,
    'statut_global' => $row['statut_global'],
    'responsable'   => $resp,
]));
