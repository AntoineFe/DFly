<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// Lit la liste des galeries publiques depuis le fichier JSON voisin.
// Ce fichier JSON est éditable directement sur le serveur pour ajouter / retirer des événements.
$jsonFile = __DIR__ . '/galerie-public-events.json';
if (!file_exists($jsonFile)) {
    exit(json_encode(['ok' => true, 'events' => []]));
}
$events = json_decode(file_get_contents($jsonFile), true);
if (!is_array($events)) $events = [];

exit(json_encode(['ok' => true, 'events' => $events]));
