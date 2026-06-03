<?php
/**
 * Copier en alphox-config.php UN NIVEAU AU-DESSUS de public_html (jamais dans public_html/).
 * Ex : /home/alphoxfr/alphox-config.php
 * Contient les credentials communs à tous les sites hébergés sur ce compte.
 * Ne jamais committer alphox-config.php dans le repo.
 */
return [

    // ── Base de données ────────────────────────────────────────────────────
    'db_host' => 'localhost',
    'db_user' => 'alphoxfr_user',
    'db_pass' => 'MOT_DE_PASSE_ICI',
    'db_port' => 3306,
    // db_name est défini dans chaque {appli}-config.php

    // ── SMTP ───────────────────────────────────────────────────────────────
    'smtp_host' => 'mail.alphox.fr',
    'smtp_port' => 465,
    'smtp_user' => 'contact@alphox.fr',
    'smtp_pass' => 'MOT_DE_PASSE_SMTP',
    'smtp_from' => 'contact@alphox.fr',
    'smtp_cc'   => 'contact@alphox.fr',

];
