<?php
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["ok" => false]));
}

require_once __DIR__ . '/site-config.php';
$smtp = site_load_config();

$raw = file_get_contents("php://input");
$d   = json_decode($raw, true);

if (!$d || empty($d['email']) || empty($d['message'])) {
    http_response_code(400);
    exit(json_encode(["ok" => false, "error" => "Données manquantes"]));
}

$clientEmail = filter_var($d['email'], FILTER_SANITIZE_EMAIL);
$prenom      = htmlspecialchars($d['prenom']  ?? '', ENT_QUOTES);
$nom         = htmlspecialchars($d['nom']     ?? '', ENT_QUOTES);
$tel         = htmlspecialchars($d['tel']     ?? '', ENT_QUOTES);
$sujet       = htmlspecialchars($d['sujet']   ?? 'Autre', ENT_QUOTES);
$message     = htmlspecialchars($d['message'] ?? '', ENT_QUOTES);
$lang        = strtoupper($d['lang'] ?? 'FR') === 'EN' ? 'EN' : 'FR';

$subject = $lang === 'EN'
    ? "Message from {$prenom} {$nom} — {$sujet} — DFly"
    : "Message de {$prenom} {$nom} — {$sujet} — DFly";

$greeting = $lang === 'EN' ? "Hello {$prenom}," : "Bonjour {$prenom},";
$thanks   = $lang === 'EN'
    ? "Thank you for your message. Here is a copy for your records."
    : "Merci pour votre message. Voici une copie pour vos archives.";

$body  = "{$greeting}\n\n";
$body .= "{$thanks}\n\n";
$body .= str_repeat("-", 40) . "\n";
$body .= ($lang === 'EN' ? "YOUR MESSAGE" : "VOTRE MESSAGE") . "\n";
$body .= str_repeat("-", 40) . "\n\n";
$body .= ($lang === 'EN' ? "Subject : " : "Sujet   : ") . "{$sujet}\n\n";
$body .= $message . "\n\n";
$body .= str_repeat("-", 40) . "\n";
$body .= ($lang === 'EN' ? "YOUR CONTACT DETAILS" : "VOS COORDONNÉES") . "\n";
$body .= str_repeat("-", 40) . "\n\n";
$body .= ($lang === 'EN' ? "Name  : " : "Nom   : ") . "{$prenom} {$nom}\n";
$body .= "Email : {$clientEmail}\n";
if ($tel) $body .= ($lang === 'EN' ? "Phone : " : "Tél.  : ") . "{$tel}\n";
$body .= "\n" . str_repeat("-", 40) . "\n\n";
$body .= ($lang === 'EN'
    ? "We'll get back to you within 48 hours.\n\nIf you don't receive our reply, please check your spam folder\nand add contact@dfly.fr to your contacts.\n\n"
    : "Nous vous répondons sous 48 heures.\n\nSi vous ne recevez pas notre réponse, pensez à vérifier vos spams\net ajoutez contact@dfly.fr à vos contacts.\n\n");
$body .= ($lang === 'EN' ? "See you soon,\n" : "À très bientôt,\n");
$body .= "Antoine & Rémi\n";
$body .= ($lang === 'EN' ? "DFly — Photography & Film\n" : "DFly — Photographie & Vidéo\n");
$body .= "https://dfly.fr\n";

$result = smtp_send($smtp, $clientEmail, $body, $subject);
echo json_encode($result);

function smtp_send(array $cfg, string $clientEmail, string $body, string $subject): array {
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $sock = @stream_socket_client("ssl://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$sock) {
        $ctx2 = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        $sock = @stream_socket_client("ssl://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx2);
        if (!$sock) return ["ok" => false, "error" => "Connexion SMTP échouée ({$errno}): {$errstr}"];
    }

    stream_set_timeout($sock, 15);
    $read = function() use ($sock) {
        $out = '';
        while ($line = fgets($sock, 512)) { $out .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
        return $out;
    };
    $cmd = function(string $c) use ($sock, $read) { fputs($sock, $c . "\r\n"); return $read(); };

    $read();
    $cmd("EHLO {$cfg['host']}");
    $cmd("AUTH LOGIN");
    $cmd(base64_encode($cfg['user']));
    $auth = $cmd(base64_encode($cfg['pass']));
    if (strpos($auth, '235') === false) { fclose($sock); return ["ok" => false, "error" => "Auth SMTP échouée"]; }

    // To: DFly, Cc: client
    $cmd("MAIL FROM:<{$cfg['from']}>");
    $cmd("RCPT TO:<{$cfg['cc']}>");
    $cmd("RCPT TO:<{$clientEmail}>");
    $cmd("DATA");

    $enc_subject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $message  = "From: DFly <{$cfg['from']}>\r\n";
    $message .= "To: {$cfg['cc']}\r\n";
    $message .= "Cc: {$clientEmail}\r\n";
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
