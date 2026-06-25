<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$token = trim($_GET['token'] ?? '');
if (!$token) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Token manquant'])); }

list($link) = festival_db();
$res = mysqli_query($link, "SELECT * FROM festival_commandes_groupees");
$found = null;
while ($row = mysqli_fetch_assoc($res)) {
    $data = json_decode($row['data'], true);
    if (($data['responsable']['token'] ?? '') === $token) {
        $found = $row; $found['data'] = $data; break;
    }
}
mysqli_close($link);

if (!$found) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Lien invalide'])); }

$data = $found['data'];

// Confirme le responsable si pas encore fait
if (!($data['responsable']['confirme'] ?? false)) {
    $data['responsable']['confirme'] = true;
    list($link2) = festival_db();
    festival_save_row($link2, $found['harmonie'], $data, $found['statut_global']);
    mysqli_close($link2);
}

$commandes_en_cours = array_values(array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));
$total = array_sum(array_column($commandes_en_cours, 'total'));

exit(json_encode([
    'ok'          => true,
    'harmonie'    => $found['harmonie'],
    'statut'      => $found['statut_global'],
    'responsable' => $data['responsable'],
    'commandes'   => $commandes_en_cours,
    'total'       => $total,
]));
