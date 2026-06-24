<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = (int)($body['id'] ?? 0);
$action = trim($body['action'] ?? 'cloture');
if (!$id) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'ID manquant'])); }
if (!in_array($action, ['cloture', 'reopen'])) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Action invalide'])); }

$new_statut = ($action === 'reopen') ? 'ouvert' : 'cloture';

list($link) = festival_db();
$i = mysqli_real_escape_string($link, $id);
mysqli_query($link, "UPDATE festival_commandes_groupees SET statut_global = '$new_statut', updated_at = NOW() WHERE id = $i");
mysqli_close($link);

exit(json_encode(['ok' => true]));
