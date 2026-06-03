<?php
/**
 * Copier en photos-config.php UN NIVEAU AU-DESSUS de public_html (jamais dans public_html/).
 * Ex : /home/alphoxfr/photos-config.php
 * Déploiement galerie pour photos.alphox.fr
 * Ne jamais committer photos-config.php dans le repo.
 */
$site = require __DIR__ . '/alphox-config.php';
return array_merge($site, [

    // ── Base de données (surcharge db_name) ───────────────────────────────
    'db_name'     => 'alphoxfr_photos',

    // ── Stockage fichiers ──────────────────────────────────────────────────
    'pro_root'    => '/home/alphoxfr/public_html/photos/images/Pro',
    'pro_url'     => '/images/Pro',

    // ── Application ───────────────────────────────────────────────────────
    'app_name'    => 'Photos',
    'app_tagline' => '',
    'app_url'     => 'https://alphox.fr',
    'app_base'    => '/photos',

    // ── Emails ────────────────────────────────────────────────────────────
    'email_sign'  => 'Antoine & Hélène',
    'email_site'  => 'https://alphox.fr',

    // ── Logs ──────────────────────────────────────────────────────────────
    'log_dir'     => '/home/alphoxfr/photos-logs',

]);
