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
$adresse  = trim($body['adresse'] ?? '');

if (!$harmonie || !in_array($harmonie, FESTIVAL_HARMONIES)) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
}
if (!$nom || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$adresse) {
    http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Données manquantes']));
}

[$link] = festival_db();
$row  = festival_get_row($link, $harmonie);
$data = $row['data'] ?? ['responsable' => null, 'commandes' => [], 'total' => 0.0];

$data['responsable'] = ['nom' => $nom, 'email' => $email, 'adresse' => $adresse];
festival_save_row($link, $harmonie, $data, $row ? $row['statut_global'] : 'ouvert');
mysqli_close($link);

exit(json_encode(['ok' => true]));
