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
 * Plausibilité du texte : rejette si le texte fourni ne contient aucun mot
 * courant reconnu (FR/EN). Protège contre les bots qui postent du charabia
 * aléatoire tout en évitant le honeypot (champ caché non rempli).
 *
 * Contrairement au honeypot, un vrai humain pourrait théoriquement déclencher
 * ce contrôle (message très court, langue rare) : on renvoie donc une vraie
 * erreur plutôt qu'un faux succès, pour ne jamais faire disparaître un
 * message légitime sans que la personne ne le sache.
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

    $blob  = mb_strtolower($text, 'UTF-8');
    $words = preg_split('/[^a-zàâäéèêëïîôöùûüÿçœ]+/u', $blob, -1, PREG_SPLIT_NO_EMPTY);

    if (count(array_intersect($words, $commonWords)) < 1) {
        http_response_code(400);
        exit(json_encode(["ok" => false, "error" => "Merci de rédiger un message avec quelques mots (pas seulement des caractères aléatoires)."]));
    }
}
