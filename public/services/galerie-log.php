<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['ok' => false]));
}

$body = json_decode(file_get_contents('php://input'), true);
$url  = trim($body['url'] ?? '');

if (!$url) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'url manquante']));
}

require_once __DIR__ . '/galerie-auth.php';

$cfg = galerie_load_config(true);

// Try to identify user from Bearer token (best-effort, never aborts the logging)
$userName = 'Anonyme';
$header   = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($cfg && preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
    $link = @mysqli_connect($cfg['db_host'], $cfg['db_user'], $cfg['db_pass'], $cfg['db_name'], $cfg['db_port'] ?? 3306);
    if ($link) {
        mysqli_set_charset($link, 'utf8mb4');
        $t   = mysqli_real_escape_string($link, $m[1]);
        $sql = "SELECT HU.firstName, HU.lastName
                FROM HabilSessions HS
                INNER JOIN HabilUsers HU ON HU.id = HS.userId
                WHERE HS.token = '$t'
                  AND HS.tsCloseSession IS NULL
                  AND HS.tsLastAccess > DATE_SUB(NOW(), INTERVAL 8 HOUR)
                LIMIT 1";
        $res = mysqli_query($link, $sql);
        if ($res && mysqli_num_rows($res) > 0) {
            $row      = mysqli_fetch_assoc($res);
            $userName = trim($row['firstName'] . ' ' . $row['lastName']);
        }
        mysqli_close($link);
    }
}

// IP — prefer X-Forwarded-For when behind a proxy
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '?';
$ip = trim(explode(',', $ip)[0]);

$log_dir = $cfg['log_dir'] ?? (dirname($_SERVER['DOCUMENT_ROOT']) . '/dfly-logs');
if (!is_dir($log_dir)) @mkdir($log_dir, 0755, true);

$log_file = $log_dir . '/navigation.log';
$old_file = $log_dir . '/navigation.old.log';

// Rotation: if log exceeds 5 MB
if (file_exists($log_file) && filesize($log_file) > 5 * 1024 * 1024) {
    if (file_exists($old_file)) @unlink($old_file);
    @rename($log_file, $old_file);
    @file_put_contents($log_file, '');
}

$line = '[' . date('Y-m-d H:i:s') . '] ' . $userName . ' | ' . $url . ' | ' . $ip . PHP_EOL;
@file_put_contents($log_file, $line, FILE_APPEND | LOCK_EX);

echo json_encode(['ok' => true]);
