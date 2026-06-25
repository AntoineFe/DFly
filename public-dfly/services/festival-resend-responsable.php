<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id   = (int)($body['id'] ?? 0);
if (!$id) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'ID manquant'])); }

list($link) = festival_db();
$res = mysqli_query($link, "SELECT harmonie, data FROM festival_commandes_groupees WHERE id = $id");
$row = mysqli_fetch_assoc($res);
mysqli_close($link);

if (!$row) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Harmonie introuvable'])); }

$data = json_decode($row['data'], true);
$resp = $data['responsable'] ?? null;
if (!$resp || empty($resp['token'])) {
    http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Aucun responsable enregistré']));
}

$harmonie = $row['harmonie'];
$nom      = $resp['nom'];
$email    = $resp['email'];
$token    = $resp['token'];
$lien     = 'https://dfly.fr/commande-festival-faucigny-2026?responsable=' . urlencode($token);

$body_email  = "Bonjour {$nom},\n\n";
$body_email .= "Voici votre lien personnel pour accéder aux commandes de votre orchestre et lancer la commande groupée pour le " . FESTIVAL_NOM . ".\n\n";
$body_email .= "Votre lien :\n{$lien}\n\n";
$body_email .= "Ce lien est personnel — conservez-le précieusement.\n\n";
$body_email .= "À bientôt,\nDFly";

festival_smtp_send($email, festival_ref($harmonie) . " — Votre lien responsable — " . FESTIVAL_NOM, $body_email, '', festival_cc());

exit(json_encode(['ok' => true]));
