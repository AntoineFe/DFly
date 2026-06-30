<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/festival-common.php';

// ── GET : preview avant lancement (via token responsable) ────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = trim($_GET['token'] ?? '');
    if (!$token) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Token manquant'])); }

    list($link) = festival_db();
    $res = mysqli_query($link, "SELECT * FROM festival_commandes_groupees");
    $found = null;
    while ($row = mysqli_fetch_assoc($res)) {
        $data = json_decode($row['data'], true);
        if (($data['responsable']['token'] ?? '') === $token) { $found = $row; $found['data'] = $data; break; }
    }
    mysqli_close($link);

    if (!$found) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Lien invalide'])); }
    if ($found['statut_global'] !== 'ouvert') { http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Commande déjà lancée'])); }

    $commandes_en_cours = array_values(array_filter($found['data']['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));
    $total = array_sum(array_column($commandes_en_cours, 'total'));

    exit(json_encode([
        'ok'          => true,
        'responsable' => $found['data']['responsable'],
        'commandes'   => $commandes_en_cours,
        'total'       => $total,
        'statut'      => $found['statut_global'],
    ]));
}

// ── POST : confirme le lancement (via token responsable) ─────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $token   = trim($body['token']   ?? '');
    $nom     = trim($body['nom']     ?? '');
    $adresse = trim($body['adresse'] ?? '');

    if (!$token) { http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Token manquant'])); }

    list($link) = festival_db();
    $res2 = mysqli_query($link, "SELECT * FROM festival_commandes_groupees");
    $row = null;
    $harmonie = '';
    while ($r = mysqli_fetch_assoc($res2)) {
        $d = json_decode($r['data'], true);
        if (($d['responsable']['token'] ?? '') === $token) {
            $row = $r; $row['data'] = $d; $harmonie = $r['harmonie']; break;
        }
    }
    if (!$row) {
        mysqli_close($link); http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Lien invalide']));
    }
    if ($row['statut_global'] !== 'ouvert') {
        mysqli_close($link); http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Commande déjà lancée']));
    }

    $data = $row['data'];
    if ($nom)     $data['responsable']['nom']     = $nom;
    if ($adresse) $data['responsable']['adresse'] = $adresse;

    $commandes_en_cours = array_keys(array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));

    // ── Calcul frais de port groupés ────────────────────────────────────────
    $posters_keys = ['poster_musicien_30x20', 'poster_chef_60x40', 'poster_orchestre_90x60'];

    // Sous-total posters du groupe et qty USB totale
    $groupe_sous_posters = 0.0;
    $groupe_qty_usb      = 0;
    foreach ($commandes_en_cours as $i) {
        $p = $data['commandes'][$i]['produits'];
        foreach ($posters_keys as $k) $groupe_sous_posters += (int)($p[$k] ?? 0) * FESTIVAL_PRIX[$k];
        $groupe_qty_usb += (int)($p['cle_usb'] ?? 0);
    }

    $port_posters_groupe = ($groupe_sous_posters > 0 && $groupe_sous_posters <= 20.0) ? 7.00 : 0.00;
    $port_usb_groupe     = $groupe_qty_usb > 0 ? ceil($groupe_qty_usb / 2) * 3.00 : 0.00;

    // Indices des personnes concernées
    $idx_poster_orderers = array_values(array_filter($commandes_en_cours, function($i) use ($data, $posters_keys) {
        $p = $data['commandes'][$i]['produits'];
        foreach ($posters_keys as $k) { if ((int)($p[$k] ?? 0) > 0) return true; }
        return false;
    }));
    $idx_usb_orderers = array_values(array_filter($commandes_en_cours, function($i) use ($data) {
        return (int)($data['commandes'][$i]['produits']['cle_usb'] ?? 0) > 0;
    }));

    $nb_poster = count($idx_poster_orderers);
    $nb_usb    = count($idx_usb_orderers);

    // Part par personne (arrondi 2 dec, reste au dernier)
    $share_poster = $nb_poster > 0 ? round($port_posters_groupe / $nb_poster, 2) : 0.0;
    $share_usb    = $nb_usb    > 0 ? round($port_usb_groupe    / $nb_usb,    2) : 0.0;

    // Mise à jour de chaque commande
    foreach ($data['commandes'] as $i => &$cmd) {
        if ($cmd['statut'] !== 'en_cours') continue;
        $p           = $cmd['produits'];
        $sous        = festival_calcul_sous_total($p);
        $port_p      = in_array($i, $idx_poster_orderers) ? $share_poster : 0.0;
        $port_u      = in_array($i, $idx_usb_orderers)    ? $share_usb    : 0.0;
        $cmd['port'] = ['posters' => $port_p, 'usb' => $port_u, 'total' => round($port_p + $port_u, 2)];
        $cmd['total'] = round($sous + $port_p + $port_u, 2);
    }
    unset($cmd);

    $total = array_sum(array_column(
        array_values(array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; })),
        'total'
    ));
    $data['total'] = $total;

    festival_save_row($link, $harmonie, $data, 'virement_attendu');
    mysqli_close($link);

    // Construit le récap pour l'email
    $resp = $data['responsable'];
    preg_match('/^([A-Za-z0-9]+)/', $harmonie, $m);
    $ref_virement = 'FESMUS-' . FESTIVAL_ANNEE . '-' . strtoupper($m[1] ?? '00');
    $commandes_en_cours_data = array_values(array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));

    $body_email  = "Bonjour {$resp['nom']},\n\n";
    $body_email .= "Vous avez lancé la commande groupée de votre orchestre pour le " . FESTIVAL_NOM . ".\n\n";
    $body_email .= "Adresse de livraison :\n{$resp['nom']}\n{$resp['adresse']}\n\n";
    $body_email .= "Récapitulatif des commandes :\n";
    $body_email .= str_repeat('-', 50) . "\n";
    foreach ($commandes_en_cours_data as $cmd) {
        $port = $cmd['port'];
        $body_email .= "\n{$cmd['nom']} ({$cmd['email']}) :\n";
        $body_email .= festival_format_recap($cmd) . "\n";
        if ($port['posters'] > 0)
            $body_email .= "  Port posters (Saal, part) : " . number_format($port['posters'], 2, ',', ' ') . " €\n";
        elseif (festival_calcul_sous_total($cmd['produits']) > 0)
            $body_email .= "  Port posters : offert\n";
        if ($port['usb'] > 0)
            $body_email .= "  Port clé USB (La Poste, part) : " . number_format($port['usb'], 2, ',', ' ') . " €\n";
        $body_email .= "  Total : " . number_format($cmd['total'], 2, ',', ' ') . " €\n";
    }
    $body_email .= "\n" . str_repeat('-', 50) . "\n";
    $body_email .= "TOTAL GÉNÉRAL : " . number_format($total, 2, ',', ' ') . " €\n\n";
    $body_email .= "Merci d'effectuer le virement à l'ordre de HELANSOFT :\n";
    $body_email .= "IBAN : " . FESTIVAL_IBAN . "\n";
    $body_email .= "BIC : " . FESTIVAL_BIC . "\n";
    $body_email .= "Référence à indiquer : {$ref_virement}\n\n";
    $body_email .= "Pour toute difficulté : https://dfly.fr/contact\n\n";
    $body_email .= "À bientôt,\nDFly";

    festival_smtp_send($resp['email'], $ref_virement . " — Commande groupée " . FESTIVAL_NOM . " — récapitulatif et virement", $body_email, '', festival_cc());

    exit(json_encode(['ok' => true]));
}

http_response_code(405);
exit(json_encode(['ok' => false]));
