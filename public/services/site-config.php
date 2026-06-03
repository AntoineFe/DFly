<?php
/**
 * Charge alphox-config.php depuis hors public_html.
 * Usage : $cfg = site_load_config();
 */
function site_load_config(): array {
    $dirs = [
        dirname($_SERVER['DOCUMENT_ROOT']),
        dirname(dirname($_SERVER['DOCUMENT_ROOT'])),
    ];
    foreach ($dirs as $dir) {
        $p = $dir . '/alphox-config.php';
        if (file_exists($p)) return require $p;
    }
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'alphox-config.php introuvable']));
}
