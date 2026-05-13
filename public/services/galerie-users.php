<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

list($link) = galerie_db();

$ent = trim($_GET['ent'] ?? '');
if ($ent === '') {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Paramètre ent manquant']));
}

$entEsc = mysqli_real_escape_string($link, $ent);
$sql = "SELECT DISTINCT HU.id, HU.firstName, HU.lastName, HU.email, HU.cle
        FROM HabilUsers HU
        INNER JOIN HabilProfilUser HPU ON HPU.idUser = HU.id
        INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
        INNER JOIN Entreprise E ON E.id = HP.idEnt
        WHERE E.shortDesc = '$entEsc'
        ORDER BY HU.lastName, HU.firstName";

$res = mysqli_query($link, $sql);
$users = [];
while ($row = mysqli_fetch_assoc($res)) {
    $users[] = $row;
}

mysqli_close($link);

echo json_encode(['ok' => true, 'users' => $users]);
