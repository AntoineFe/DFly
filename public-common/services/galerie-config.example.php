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
    'smtp_host'   => 'mail.dfly.fr',
    'smtp_port'   => 465,
    'smtp_user'   => 'contact@dfly.fr',
    'smtp_pass'   => 'MOT_DE_PASSE_SMTP',
    'smtp_from'   => 'contact@dfly.fr',
    'smtp_cc'     => 'contact@dfly.fr',

    'email_sign'  => 'Antoine & Rémi',
    'email_site'  => 'https://dfly.fr',

    // ── Logs ──────────────────────────────────────────────────────────────
    'log_dir'     => '/home/alphoxfr/dfly-logs',

]);
