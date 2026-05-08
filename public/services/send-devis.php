<?php
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["ok" => false]));
}

// ── Config SMTP (hors web root) ───────────────────────────────────────────────
$config_path = dirname($_SERVER['DOCUMENT_ROOT']) . '/smtp-config.php';
if (!file_exists($config_path)) {
    http_response_code(500);
    exit(json_encode(["ok" => false, "error" => "smtp-config.php introuvable"]));
}
$smtp = require $config_path;

// ── Données POST ──────────────────────────────────────────────────────────────
$raw = file_get_contents("php://input");
$d   = json_decode($raw, true);

if (!$d || empty($d['email'])) {
    http_response_code(400);
    exit(json_encode(["ok" => false, "error" => "Données manquantes"]));
}

$to     = filter_var($d['email'], FILTER_SANITIZE_EMAIL);
$prenom = htmlspecialchars($d['prenom']   ?? '', ENT_QUOTES);
$nom    = htmlspecialchars($d['nom']      ?? '', ENT_QUOTES);
$tel    = htmlspecialchars($d['tel']      ?? '', ENT_QUOTES);
$demandes  = $d['demandes']  ?? '';
$reaction  = $d['reaction']  ?? '';
$intention = $d['intention'] ?? '';
$sims      = $d['simulations'] ?? [$d['simulation'] ?? []];

// ── Corps du mail ─────────────────────────────────────────────────────────────
$body  = "Bonjour {$prenom},\n\n";
$body .= "Merci pour votre demande. Voici le récapitulatif de votre session.\n\n";
$body .= str_repeat("-", 40) . "\n";
$body .= "VOS COORDONNÉES\n";
$body .= str_repeat("-", 40) . "\n\n";
$body .= "Nom          : {$prenom} {$nom}\n";
$body .= "Email        : {$to}\n";
if ($tel) $body .= "Téléphone    : {$tel}\n";
$body .= "\n";

$count = count($sims);
$body .= str_repeat("-", 40) . "\n";
$body .= ($count > 1 ? "VOS ESTIMATIONS ({$count})" : "VOTRE DEVIS ESTIMATIF") . "\n";
$body .= str_repeat("-", 40) . "\n";

foreach ($sims as $i => $sim) {
    $format  = htmlspecialchars($sim['format']  ?? '', ENT_QUOTES);
    $moments = htmlspecialchars($sim['moments'] ?? '', ENT_QUOTES);
    $price   = isset($sim['price']) ? number_format((float)$sim['price'], 0, ',', ' ') . ' €' : '';
    $travel  = $sim['travel'] ?? [];

    if ($count > 1) {
        $body .= "\nEstimation " . ($i + 1) . "\n";
    } else {
        $body .= "\n";
    }
    $body .= "Format       : {$format}\n";
    if ($moments) $body .= "Moments      : {$moments}\n";
    $body .= "Estimation   : {$price} TTC\n";

    if (!empty($travel['km']) && $travel['km'] > 0) {
        $km   = (int) $travel['km'];
        $cost = number_format((float) $travel['cost'], 0, ',', ' ');
        $body .= "Déplacement  : {$km} km A/R -> {$cost} € + péages\n";
    }
}

if ($reaction || $intention) {
    $body .= "\n" . str_repeat("-", 40) . "\n";
    $body .= "RÉACTION & DÉCISION\n";
    $body .= str_repeat("-", 40) . "\n\n";
    if ($reaction)  $body .= "Budget        : " . htmlspecialchars($reaction,  ENT_QUOTES) . "\n";
    if ($intention) $body .= "Intention     : " . htmlspecialchars($intention, ENT_QUOTES) . "\n";
}

if ($demandes) {
    $body .= "\n" . str_repeat("-", 40) . "\n";
    $body .= "DEMANDES PARTICULIÈRES\n";
    $body .= str_repeat("-", 40) . "\n\n";
    $body .= htmlspecialchars($demandes, ENT_QUOTES) . "\n";
}

$body .= "\n" . str_repeat("-", 40) . "\n\n";
$body .= "Cette estimation est indicative.\n";
$body .= "Nous vous confirmons le devis définitif sous 48h.\n\n";
$body .= "Si vous ne recevez pas notre réponse, pensez à vérifier vos spams\n";
$body .= "et ajoutez contact@dfly.fr à vos contacts pour ne rien manquer.\n\n";
$body .= "À très bientôt,\n";
$body .= "Antoine & Rémi\n";
$body .= "DFly - Photographie & Film de mariage\n";
$body .= "https://dfly.fr\n";

// ── Envoi SMTP (SSL port 465) ─────────────────────────────────────────────────
$result = smtp_send($smtp, $to, $body, "Votre demande de devis - DFly Mariage");
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
