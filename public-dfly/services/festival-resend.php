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
$numero = trim($body['numero'] ?? '');

if (!preg_match('/^FESMUS-\d{4}-\d{4}$/', $numero)) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Numéro invalide']));
}

list($link) = festival_db();
$res = mysqli_query($link, "SELECT id, harmonie, statut_global, data FROM festival_commandes_groupees");
$cmd = null;
while ($row = mysqli_fetch_assoc($res)) {
    $data = json_decode($row['data'], true);
    foreach ($data['commandes'] as $c) {
        if ($c['numero'] === $numero) { $cmd = $c; break 2; }
    }
}
mysqli_close($link);

if (!$cmd) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Commande introuvable'])); }
if ($cmd['statut'] !== 'en_attente') { http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Commande déjà confirmée'])); }

$token = $cmd['token'] ?? '';
if (!$token) { http_response_code(500); exit(json_encode(['ok' => false, 'error' => 'Token manquant'])); }

$nom   = $cmd['nom'];
$email = $cmd['email'];
$recap = festival_format_recap($cmd);
$sous_total = festival_calcul_sous_total($cmd['produits']);
$lien_confirm = 'https://dfly.fr/commande-festival-faucigny-2026?confirmer=' . urlencode($token);
$lien_modif   = 'https://dfly.fr/commande-festival-faucigny-2026?numero=' . urlencode($numero);

$body_email  = "Bonjour {$nom},\n\n";
$body_email .= "Voici un rappel pour valider votre commande {$numero} pour le " . FESTIVAL_NOM . ".\n\n";
$body_email .= "Récapitulatif :\n{$recap}\n";
$body_email .= "Total hors frais de port : " . number_format($sous_total, 2, ',', ' ') . " €\n\n";
$body_email .= festival_note_port($cmd['produits']) . "\n\n";
$body_email .= "Pour valider définitivement votre commande, cliquez sur ce lien :\n{$lien_confirm}\n\n";
$body_email .= "Tant que vous n'avez pas cliqué sur ce lien, votre commande reste en attente et ne sera pas prise en compte.\n\n";
$body_email .= "Pour modifier ou annuler votre commande :\n{$lien_modif}\n\n";
$body_email .= "À bientôt,\nDFly";

festival_smtp_send($email, "Rappel : confirmez votre commande — " . FESTIVAL_NOM, $body_email, '', festival_cc());

exit(json_encode(['ok' => true]));
