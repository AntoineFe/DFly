<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$logFile = __DIR__ . '/arparla_log.csv';

if (!file_exists($logFile)) {
    file_put_contents($logFile, "date,heure,evenement,lieu,appareil,visiteur\n");
}

$event = isset($_POST['event'])    ? htmlspecialchars($_POST['event'])   : 'visit';
$vid   = isset($_POST['vid'])      ? htmlspecialchars($_POST['vid'])     : 'inconnu';

$ua     = $_SERVER['HTTP_USER_AGENT'] ?? '';
$device = 'Desktop';
if (preg_match('/Mobile|Android|iPhone/i', $ua)) $device = 'Mobile';
elseif (preg_match('/iPad|Tablet/i', $ua))        $device = 'Tablette';

$ip  = $_SERVER['REMOTE_ADDR'] ?? '';
$geo = @file_get_contents("http://ip-api.com/json/{$ip}?fields=country,city&lang=fr");
$lieu = $ip;
if ($geo) {
    $data = json_decode($geo, true);
    if (!empty($data['city']) && !empty($data['country'])) {
        $lieu = $ip . ' - ' . $data['city'] . ' (' . $data['country'] . ')';
    }
}

$line = date('d/m/Y') . ',' . date('H:i:s') . ',' . $event . ',' . $lieu . ',' . $device . ',' . $vid . "\n";
file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);

echo json_encode(['ok' => true]);
?>
