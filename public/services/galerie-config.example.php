<?php
/**
 * Copier ce fichier en galerie-config.php (hors git) et adapter les valeurs.
 * Ce fichier est le modèle versionné — ne jamais y mettre de vraies credentials.
 */
return [

    // ── Base de données ────────────────────────────────────────────────────
    'db_host'   => 'localhost',
    'db_user'   => 'votre_user_mysql',
    'db_pass'   => 'votre_mot_de_passe',
    'db_name'   => 'votre_base',
    'db_port'   => 3306,

    // ── Stockage fichiers ──────────────────────────────────────────────────
    // Chemin absolu du dossier racine contenant les sous-dossiers par entreprise
    // Ex : /home/alphoxfr/public_html/photos_store
    'pro_root'  => '/chemin/absolu/vers/photos_store',

    // URL publique correspondante (sans slash final)
    // Ex : https://photos.alphox.fr/photos_store
    'pro_url'   => 'https://votre-domaine.fr/photos_store',

    // ── Application ───────────────────────────────────────────────────────
    'app_name'    => 'Galerie',           // Ex : 'DFly' ou 'Photos H&A'
    'app_tagline' => '',                  // Ex : 'Photographie · Vidéo'
    'app_url'     => 'https://votre-domaine.fr',  // URL du site parent (clic logo)
    'app_base'    => '/galerie',          // Chemin de base de l'appli React

    // ── Emails ────────────────────────────────────────────────────────────
    'smtp_host'   => 'smtp.votre-fournisseur.fr',
    'smtp_port'   => 465,
    'smtp_user'   => 'expediteur@votre-domaine.fr',
    'smtp_pass'   => 'votre_mot_de_passe_smtp',
    'smtp_from'   => 'expediteur@votre-domaine.fr',
    'smtp_cc'     => 'admin@votre-domaine.fr',    // Copie des demandes inconnues

    'email_sign'  => 'L\'équipe',         // Ex : 'Antoine & Rémi' ou 'Antoine & Hélène'
    'email_site'  => 'https://votre-domaine.fr',

    // ── Logs ──────────────────────────────────────────────────────────────
    // Dossier de logs (doit être accessible en écriture, idéalement hors public_html)
    'log_dir'     => '/chemin/absolu/vers/logs',

];
