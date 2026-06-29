<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require 'galerie-auth.php';

list($db, $cfg) = galerie_db();

// Récupère tous les utilisateurs marqués is_public = 1 avec la raison sociale de leur entreprise
$res = mysqli_query($db, "
    SELECT U.cle, E.raiSoc
    FROM HabilUsers U
    INNER JOIN Entreprise E ON E.id = U.idEnt
    WHERE U.is_public = 1
    ORDER BY E.raiSoc
");
mysqli_close($db);

$appUrl  = rtrim($cfg['app_url'], '/');
$appBase = $cfg['app_base'] ?? '/galerie';

$events = [];
if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        $events[] = [
            'label' => $row['raiSoc'],
            'url'   => $appUrl . $appBase . '?cle=' . urlencode($row['cle']),
        ];
    }
}

exit(json_encode(['ok' => true, 'events' => $events]));
