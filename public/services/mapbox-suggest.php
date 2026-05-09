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
    exit(json_encode(["error" => "config introuvable", "path" => $config_path]));
}
$cfg = require $config_path;

$token = $cfg['mapbox_token'] ?? '';
if (!$token) {
    http_response_code(500);
    exit(json_encode(["error" => "token manquant", "path" => $config_path]));
}

$url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
     . urlencode($q)
     . ".json?access_token=" . urlencode($token)
     . "&autocomplete=true&language=fr&country=fr"
     . "&types=poi,place,locality,address"
     . "&proximity=6.9,43.6"
     . "&limit=6";

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
