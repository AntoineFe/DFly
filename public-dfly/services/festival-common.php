<?php
// ── Prix des produits (HT, hors frais de port) ───────────────────────────────
const FESTIVAL_PRIX = [
    'poster_musicien_30x20'  => 0.00,  // TODO_PRIX_30x20
    'poster_chef_60x40'      => 0.00,  // TODO_PRIX_60x40
    'poster_orchestre_90x60' => 0.00,  // TODO_PRIX_90x60
    'cle_usb'                => 25.00,
];

const FESTIVAL_PRODUITS = [
    'poster_musicien_30x20'  => 'Poster Musicien 30×20 cm',
    'poster_chef_60x40'      => 'Poster Chef 60×40 cm',
    'poster_orchestre_90x60' => 'Poster Orchestre 90×60 cm',
    'cle_usb'                => 'Clé USB collector coffret bois gravé logo festival',
];

const FESTIVAL_IBAN     = 'TODO_IBAN';
const FESTIVAL_ANNEE    = '2026';
const FESTIVAL_NOM      = '190e Festival des Musiques du Faucigny';
const FESTIVAL_FROM_NAME = 'DFly';

// TODO : remplacer par les 30 harmonies réelles
const FESTIVAL_HARMONIES = [
    'TODO_HARMONIE_01',
    'TODO_HARMONIE_02',
    'TODO_HARMONIE_03',
    'TODO_HARMONIE_04',
    'TODO_HARMONIE_05',
];

require_once __DIR__ . '/galerie-auth.php';

function festival_db() {
    return galerie_db();
}

function festival_calcul_total(array $produits): float {
    $total = 0.0;
    foreach (FESTIVAL_PRIX as $key => $prix) {
        $total += (int)($produits[$key] ?? 0) * $prix;
    }
    return round($total, 2);
}

function festival_numero(array $link_cfg): string {
    [$link] = $link_cfg;
    mysqli_query($link, "INSERT INTO festival_sequences (created_at) VALUES (NOW())");
    $id = mysqli_insert_id($link);
    return 'FESMUS-' . FESTIVAL_ANNEE . '-' . str_pad($id, 4, '0', STR_PAD_LEFT);
}

function festival_get_row($link, string $harmonie): ?array {
    $h   = mysqli_real_escape_string($link, $harmonie);
    $res = mysqli_query($link, "SELECT * FROM festival_commandes_groupees WHERE harmonie = '$h'");
    if (!$res || mysqli_num_rows($res) === 0) return null;
    $row = mysqli_fetch_assoc($res);
    $row['data'] = json_decode($row['data'], true);
    return $row;
}

function festival_save_row($link, string $harmonie, array $data, string $statut): void {
    $h    = mysqli_real_escape_string($link, $harmonie);
    $json = mysqli_real_escape_string($link, json_encode($data, JSON_UNESCAPED_UNICODE));
    $s    = mysqli_real_escape_string($link, $statut);
    mysqli_query($link, "
        INSERT INTO festival_commandes_groupees (harmonie, statut_global, data)
        VALUES ('$h', '$s', '$json')
        ON DUPLICATE KEY UPDATE statut_global = '$s', data = '$json', updated_at = NOW()
    ");
}

function festival_smtp_send(string $to, string $subject, string $body, string $replyTo = ''): array {
    $path = dirname($_SERVER['DOCUMENT_ROOT']) . '/dfly-smtp-config.php';
    if (!file_exists($path))
        $path = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/dfly-smtp-config.php';
    if (!file_exists($path))
        return ['ok' => false, 'error' => 'dfly-smtp-config.php introuvable'];
    $smtp = require $path;
    return festival_smtp_raw($smtp, $to, $subject, $body, $replyTo);
}

function festival_smtp_raw(array $cfg, string $to, string $subject, string $body, string $replyTo = ''): array {
    $ctx  = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
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
    $msg  = "From: " . FESTIVAL_FROM_NAME . " <{$cfg['from']}>\r\n";
    $msg .= "To: {$to}\r\n";
    if ($replyTo) $msg .= "Reply-To: {$replyTo}\r\n";
    $msg .= "Subject: {$enc}\r\n";
    $msg .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($body)) . "\r\n.";
    $res = $cmd($msg);
    $cmd("QUIT");
    fclose($sock);
    return ['ok' => strpos($res, '250') !== false];
}

function festival_format_recap(array $commande): string {
    $lines = [];
    foreach (FESTIVAL_PRODUITS as $key => $label) {
        $qty = (int)($commande['produits'][$key] ?? 0);
        if ($qty > 0) {
            $prix  = FESTIVAL_PRIX[$key];
            $lines[] = "  {$label} × {$qty} = " . number_format($qty * $prix, 2, ',', ' ') . " €";
        }
    }
    return implode("\n", $lines);
}
