<?php
/**
 * Copier en galerie-config.php UN NIVEAU AU-DESSUS de public_html (jamais dans public_html/).
 * Ex : /home/alphoxfr/galerie-config.php
 * Inclut {site}-config.php pour les credentials, puis surcharge avec les valeurs galerie.
 * Ne jamais committer galerie-config.php dans le repo.
 */
$site = require __DIR__ . '/alphox-config.php';   // ← adapter selon le site hôte
return array_merge($site, [

    // ── Base de données (surcharge db_name) ───────────────────────────────
    'db_name'     => 'alphoxfr_dfly_prod',

    // ── Stockage fichiers ──────────────────────────────────────────────────
    'pro_root'    => '/home/alphoxfr/public_html/dfly/images/Pro',
    'pro_url'     => '/images/Pro',

    // ── Application ───────────────────────────────────────────────────────
    'app_name'    => 'DFly',
    'app_tagline' => 'Photographie · Vidéo',
    'app_url'     => 'https://dfly.fr',
    'app_base'    => '/galerie',

    // ── Emails ────────────────────────────────────────────────────────────
    'email_sign'  => 'Antoine & Rémi',
    'email_site'  => 'https://dfly.fr',

    // ── Logs ──────────────────────────────────────────────────────────────
    'log_dir'     => '/home/alphoxfr/dfly-logs',

]);
