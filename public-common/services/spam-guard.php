<?php
// Protection anti-spam partagée pour les endpoints publics (formulaire contact, devis…)

/**
 * Honeypot : si le champ piège (normalement invisible/vide pour un humain)
 * est rempli, on répond "ok" sans rien envoyer, pour ne pas alerter le bot.
 */
function spam_guard_honeypot(array $d, string $field = 'verif_interne_dfly') {
    if (!empty($d[$field])) {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    }
}

/**
 * Rate limiting simple par IP, basé sur des fichiers dans le dossier temporaire système.
 * $scope permet d'avoir des compteurs séparés par endpoint (ex: "contact", "devis").
 */
function spam_guard_rate_limit(string $scope, int $maxRequests = 5, int $windowSeconds = 600) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    $dir = sys_get_temp_dir() . '/dfly-rate-limit';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);

    $safeIp = preg_replace('/[^a-zA-Z0-9.:]/', '_', $ip);
    $file   = $dir . '/' . $scope . '-' . $safeIp . '.json';

    $now = time();
    $timestamps = [];
    if (is_file($file)) {
        $raw = @file_get_contents($file);
        $timestamps = $raw ? (json_decode($raw, true) ?: []) : [];
    }
    $timestamps = array_values(array_filter($timestamps, function ($t) use ($now, $windowSeconds) {
        return ($now - $t) < $windowSeconds;
    }));

    if (count($timestamps) >= $maxRequests) {
        http_response_code(429);
        exit(json_encode(["ok" => false, "error" => "Trop de requêtes, réessayez dans quelques minutes."]));
    }

    $timestamps[] = $now;
    @file_put_contents($file, json_encode($timestamps));
}

/**
 * Rejette silencieusement (comme le honeypot, aucun indice renvoyé sur la
 * règle testée) si la valeur contient un chiffre. Utilisé pour le prénom et
 * le nom, qui n'ont légitimement jamais de chiffre.
 */
function spam_guard_no_digits(string $value): void {
    if (preg_match('/[0-9]/', $value)) {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    }
}

/**
 * Rejette silencieusement si le téléphone (facultatif) contient une lettre.
 * Le champ HTML type="tel" n'impose aucun format, la validation se fait donc
 * ici : un vrai numéro ne contient que des chiffres, espaces, +, -, ( et ).
 */
function spam_guard_phone_no_letters(string $tel): void {
    if ($tel !== '' && preg_match('/\p{L}/u', $tel)) {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    }
}

/**
 * Rejette silencieusement le message s'il ressemble à du charabia généré :
 * - nombre de mots / longueur moyenne de mot improbable pour du langage
 *   humain (un texte réel en FR/EN fait en moyenne 4 à 6 caractères par mot ;
 *   un bloc unique très long, ou une moyenne anormalement élevée, ne l'est
 *   pas) ;
 * - absence de tout mot courant reconnu (FR/EN), délimité par des espaces ou
 *   de la ponctuation — pas une simple sous-chaîne.
 */
function spam_guard_message_plausible(string $message): void {
    static $commonWords = [
        // FR
        'le','la','les','de','des','du','un','une','et','je','tu','il','elle','nous','vous','ils','elles',
        'bonjour','merci','pour','avec','votre','vos','notre','nos','mon','ma','mes','au','aux',
        'projet','mariage','photo','photos','video','vidéo','devis','date','contact','cordialement',
        'suis','sommes','avons','avez','etre','être','est','sont','dans','sur','pas','plus','tres','très',
        'que','qui','quoi','comment','pourquoi','quand','ou','où','cette','ces','cet','bien','tout',
        'salut','bonsoir','svp','cher','chere','chère','disponible','possible','besoin','envie',
        // EN
        'the','and','you','your','for','with','hello','hi','hey','thanks','thank','please','wedding',
        'quote','regards','best','are','is','have','has','this','that','from','would','like','need',
    ];

    $reject = function () {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    };

    // mots = suites de lettres, séparées par tout ce qui n'est pas une lettre
    // (espace, ponctuation, chiffre...)
    $words = preg_split('/[^\p{L}]+/u', $message, -1, PREG_SPLIT_NO_EMPTY);
    $count = count($words);

    if ($count === 0) {
        $reject();
    }

    $lengths = array_map(function ($w) { return mb_strlen($w, 'UTF-8'); }, $words);
    $avgLen  = array_sum($lengths) / $count;
    $maxLen  = max($lengths);

    // valeurs improbables pour du texte humain (moyenne FR/EN ~4-6 caractères/mot)
    if ($avgLen > 12 || $maxLen > 25) {
        $reject();
    }

    $blob     = mb_strtolower($message, 'UTF-8');
    $wordsLow = preg_split('/[^a-zàâäéèêëïîôöùûüÿçœ]+/u', $blob, -1, PREG_SPLIT_NO_EMPTY);
    if (count(array_intersect($wordsLow, $commonWords)) < 1) {
        $reject();
    }
}
