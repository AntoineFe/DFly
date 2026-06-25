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

$statut_actions = ['cloture', 'reopen', 'virement_recu'];
$data_actions   = ['posters_envoyes', 'usb_commandee', 'usb_expediee'];
if (!in_array($action, array_merge($statut_actions, $data_actions))) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Action invalide']));
}

list($link) = festival_db();
$i = (int)$id;

if (in_array($action, $statut_actions)) {
    $new_statut = $action === 'reopen' ? 'ouvert' : ($action === 'virement_recu' ? 'virement_recu' : 'cloture');
    $s = mysqli_real_escape_string($link, $new_statut);
    mysqli_query($link, "UPDATE festival_commandes_groupees SET statut_global = '$s', updated_at = NOW() WHERE id = $i");
} else {
    $res = mysqli_query($link, "SELECT data FROM festival_commandes_groupees WHERE id = $i");
    $row = mysqli_fetch_assoc($res);
    if (!$row) { mysqli_close($link); http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Introuvable'])); }
    $data = json_decode($row['data'], true);
    if ($action === 'posters_envoyes') $data['statut_posters'] = 'commande_envoyee';
    if ($action === 'usb_commandee')   $data['statut_usb']     = 'commande_passee';
    if ($action === 'usb_expediee')    $data['statut_usb']     = 'expediee';
    $json = mysqli_real_escape_string($link, json_encode($data, JSON_UNESCAPED_UNICODE));
    mysqli_query($link, "UPDATE festival_commandes_groupees SET data = '$json', updated_at = NOW() WHERE id = $i");
}

mysqli_close($link);
exit(json_encode(['ok' => true]));
