<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) {
    exit(json_encode([]));
}

$url = "https://photon.komoot.io/api/?q=" . urlencode($q)
     . "&lang=fr&limit=6&lat=43.6&lon=6.9";

$ctx = stream_context_create(['http' => ['timeout' => 5]]);
$body = @file_get_contents($url, false, $ctx);

if ($body === false) {
    exit(json_encode([]));
}

$data = json_decode($body, true);
$results = array_map(function($f) {
    $p = $f['properties'];
    $parts = array_filter([
        $p['name']    ?? null,
        $p['street']  ?? null,
        $p['city']    ?? ($p['town'] ?? ($p['village'] ?? null)),
        $p['postcode'] ?? null,
        $p['country'] ?? null,
    ]);
    return [
        'label'  => implode(', ', $parts),
        'coords' => ['lng' => $f['geometry']['coordinates'][0], 'lat' => $f['geometry']['coordinates'][1]],
    ];
}, $data['features'] ?? []);

echo json_encode($results);
