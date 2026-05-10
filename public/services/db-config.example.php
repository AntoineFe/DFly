<?php
// Copier ce fichier en db-config.php UN NIVEAU AU-DESSUS du web root
// Ex : /home/alphoxfr/db-config.php   (serveur test alphox.fr)
//      /home/dflyfr/db-config.php      (serveur prod dfly.fr)
// Ne jamais committer db-config.php dans le repo.

// ── Détection automatique de l'environnement ──────────────────────────────────
// Reproduit la logique de mbInitEnv.php : on lit le chemin du répertoire courant
// pour distinguer le serveur de test (alphox.fr/dflyclaude) du serveur de prod (dfly.fr).

$cwd = getcwd();
$i   = strpos($cwd, 'public_html');

if ($i !== false) {
    $afterHtml = substr($cwd, $i + 11); // ce qui suit "public_html"
    if (str_starts_with($afterHtml, '/dflyclaude') || str_starts_with($afterHtml, '/dfly_dev')) {
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
        'host'            => 'localhost',
        'user'            => 'alphoxfr_alphox',
        'pass'            => 'MOT_DE_PASSE_ICI',
        'dbname'          => 'alphoxfr_dfly_dev',
        'port'            => 3306,
        'galerie_root'    => '/home/alphoxfr/public_html/dflyclaude/galerie',
        'thumbnails_root' => '/home/alphoxfr/public_html/dflyclaude/galerie_thumbnails',
        'galerie_url'     => '/dflyclaude/galerie',
        'thumbnails_url'  => '/dflyclaude/galerie_thumbnails',
    ],

    'prd' => [
        'host'            => 'localhost',
        'user'            => 'MOT_UTILISATEUR_PROD',
        'pass'            => 'MOT_DE_PASSE_PROD',
        'dbname'          => 'alphoxfr_dfly_prd',
        'port'            => 3306,
        'galerie_root'    => '/home/dflyfr/public_html/galerie',
        'thumbnails_root' => '/home/dflyfr/public_html/galerie_thumbnails',
        'galerie_url'     => '/galerie',
        'thumbnails_url'  => '/galerie_thumbnails',
    ],

];

return $configs[$env];
