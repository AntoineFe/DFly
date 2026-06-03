<?php
/**
 * Copier en alphox-config.php UN NIVEAU AU-DESSUS de public_html (jamais dans public_html/).
 * Ex : /home/alphoxfr/alphox-config.php
 * Contient uniquement les credentials de base de données communs à tous les sites du compte.
 * Ne jamais committer alphox-config.php dans le repo.
 */
return [
    'db_host' => 'localhost',
    'db_user' => 'alphoxfr_user',
    'db_pass' => 'MOT_DE_PASSE_ICI',
    'db_port' => 3306,
];
