<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';

$cfg  = galerie_load_config();
$smtp = [
    'host' => $cfg['smtp_host'],
    'port' => $cfg['smtp_port'],
    'user' => $cfg['smtp_user'],
    'pass' => $cfg['smtp_pass'],
    'from' => $cfg['smtp_from'],
    'cc'   => $cfg['smtp_cc'],
];

$body  = json_decode(file_get_contents('php://input'), true);
$email = trim(filter_var($body['email'] ?? '', FILTER_SANITIZE_EMAIL));
$name  = trim($body['name'] ?? '');

if (!$email) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Email manquant']));
}

$ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '?')[0]);

$log_dir  = $cfg['log_dir'] ?? dirname($_SERVER['DOCUMENT_ROOT']) . '/galerie-logs';
if (!is_dir($log_dir)) @mkdir($log_dir, 0755, true);
$log_file = $log_dir . '/navigation.log';

// ── Cas 2 : email non trouvé, le client fournit son nom → notification à DFly ──
if ($name !== '') {
    $n = htmlspecialchars($name);
    $subject = "Demande de lien galerie — {$n}";
    $msgBody  = "Un client a demandé l'envoi de son lien d'accès à la galerie.\n\n";
    $msgBody .= "Nom saisi   : {$n}\n";
    $msgBody .= "Email saisi : {$email}\n\n";
    $msgBody .= "Cet email n'existe pas dans la base utilisateurs.\n";
    $msgBody .= "Retrouvez ce client et envoyez-lui son lien manuellement.";
    resend_smtp_send($smtp, $smtp['cc'], $subject, $msgBody);
    @file_put_contents($log_file,
        '[' . date('Y-m-d H:i:s') . '] Anonyme | [resend-request] ' . $n . ' <' . $email . '> | ' . $ip . PHP_EOL,
        FILE_APPEND | LOCK_EX);
    exit(json_encode(['ok' => true]));
}

// ── Cas 1 : email seul → chercher dans HabilUsers ────────────────────────────
list($db) = galerie_db();
$esc = mysqli_real_escape_string($db, $email);
$res = mysqli_query($db, "SELECT firstName, cle FROM HabilUsers WHERE email = '$esc' LIMIT 1");

if (!$res || mysqli_num_rows($res) === 0) {
    mysqli_close($db);
    exit(json_encode(['ok' => false, 'notFound' => true]));
}

$user = mysqli_fetch_assoc($res);
mysqli_close($db);

$prenom     = $user['firstName'];
$access_url = rtrim($cfg['app_url'], '/') . ($cfg['app_base'] ?? '/galerie') . '?cle=' . urlencode($user['cle']);
$app_name   = $cfg['app_name']    ?? 'Galerie';
$app_sign   = $cfg['email_sign']  ?? $app_name;
$app_site   = $cfg['email_site']  ?? $cfg['app_url'];

$subject = 'Votre accès à votre galerie — ' . $app_name;
$msgBody  = "Bonjour {$prenom},\n\n";
$msgBody .= "Voici votre lien d'accès personnel à votre galerie privée :\n\n";
$msgBody .= "{$access_url}\n\n";
$msgBody .= "Ce lien est personnel et vous est réservé. Ne le partagez pas.\n\n";
$msgBody .= "À très bientôt,\n";
$msgBody .= "{$app_sign}\n";
if ($cfg['app_tagline'] ?? '') $msgBody .= $app_name . ' — ' . $cfg['app_tagline'] . "\n";
$msgBody .= "{$app_site}\n";

$result = resend_smtp_send($smtp, $email, $subject, $msgBody);

@file_put_contents($log_file,
    '[' . date('Y-m-d H:i:s') . '] Anonyme | [resend-link] ' . $prenom . ' <' . $email . '> | ' . $ip . PHP_EOL,
    FILE_APPEND | LOCK_EX);

exit(json_encode($result));

// ── SMTP ─────────────────────────────────────────────────────────────────────

function resend_smtp_send(array $cfg, string $to, string $subject, string $body): array {
    $ctx  = stream_context_create(['ssl' => ['verify_peer' => true,  'verify_peer_name' => true]]);
    $sock = @stream_socket_client("ssl://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$sock) {
        $ctx2 = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        $sock = @stream_socket_client("ssl://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx2);
        if (!$sock) return ['ok' => false, 'error' => "Connexion SMTP échouée ({$errno}): {$errstr}"];
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
    if (strpos($auth, '235') === false) { fclose($sock); return ['ok' => false, 'error' => 'Auth SMTP échouée']; }
    $cmd("MAIL FROM:<{$cfg['from']}>");
    $cmd("RCPT TO:<{$to}>");
    $cmd("DATA");
    $enc = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $displayName = $cfg['app_name'] ?? 'Galerie';
    $msg  = "From: {$displayName} <{$cfg['from']}>\r\nTo: {$to}\r\nSubject: {$enc}\r\n";
    $msg .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($body)) . "\r\n.";
    $res = $cmd($msg);
    $cmd("QUIT");
    fclose($sock);
    return ['ok' => strpos($res, '250') !== false];
}
