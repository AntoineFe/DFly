<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) {
    exit(json_encode([]));
}

$config_path = dirname($_SERVER['DOCUMENT_ROOT']) . '/smtp-config.php';
if (!file_exists($config_path)) {
    http_response_code(500);
    exit(json_encode(["error" => "config introuvable"]));
}
$cfg = require $config_path;

$token = $cfg['mapbox_token'] ?? '';
if (!$token) {
    http_response_code(500);
    exit(json_encode(["error" => "token manquant"]));
}

$url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
     . urlencode($q)
     . ".json?access_token=" . urlencode($token)
     . "&autocomplete=true&language=fr&country=fr&types=address,place,poi&limit=5";

$ctx = stream_context_create(['http' => ['timeout' => 5]]);
$body = @file_get_contents($url, false, $ctx);

if ($body === false) {
    exit(json_encode([]));
}

$data = json_decode($body, true);
$results = array_map(function($f) {
    return [
        'label'  => $f['place_name'],
        'coords' => ['lng' => $f['center'][0], 'lat' => $f['center'][1]],
    ];
}, $data['features'] ?? []);

echo json_encode($results);
