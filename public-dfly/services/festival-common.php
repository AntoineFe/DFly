<?php
// ── Prix des produits (HT, hors frais de port) ───────────────────────────────
const FESTIVAL_PRIX = [
    'poster_musicien_30x20'  => 4.00,
    'poster_chef_60x40'      => 12.50,
    'poster_orchestre_90x60' => 31.00,
    'cle_usb'                => 25.00,
];

const FESTIVAL_PRODUITS = [
    'poster_musicien_30x20'  => 'Poster S - 20×30 cm',
    'poster_chef_60x40'      => 'Poster M - 40×60 cm',
    'poster_orchestre_90x60' => 'Poster L - 60×90 cm',
    'cle_usb'                => 'Clé USB collector coffret bois gravé logo festival',
];

const FESTIVAL_IBAN     = 'FR76 1009 6184 1900 0264 6350 252';
const FESTIVAL_BIC      = 'CMCIFRPP';
const FESTIVAL_ANNEE    = '2026';
const FESTIVAL_NOM      = '190e Festival des Musiques du Faucigny';
const FESTIVAL_FROM_NAME = 'DFly';

const FESTIVAL_HARMONIES = [
    '01_Passy',
    '02_Cluses - Harmonie',
    '03_Marignier',
    '04_Megeve',
    '05_Mieussy',
    '06_La Roche-sur-Foron',
    '07_Sixt Fer-Cheval',
    '08_Marnaz',
    '09_Bonne et Reignier-Esery',
    '10_Saint-Gervais',
    '11_L Echo du Jalouvre',
    '12_Magland',
    '13_Samons',
    '14_Cruseilles Le Chable',
    '15_Les Houches',
    '16_Taninges',
    '17_Cluses - Batterie Fanfare',
    '18_Viuz-en-Sallaz',
    '19_Sionzier',
    '20_Chatillon-sur-Cluses et Saint-Sigismond',
    '21_Bonneville - Ayze - Vougy',
    '22_Ville-la-Grand',
    '23_Saint-Pierre-en-Faucigny',
    '24_Mont-Saxonnex et Gaillard',
    '25_Sallanches',
    '26_Fillinges',
    '27_Saint-Jeoire',
];

require_once __DIR__ . '/galerie-auth.php';

function festival_db() {
    return galerie_db();
}

function festival_calcul_sous_total($produits) {
    $total = 0.0;
    foreach (FESTIVAL_PRIX as $key => $prix) {
        $total += (int)($produits[$key] ?? 0) * $prix;
    }
    return round($total, 2);
}

function festival_calcul_port($produits) {
    $posters_keys = ['poster_musicien_30x20', 'poster_chef_60x40', 'poster_orchestre_90x60'];
    $sous_total_posters = 0.0;
    foreach ($posters_keys as $key) {
        $sous_total_posters += (int)($produits[$key] ?? 0) * FESTIVAL_PRIX[$key];
    }
    $port_posters = ($sous_total_posters > 0 && $sous_total_posters <= 10.0) ? 6.00 : 0.00;
    $qty_usb      = (int)($produits['cle_usb'] ?? 0);
    $port_usb     = $qty_usb > 0 ? ceil($qty_usb / 2) * 3.00 : 0.00;
    return [
        'posters' => $port_posters,
        'usb'     => $port_usb,
        'total'   => round($port_posters + $port_usb, 2),
    ];
}

function festival_calcul_total($produits) {
    $port = festival_calcul_port($produits);
    return round(festival_calcul_sous_total($produits) + $port['total'], 2);
}

function festival_numero($link_cfg) {
    list($link) = $link_cfg;
    mysqli_query($link, "INSERT INTO festival_sequences (created_at) VALUES (NOW())");
    $id = mysqli_insert_id($link);
    return 'FESMUS-' . FESTIVAL_ANNEE . '-' . str_pad($id, 4, '0', STR_PAD_LEFT);
}

function festival_get_row($link, $harmonie) {
    $h   = mysqli_real_escape_string($link, $harmonie);
    $res = mysqli_query($link, "SELECT * FROM festival_commandes_groupees WHERE harmonie = '$h'");
    if (!$res || mysqli_num_rows($res) === 0) return null;
    $row = mysqli_fetch_assoc($res);
    $row['data'] = json_decode($row['data'], true);
    return $row;
}

function festival_save_row($link, $harmonie, $data, $statut) {
    $h    = mysqli_real_escape_string($link, $harmonie);
    $json = mysqli_real_escape_string($link, json_encode($data, JSON_UNESCAPED_UNICODE));
    $s    = mysqli_real_escape_string($link, $statut);
    mysqli_query($link, "
        INSERT INTO festival_commandes_groupees (harmonie, statut_global, data)
        VALUES ('$h', '$s', '$json')
        ON DUPLICATE KEY UPDATE statut_global = '$s', data = '$json', updated_at = NOW()
    ");
}

function festival_smtp_send($to, $subject, $body, $replyTo = '', $cc = '') {
    $path = dirname($_SERVER['DOCUMENT_ROOT']) . '/dfly-smtp-config.php';
    if (!file_exists($path))
        $path = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/dfly-smtp-config.php';
    if (!file_exists($path))
        return ['ok' => false, 'error' => 'dfly-smtp-config.php introuvable'];
    $smtp = require $path;
    return festival_smtp_raw($smtp, $to, $subject, $body, $replyTo, $cc);
}

function festival_cc() {
    $cfg = galerie_load_config(true);
    return $cfg['smtp_cc'] ?? $cfg['smtp_from'] ?? '';
}

function festival_smtp_raw($cfg, $to, $subject, $body, $replyTo = '', $cc = '') {
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
    $cmd = function($c) use ($sock, $read) { fputs($sock, $c . "\r\n"); return $read(); };
    $read();
    $cmd("EHLO {$cfg['host']}");
    $cmd("AUTH LOGIN");
    $cmd(base64_encode($cfg['user']));
    $auth = $cmd(base64_encode($cfg['pass']));
    if (strpos($auth, '235') === false) { fclose($sock); return ['ok' => false, 'error' => 'Auth SMTP échouée']; }
    $cmd("MAIL FROM:<{$cfg['from']}>");
    $cmd("RCPT TO:<{$to}>");
    if ($cc) $cmd("RCPT TO:<{$cc}>");
    $cmd("DATA");
    $enc = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $msg  = "From: " . FESTIVAL_FROM_NAME . " <{$cfg['from']}>\r\n";
    $msg .= "To: {$to}\r\n";
    if ($cc) $msg .= "Cc: {$cc}\r\n";
    if ($replyTo) $msg .= "Reply-To: {$replyTo}\r\n";
    $msg .= "Subject: {$enc}\r\n";
    $msg .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($body)) . "\r\n.";
    $res = $cmd($msg);
    $cmd("QUIT");
    fclose($sock);
    return ['ok' => strpos($res, '250') !== false];
}

function festival_note_port($produits) {
    $posters_keys = ['poster_musicien_30x20', 'poster_chef_60x40', 'poster_orchestre_90x60'];
    $has_posters = false;
    foreach ($posters_keys as $k) {
        if ((int)($produits[$k] ?? 0) > 0) { $has_posters = true; break; }
    }
    $has_usb = (int)($produits['cle_usb'] ?? 0) > 0;
    $parts = ["Les frais de port seront calculés et répartis entre les musiciens au moment du lancement de la commande groupée."];
    if ($has_posters) $parts[] = "Posters : port offert si la commande groupée de posters dépasse 10 €, sinon 6 € répartis entre les commandeurs.";
    if ($has_usb)     $parts[] = "Clé USB : expédition La Poste, 3 € par lot de 2 clés, répartis entre les commandeurs.";
    return implode("\n", $parts);
}

function festival_format_recap($commande) {
    $lines = [];
    foreach (FESTIVAL_PRODUITS as $key => $label) {
        $qty = (int)($commande['produits'][$key] ?? 0);
        if ($qty > 0) {
            $prix    = FESTIVAL_PRIX[$key];
            $lines[] = "  {$label} × {$qty} = " . number_format($qty * $prix, 2, ',', ' ') . " €";
        }
    }
    return implode("\n", $lines);
}
