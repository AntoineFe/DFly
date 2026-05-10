<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';
$session = galerie_require_auth();

$body            = json_decode(file_get_contents('php://input'), true);
$currentPassword = trim($body['currentPassword'] ?? '');
$newPassword     = trim($body['newPassword']     ?? '');

if ($currentPassword === '' || $newPassword === '') {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Paramètres manquants']));
}
if (strlen($newPassword) < 8) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Le nouveau mot de passe doit contenir au moins 8 caractères']));
}

list($link) = galerie_db();

$uid     = (int)$session['userId'];
$hashCur = hash('sha256', $currentPassword);

$res = mysqli_query($link, "SELECT id FROM HabilUsers WHERE id = $uid AND password = '$hashCur'");
if (!$res || mysqli_num_rows($res) === 0) {
    mysqli_close($link);
    http_response_code(401);
    exit(json_encode(['ok' => false, 'error' => 'Mot de passe actuel incorrect']));
}

$hashNew = hash('sha256', $newPassword);
mysqli_query($link, "UPDATE HabilUsers SET password = '$hashNew' WHERE id = $uid");
mysqli_close($link);

echo json_encode(['ok' => true]);
