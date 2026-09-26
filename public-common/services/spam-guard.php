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
 * Plausibilité du texte : rejette silencieusement (comme le honeypot, aucun
 * indice renvoyé sur la règle testée) si le texte ressemble à du charabia
 * généré plutôt qu'à du langage naturel. Protège contre les bots qui postent
 * des chaînes aléatoires tout en évitant le honeypot (champ caché non rempli).
 *
 * Contrairement à un simple "contient au moins un mot connu" (facilement
 * contourné en ajoutant un seul mot-clé au charabia), on exige qu'une grosse
 * majorité des "mots" du texte soient structurellement plausibles (pas de
 * chiffres, pas d'alternance de casse aléatoire, présence de voyelles...),
 * en plus d'un mot courant reconnu.
 */
function spam_guard_looks_human(string $text): void {
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

    $tokens = preg_split('/[^\p{L}\p{N}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
    $tokens = array_values(array_filter($tokens, function ($t) {
        return mb_strlen($t, 'UTF-8') >= 2;
    }));

    $reject = function () {
        http_response_code(200);
        exit(json_encode(["ok" => true]));
    };

    if (count($tokens) === 0) {
        $reject();
    }

    $plausible = 0;
    foreach ($tokens as $tok) {
        if (spam_guard_token_plausible($tok)) $plausible++;
    }
    $ratio = $plausible / count($tokens);

    $blob      = mb_strtolower($text, 'UTF-8');
    $wordsLow  = preg_split('/[^a-zàâäéèêëïîôöùûüÿçœ]+/u', $blob, -1, PREG_SPLIT_NO_EMPTY);
    $hasRealWord = count(array_intersect($wordsLow, $commonWords)) >= 1;

    if ($ratio < 0.7 || !$hasRealWord) {
        $reject();
    }
}

/**
 * Un "mot" est jugé structurellement plausible s'il n'a pas les
 * caractéristiques typiques d'une chaîne générée aléatoirement :
 * pas de chiffre mêlé aux lettres, pas d'alternance de casse en cours de
 * mot (type "aB1cD"), pas 4 consonnes d'affilée, au moins une voyelle,
 * longueur raisonnable.
 */
function spam_guard_token_plausible(string $token): bool {
    if (preg_match('/[0-9]/', $token)) return false;
    if (mb_strlen($token, 'UTF-8') > 20) return false;

    $rest = mb_substr($token, 1, null, 'UTF-8');
    if (preg_match('/[A-ZÀ-Ý]/u', $rest)) return false; // majuscule ailleurs qu'en 1re position

    if (!preg_match('/[aeiouyàâäéèêëïîôöùûüÿ]/ui', $token)) return false;
    if (preg_match('/[bcdfghjklmnpqrstvwxz]{4,}/ui', $token)) return false;

    return true;
}
