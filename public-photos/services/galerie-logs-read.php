<?php
header('Content-Type: application/json');

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

$cfg      = galerie_load_config();
$log_dir  = $cfg['log_dir'] ?? (dirname($_SERVER['DOCUMENT_ROOT']) . '/dfly-logs');

$log_file = $log_dir . '/navigation.log';
$old_file = $log_dir . '/navigation.old.log';

function parse_log_file($path) {
    if (!file_exists($path)) return [];
    $content = @file_get_contents($path);
    if ($content === false) return [];
    $result = [];
    foreach (explode("\n", $content) as $line) {
        $line = trim($line);
        if ($line === '') continue;
        // [2026-05-13 14:32:01] Marie Dupont | /mariage | 88.123.x.x
        if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/', $line, $m)) {
            $result[] = ['ts' => $m[1], 'user' => $m[2], 'url' => $m[3], 'ip' => $m[4]];
        }
    }
    return $result;
}

$lines = array_merge(parse_log_file($log_file), parse_log_file($old_file));

// Sort by timestamp descending
usort($lines, function($a, $b) { return strcmp($b['ts'], $a['ts']); });

echo json_encode(['ok' => true, 'lines' => array_values($lines)]);
