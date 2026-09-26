<?php
// Protection anti-spam partagée pour les endpoints publics (formulaire contact, devis…)

/**
 * Honeypot : si le champ piège (normalement invisible/vide pour un humain)
 * est rempli, on répond "ok" sans rien envoyer, pour ne pas alerter le bot.
 */
function spam_guard_honeypot(array $d, string $field = 'societe') {
    if (!empty($d[$field])) {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    }
}

/**
 * Rate limiting simple par IP, basé sur des fichiers dans le dossier temporaire système.
 * $scope permet d'avoir des compteurs séparés par endpoint (ex: "contact", "devis").
 */
function spam_guard_rate_limit(string $scope, int $maxRequests = 5, int $windowSeconds = 600) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $dir = sys_get_temp_dir() . '/dfly-rate-limit';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);

    $safeIp = preg_replace('/[^a-zA-Z0-9.:]/', '_', $ip);
    $file   = $dir . '/' . $scope . '-' . $safeIp . '.json';

    $now = time();
    $timestamps = [];
    if (is_file($file)) {
        $raw = @file_get_contents($file);
        $timestamps = $raw ? (json_decode($raw, true) ?: []) : [];
    }
    $timestamps = array_values(array_filter($timestamps, function ($t) use ($now, $windowSeconds) {
        return ($now - $t) < $windowSeconds;
    }));

    if (count($timestamps) >= $maxRequests) {
        http_response_code(429);
        exit(json_encode(["ok" => false, "error" => "Trop de requêtes, réessayez dans quelques minutes."]));
    }

    $timestamps[] = $now;
    @file_put_contents($file, json_encode($timestamps));
}
