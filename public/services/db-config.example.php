<?php
// Copier ce fichier en db-config.php UN NIVEAU AU-DESSUS du web root
// Ex : /home/user/db-config.php  (jamais dans public_html/)
// Ne jamais committer db-config.php dans le repo.

return [
    'host'   => 'localhost',
    'user'   => 'alphoxfr_alphox',
    'pass'   => 'MOT_DE_PASSE_ICI',
    'dbname' => 'alphoxfr_dfly_prd',
    'port'   => 3306,
    // Chemin absolu vers la racine des galeries (sans slash final)
    // Ex : /home/alphoxfr/public_html/galerie
    'galerie_root'     => '/home/alphoxfr/public_html/galerie',
    'thumbnails_root'  => '/home/alphoxfr/public_html/galerie_thumbnails',
    // URL publique correspondante
    'galerie_url'      => '/galerie',
    'thumbnails_url'   => '/galerie_thumbnails',
];
