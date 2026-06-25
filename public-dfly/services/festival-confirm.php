<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$body  = json_decode(file_get_contents('php://input'), true) ?? [];
$token = trim($body['token'] ?? '');

if (!$token) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Token manquant'])); }

list($link) = festival_db();
$res = mysqli_query($link, "SELECT id, harmonie, statut_global, data FROM festival_commandes_groupees");
$targetRow = null; $targetIdx = null;
while ($row = mysqli_fetch_assoc($res)) {
    $data = json_decode($row['data'], true);
    foreach ($data['commandes'] as $i => $cmd) {
        if (($cmd['token'] ?? '') === $token) {
            $targetRow = $row; $targetRow['data'] = $data; $targetIdx = $i; break 2;
        }
    }
}

if (!$targetRow) { mysqli_close($link); http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Lien invalide ou déjà utilisé'])); }

$data = $targetRow['data'];
$cmd  = $data['commandes'][$targetIdx];

if ($cmd['statut'] === 'en_cours') {
    mysqli_close($link);
    exit(json_encode(['ok' => true, 'deja_confirme' => true, 'numero' => $cmd['numero']]));
}

$data['commandes'][$targetIdx]['statut'] = 'en_cours';
$data['total'] = array_sum(array_column(
    array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; }), 'total'
));

festival_save_row($link, $targetRow['harmonie'], $data, $targetRow['statut_global']);
mysqli_close($link);

// Email de confirmation
$nom   = $cmd['nom'];
$email = $cmd['email'];
$numero = $cmd['numero'];
$lien_modif = 'https://dfly.fr/commande-festival-faucigny-2026?numero=' . urlencode($numero);
$recap = festival_format_recap($cmd);
$sous_total = festival_calcul_sous_total($cmd['produits']);
$body_email  = "Bonjour {$nom},\n\n";
$body_email .= "Votre commande {$numero} pour le " . FESTIVAL_NOM . " a bien été confirmée.\n\n";
$body_email .= "Récapitulatif :\n{$recap}\n";
$body_email .= "Total hors frais de port : " . number_format($sous_total, 2, ',', ' ') . " €\n\n";
$body_email .= festival_note_port($cmd['produits']) . "\n\n";
$body_email .= "Votre commande sera expédiée dès qu'un responsable de votre orchestre se sera désigné et aura effectué le virement groupé.\n\n";
$body_email .= "Pour modifier ou annuler votre commande :\n{$lien_modif}\n\n";
$body_email .= "À bientôt,\nDFly";

festival_smtp_send($email, festival_ref($targetRow['harmonie']) . " — Commande confirmée — " . FESTIVAL_NOM, $body_email, '', festival_cc());

exit(json_encode(['ok' => true, 'numero' => $numero]));
