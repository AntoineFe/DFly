<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

list($link) = galerie_db();

$uid = (int)$session['userId'];
$res = mysqli_query($link, "
    SELECT DISTINCT E.id, E.shortDesc, E.raiSoc
    FROM Entreprise E
    INNER JOIN HabilProfil HP ON HP.idEnt = E.id
    INNER JOIN HabilProfilUser HPU ON HPU.idProfil = HP.id
    WHERE HPU.idUser = $uid
    ORDER BY E.raiSoc
");

$ents = [];
while ($r = mysqli_fetch_assoc($res)) $ents[] = $r;

mysqli_close($link);

echo json_encode(['ok' => true, 'ents' => $ents]);
