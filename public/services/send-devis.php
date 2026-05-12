<?php
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["ok" => false]));
}

// ── Config SMTP (hors web root) ───────────────────────────────────────────────
$config_path = dirname($_SERVER['DOCUMENT_ROOT']) . '/dfly-smtp-config.php';
if (!file_exists($config_path)) {
    http_response_code(500);
    exit(json_encode(["ok" => false, "error" => "dfly-smtp-config.php introuvable"]));
}
$smtp = require $config_path;

// ── Données POST ──────────────────────────────────────────────────────────────
$raw = file_get_contents("php://input");
$d   = json_decode($raw, true);

if (!$d || empty($d['email'])) {
    http_response_code(400);
    exit(json_encode(["ok" => false, "error" => "Données manquantes"]));
}

$to           = filter_var($d['email'], FILTER_SANITIZE_EMAIL);
$prenom       = htmlspecialchars($d['prenom']      ?? '', ENT_QUOTES);
$nom          = htmlspecialchars($d['nom']         ?? '', ENT_QUOTES);
$tel          = htmlspecialchars($d['tel']         ?? '', ENT_QUOTES);
$demandes     = $d['demandes']     ?? '';
$reactionKey  = $d['reactionKey']  ?? '';
$intentionKey = $d['intentionKey'] ?? '';
$sims         = $d['simulations']  ?? [$d['simulation'] ?? []];
$lang         = strtoupper($d['lang'] ?? 'FR') === 'EN' ? 'EN' : 'FR';

// ── Traductions ───────────────────────────────────────────────────────────────
$tr = [
    'FR' => [
        'greeting'       => "Bonjour {prenom},",
        'contact'        => "VOS COORDONNÉES",
        'name'           => "Nom          :",
        'email'          => "Email        :",
        'phone'          => "Téléphone    :",
        'estimate_n'     => "Estimation",
        'format'         => "Format       :",
        'moments'        => "Moments      :",
        'price'          => "Estimation   :",
        'ttc'            => "TTC",
        'travel'         => "Déplacement  :",
        'roundtrip'      => "km A/R ->",
        'tolls'          => "€ + péages",
        'reaction_title' => "RÉACTION & DÉCISION",
        'budget'         => "Budget        :",
        'decision'       => "Intention     :",
        'special'        => "DEMANDES PARTICULIÈRES",
        'footer1'        => "Cette estimation est indicative.",
        'footer2'        => "Nous vous confirmons le devis définitif sous 48h.",
        'footer3'        => "Si vous ne recevez pas notre réponse, pensez à vérifier vos spams",
        'footer4'        => "et ajoutez contact@dfly.fr à vos contacts pour ne rien manquer.",
        'bye'            => "À très bientôt,",
        'studio'         => "DFly - Photographie & Film de mariage",
        'reaction' => [
            'oui'    => "Oui, tout à fait",
            'approx' => "C'est un peu au-dessus, mais je suis intéressé·e",
            'non'    => "C'est au-dessus de mon budget",
        ],
        'intention' => [
            'reserver'  => "Je souhaite réserver cette date",
            'discuter'  => "Je voudrais en discuter avant de décider",
            'reflechir' => "Je vais réfléchir",
        ],
        'subjects' => [
            'reserver'    => "Votre demande de devis - DFly Mariage",
            'discuter'    => "Votre demande de renseignement - DFly Mariage",
            'one'         => "Votre estimation - DFly Mariage",
            'multi'       => "Vos estimations - DFly Mariage",
        ],
        'sections' => [
            'reserver'    => "VOTRE DEMANDE DE DEVIS",
            'discuter'    => "VOTRE DEMANDE DE RENSEIGNEMENT",
            'one'         => "VOTRE ESTIMATION",
            'multi'       => "VOS ESTIMATIONS",
        ],
        'intros' => [
            'reserver'    => "Merci pour votre demande de devis. Voici le récapitulatif de votre session.",
            'discuter'    => "Merci pour votre message. Voici le récapitulatif de votre session.",
            'one'         => "Merci pour votre intérêt. Voici le récapitulatif de votre estimation.",
            'multi'       => "Merci pour votre intérêt. Voici le récapitulatif de vos estimations.",
        ],
    ],
    'EN' => [
        'greeting'       => "Hello {prenom},",
        'contact'        => "YOUR CONTACT DETAILS",
        'name'           => "Name         :",
        'email'          => "Email        :",
        'phone'          => "Phone        :",
        'estimate_n'     => "Estimate",
        'format'         => "Format       :",
        'moments'        => "Moments      :",
        'price'          => "Estimate     :",
        'ttc'            => "incl. VAT",
        'travel'         => "Travel       :",
        'roundtrip'      => "km round trip ->",
        'tolls'          => "€ + tolls",
        'reaction_title' => "FEEDBACK & DECISION",
        'budget'         => "Budget        :",
        'decision'       => "Decision      :",
        'special'        => "SPECIAL REQUESTS",
        'footer1'        => "This estimate is indicative.",
        'footer2'        => "We will confirm the final quote within 48h.",
        'footer3'        => "If you don't receive our reply, please check your spam folder",
        'footer4'        => "and add contact@dfly.fr to your contacts.",
        'bye'            => "See you soon,",
        'studio'         => "DFly - Wedding Photography & Film",
        'reaction' => [
            'oui'    => "Yes, absolutely",
            'approx' => "It's slightly above my budget, but I'm interested",
            'non'    => "It's above my budget",
        ],
        'intention' => [
            'reserver'  => "I'd like to book this date",
            'discuter'  => "I'd like to discuss before deciding",
            'reflechir' => "I'll think about it",
        ],
        'subjects' => [
            'reserver'    => "Your booking request - DFly Wedding",
            'discuter'    => "Your enquiry - DFly Wedding",
            'one'         => "Your estimate - DFly Wedding",
            'multi'       => "Your estimates - DFly Wedding",
        ],
        'sections' => [
            'reserver'    => "YOUR BOOKING REQUEST",
            'discuter'    => "YOUR ENQUIRY",
            'one'         => "YOUR ESTIMATE",
            'multi'       => "YOUR ESTIMATES",
        ],
        'intros' => [
            'reserver'    => "Thank you for your booking request. Here is a summary of your session.",
            'discuter'    => "Thank you for your message. Here is a summary of your session.",
            'one'         => "Thank you for your interest. Here is a summary of your estimate.",
            'multi'       => "Thank you for your interest. Here is a summary of your estimates.",
        ],
    ],
];

$T = $tr[$lang];
$count = count($sims);

// ── Objet, titre et intro selon intention et nb d'estimations ─────────────────
if ($intentionKey === 'reserver' || $intentionKey === 'discuter') {
    $subject      = $T['subjects'][$intentionKey];
    $sectionTitle = $T['sections'][$intentionKey];
    $intro        = $T['intros'][$intentionKey];
} elseif ($count > 1) {
    $subject      = $T['subjects']['multi'];
    $sectionTitle = $T['sections']['multi'] . " ({$count})";
    $intro        = $T['intros']['multi'];
} else {
    $subject      = $T['subjects']['one'];
    $sectionTitle = $T['sections']['one'];
    $intro        = $T['intros']['one'];
}

// ── Corps du mail ─────────────────────────────────────────────────────────────
$greeting = str_replace('{prenom}', $prenom, $T['greeting']);
$body  = "{$greeting}\n\n";
$body .= "{$intro}\n\n";
$body .= str_repeat("-", 40) . "\n";
$body .= $T['contact'] . "\n";
$body .= str_repeat("-", 40) . "\n\n";
$body .= $T['name'] . " {$prenom} {$nom}\n";
$body .= $T['email'] . " {$to}\n";
if ($tel) $body .= $T['phone'] . " {$tel}\n";
$body .= "\n";

$body .= str_repeat("-", 40) . "\n";
$body .= "{$sectionTitle}\n";
$body .= str_repeat("-", 40) . "\n";

foreach ($sims as $i => $sim) {
    $format  = htmlspecialchars($sim['format']  ?? '', ENT_QUOTES);
    $moments = htmlspecialchars($sim['moments'] ?? '', ENT_QUOTES);
    $price   = isset($sim['price']) ? number_format((float)$sim['price'], 0, ',', ' ') . ' €' : '';
    $travel  = $sim['travel'] ?? [];

    if ($count > 1) {
        $body .= "\n" . $T['estimate_n'] . " " . ($i + 1) . "\n";
    } else {
        $body .= "\n";
    }
    $body .= $T['format'] . " {$format}\n";
    if ($moments) $body .= $T['moments'] . " {$moments}\n";
    $body .= $T['price'] . " {$price} " . $T['ttc'] . "\n";

    if (!empty($travel['km']) && $travel['km'] > 0) {
        $km   = (int) $travel['km'];
        $cost = number_format((float) $travel['cost'], 0, ',', ' ');
        $body .= $T['travel'] . " {$km} " . $T['roundtrip'] . " {$cost} " . $T['tolls'] . "\n";
    }
}

$reactionLabel  = $T['reaction'][$reactionKey]   ?? '';
$intentionLabel = $T['intention'][$intentionKey]  ?? '';

if ($reactionLabel || $intentionLabel) {
    $body .= "\n" . str_repeat("-", 40) . "\n";
    $body .= $T['reaction_title'] . "\n";
    $body .= str_repeat("-", 40) . "\n\n";
    if ($reactionLabel)  $body .= $T['budget']   . " {$reactionLabel}\n";
    if ($intentionLabel) $body .= $T['decision']  . " {$intentionLabel}\n";
}

if ($demandes) {
    $body .= "\n" . str_repeat("-", 40) . "\n";
    $body .= $T['special'] . "\n";
    $body .= str_repeat("-", 40) . "\n\n";
    $body .= htmlspecialchars($demandes, ENT_QUOTES) . "\n";
}

$body .= "\n" . str_repeat("-", 40) . "\n\n";
$body .= $T['footer1'] . "\n";
$body .= $T['footer2'] . "\n\n";
$body .= $T['footer3'] . "\n";
$body .= $T['footer4'] . "\n\n";
$body .= $T['bye'] . "\n";
$body .= "Antoine & Rémi\n";
$body .= $T['studio'] . "\n";
$body .= "https://dfly.fr\n";

// ── Envoi SMTP (SSL port 465) ─────────────────────────────────────────────────
$result = smtp_send($smtp, $to, $body, $subject);
echo json_encode($result);

// ── Fonction SMTP ─────────────────────────────────────────────────────────────
function smtp_send(array $cfg, string $to, string $body, string $subject): array {
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $sock = @stream_socket_client(
        "ssl://{$cfg['host']}:{$cfg['port']}",
        $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT, $ctx
    );

    if (!$sock) {
        // Retry without peer verification (some shared hosts need this)
        $ctx2 = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        $sock = @stream_socket_client("ssl://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx2);
        if (!$sock) {
            return ["ok" => false, "error" => "Connexion SMTP échouée ({$errno}): {$errstr}"];
        }
    }

    stream_set_timeout($sock, 15);

    $read = function() use ($sock) {
        $out = '';
        while ($line = fgets($sock, 512)) {
            $out .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $out;
    };

    $cmd = function(string $c) use ($sock, $read) {
        fputs($sock, $c . "\r\n");
        return $read();
    };

    $read(); // greeting
    $cmd("EHLO {$cfg['host']}");
    $cmd("AUTH LOGIN");
    $cmd(base64_encode($cfg['user']));
    $auth = $cmd(base64_encode($cfg['pass']));

    if (strpos($auth, '235') === false) {
        fclose($sock);
        return ["ok" => false, "error" => "Auth SMTP échouée"];
    }

    $cmd("MAIL FROM:<{$cfg['from']}>");
    $cmd("RCPT TO:<{$to}>");
    $cmd("RCPT TO:<{$cfg['cc']}>");
    $cmd("DATA");

    $enc_subject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $message  = "From: DFly <{$cfg['from']}>\r\n";
    $message .= "To: {$to}\r\n";
    $message .= "Cc: {$cfg['cc']}\r\n";
    $message .= "Subject: {$enc_subject}\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "\r\n";
    $message .= chunk_split(base64_encode($body));
    $message .= "\r\n.";

    $res = $cmd($message);
    $cmd("QUIT");
    fclose($sock);

    return ["ok" => strpos($res, '250') !== false];
}
