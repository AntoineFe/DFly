<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit(json_encode(['ok' => false])); }

require __DIR__ . '/festival-common.php';

$body    = json_decode(file_get_contents('php://input'), true) ?? [];
$harmonie = trim($body['harmonie'] ?? '');
$nom      = trim($body['nom']     ?? '');
$email    = trim($body['email']   ?? '');
$tel      = trim($body['tel']   ?? '');
$rue      = trim($body['rue']   ?? '');
$cp       = trim($body['cp']    ?? '');
$ville    = trim($body['ville'] ?? '');

if (!$harmonie || !in_array($harmonie, FESTIVAL_HARMONIES)) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
}
if (!$nom || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$rue || !$cp || !$ville) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Données manquantes']));
}

list($link) = festival_db();
$row  = festival_get_row($link, $harmonie);
$data = $row['data'] ?? ['responsable' => null, 'commandes' => [], 'total' => 0.0];

$adresse = "{$rue}\n{$cp} {$ville}";
$data['responsable'] = ['nom' => $nom, 'email' => $email, 'tel' => $tel, 'rue' => $rue, 'cp' => $cp, 'ville' => $ville, 'adresse' => $adresse, 'token' => bin2hex(random_bytes(16)), 'confirme' => false];
festival_save_row($link, $harmonie, $data, $row ? $row['statut_global'] : 'ouvert');
mysqli_close($link);

$token = $data['responsable']['token'];
$lien  = 'https://dfly.fr/commande-festival-faucigny-2026?responsable=' . urlencode($token);
$body_email  = "Bonjour {$nom},\n\n";
$body_email .= "Vous avez été désigné(e) comme contact pour la livraison groupée de votre orchestre pour le " . FESTIVAL_NOM . ".\n\n";
$body_email .= "Pour confirmer votre adresse email et accéder à la vue des commandes de votre orchestre, cliquez sur ce lien :\n{$lien}\n\n";
$body_email .= "Ce lien est personnel — conservez-le précieusement. Il vous permettra de visualiser les commandes et de lancer la commande groupée auprès de DFly.\n\n";
$body_email .= "À bientôt,\nDFly";

festival_smtp_send($email, festival_ref($harmonie) . " — Confirmation contact livraison — " . FESTIVAL_NOM, $body_email, '', festival_cc());

exit(json_encode(['ok' => true]));
