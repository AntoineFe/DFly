<?php
// Copier ce fichier en dfly-db-config.php UN NIVEAU AU-DESSUS du web root
// Ex : /home/alphoxfr/dfly-db-config.php   (serveur test alphox.fr)
//      /home/dflyfr/dfly-db-config.php      (serveur prod dfly.fr)
// Ne jamais committer dfly-db-config.php dans le repo.

// ── Détection automatique de l'environnement ──────────────────────────────────
// Reproduit la logique de mbInitEnv.php : on lit le chemin du répertoire courant
// pour distinguer le serveur de test (alphox.fr/dflyclaude) du serveur de prod (dfly.fr).

$cwd = getcwd();
$i   = strpos($cwd, 'public_html');

if ($i !== false) {
    $afterHtml = substr($cwd, $i + 11); // ce qui suit "public_html"
    if (strpos($afterHtml, '/dflyclaude') === 0 || strpos($afterHtml, '/dfly_dev') === 0) {
        $env = 'dev';
    } else {
        $env = 'prd';
    }
} else {
    // Fallback : si pas de public_html dans le chemin, on est probablement en prod
    $env = 'prd';
}

// ── Configurations par environnement ─────────────────────────────────────────

$configs = [

    'dev' => [
        'host'   => 'localhost',
        'user'   => 'alphoxfr_alphox',
        'pass'   => 'MOT_DE_PASSE_ICI',
        'dbname' => 'alphoxfr_dfly_dev',
        'port'   => 3306,
    ],

    'prd' => [
        'host'   => 'localhost',
        'user'   => 'MOT_UTILISATEUR_PROD',
        'pass'   => 'MOT_DE_PASSE_PROD',
        'dbname' => 'alphoxfr_dfly_prd',
        'port'   => 3306,
    ],

];

return $configs[$env];
