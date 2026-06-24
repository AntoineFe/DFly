<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

list($link) = festival_db();
$res = mysqli_query($link, "SELECT * FROM festival_commandes_groupees ORDER BY harmonie");

$harmonies = [];
$totaux    = array_fill_keys(array_keys(FESTIVAL_PRIX), 0);
$total_global = 0.0;

while ($row = mysqli_fetch_assoc($res)) {
    $data = json_decode($row['data'], true);
    $commandes_en_cours = array_values(array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));
    $total = array_sum(array_column($commandes_en_cours, 'total'));
    $total_global += $total;

    foreach ($commandes_en_cours as $cmd) {
        foreach (array_keys(FESTIVAL_PRIX) as $key) {
            $totaux[$key] += (int)($cmd['produits'][$key] ?? 0);
        }
    }

    $harmonies[] = [
        'id'            => $row['id'],
        'harmonie'      => $row['harmonie'],
        'statut_global' => $row['statut_global'],
        'responsable'   => $data['responsable'],
        'commandes'     => $data['commandes'],
        'total'         => $total,
    ];
}

mysqli_close($link);

exit(json_encode([
    'ok'           => true,
    'harmonies'    => $harmonies,
    'totaux'       => $totaux,
    'total_global' => $total_global,
    'produits'     => FESTIVAL_PRODUITS,
]));
