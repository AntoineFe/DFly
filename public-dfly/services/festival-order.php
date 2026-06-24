<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/festival-common.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET : récupère une commande par numéro ─────────────────────────────────
if ($method === 'GET') {
    $numero = trim($_GET['numero'] ?? '');
    if (!preg_match('/^FESMUS-\d{4}-\d{4}$/', $numero)) {
        http_response_code(400);
        exit(json_encode(['ok' => false, 'error' => 'Numéro invalide']));
    }
    [$link] = festival_db();
    $res = mysqli_query($link, "SELECT harmonie, statut_global, data FROM festival_commandes_groupees");
    $found = null;
    while ($row = mysqli_fetch_assoc($res)) {
        $data = json_decode($row['data'], true);
        foreach ($data['commandes'] as $cmd) {
            if ($cmd['numero'] === $numero) {
                $found = ['commande' => $cmd, 'harmonie' => $row['harmonie'], 'statut_global' => $row['statut_global']];
                break 2;
            }
        }
    }
    mysqli_close($link);
    if (!$found) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Commande introuvable'])); }
    exit(json_encode(['ok' => true] + $found));
}

// ── POST : crée une nouvelle commande ─────────────────────────────────────
if ($method === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $harmonie = trim($body['harmonie'] ?? '');
    $nom      = trim($body['nom']      ?? '');
    $email    = trim($body['email']    ?? '');
    $produits = $body['produits']      ?? [];

    if (!$harmonie || !$nom || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        exit(json_encode(['ok' => false, 'error' => 'Données manquantes ou invalides']));
    }
    if (!in_array($harmonie, FESTIVAL_HARMONIES)) {
        http_response_code(400);
        exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
    }

    $produitsSanitized = [];
    foreach (array_keys(FESTIVAL_PRIX) as $key) {
        $produitsSanitized[$key] = max(0, (int)($produits[$key] ?? 0));
    }
    $sous_total = festival_calcul_sous_total($produitsSanitized);
    $port       = festival_calcul_port($produitsSanitized);
    $total      = round($sous_total + $port['total'], 2);

    $db_info = festival_db();
    [$link]  = $db_info;

    $row = festival_get_row($link, $harmonie);
    if ($row && $row['statut_global'] !== 'ouvert') {
        mysqli_close($link);
        http_response_code(409);
        exit(json_encode(['ok' => false, 'error' => 'Les commandes sont clôturées pour cet orchestre']));
    }

    $numero = festival_numero($db_info);
    $data   = $row['data'] ?? ['responsable' => null, 'commandes' => [], 'total' => 0.0];

    $data['commandes'][] = [
        'numero'   => $numero,
        'nom'      => $nom,
        'email'    => $email,
        'produits' => $produitsSanitized,
        'statut'   => 'en_cours',
        'total'    => $total,
    ];
    $data['total'] = array_sum(array_column(
        array_filter($data['commandes'], fn($c) => $c['statut'] === 'en_cours'),
        'total'
    ));

    festival_save_row($link, $harmonie, $data, $row ? $row['statut_global'] : 'ouvert');
    mysqli_close($link);

    // Email musicien
    $lien_modif = 'https://dfly.fr/commande-festival-faucigny-2026?numero=' . urlencode($numero);
    $recap = festival_format_recap(['produits' => $produitsSanitized]);
    $body_email  = "Bonjour {$nom},\n\n";
    $body_email .= "Votre commande pour le " . FESTIVAL_NOM . " a bien été enregistrée.\n\n";
    $body_email .= "Numéro de commande : {$numero}\n\n";
    $body_email .= "Récapitulatif :\n{$recap}\n";
    $body_email .= "Sous-total produits : " . number_format($sous_total, 2, ',', ' ') . " €\n";
    if ($port['posters'] > 0)
        $body_email .= "Frais de port posters (Saal) : " . number_format($port['posters'], 2, ',', ' ') . " €\n";
    else if ($sous_total > 0)
        $body_email .= "Frais de port posters : offerts (commande > 10 €)\n";
    if ($port['usb'] > 0)
        $body_email .= "Frais de port clé USB : " . number_format($port['usb'], 2, ',', ' ') . " €\n";
    $body_email .= "Total : " . number_format($total, 2, ',', ' ') . " €\n\n";
    $body_email .= "Votre commande sera expédiée dès qu'un responsable de votre orchestre se sera désigné et aura effectué le virement groupé.\n\n";
    $body_email .= "Pour modifier ou annuler votre commande :\n{$lien_modif}\n\n";
    $body_email .= "À bientôt,\nDFly";

    festival_smtp_send($email, "Votre commande — " . FESTIVAL_NOM, $body_email);

    exit(json_encode(['ok' => true, 'numero' => $numero, 'sous_total' => $sous_total, 'port' => $port, 'total' => $total]));
}

// ── PUT : modifie ou annule une commande ──────────────────────────────────
if ($method === 'PUT') {
    $body   = json_decode(file_get_contents('php://input'), true) ?? [];
    $numero = trim($body['numero'] ?? '');
    $annuler = !empty($body['annuler']);

    if (!preg_match('/^FESMUS-\d{4}-\d{4}$/', $numero)) {
        http_response_code(400);
        exit(json_encode(['ok' => false, 'error' => 'Numéro invalide']));
    }

    [$link] = festival_db();
    $res = mysqli_query($link, "SELECT id, harmonie, statut_global, data FROM festival_commandes_groupees");
    $targetRow = null; $targetIdx = null;
    while ($row = mysqli_fetch_assoc($res)) {
        $data = json_decode($row['data'], true);
        foreach ($data['commandes'] as $i => $cmd) {
            if ($cmd['numero'] === $numero) { $targetRow = $row; $targetRow['data'] = $data; $targetIdx = $i; break 2; }
        }
    }

    if (!$targetRow) { mysqli_close($link); http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Commande introuvable'])); }
    if ($targetRow['statut_global'] !== 'ouvert') { mysqli_close($link); http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Modification impossible, commande lancée'])); }

    $data = $targetRow['data'];
    if ($annuler) {
        $data['commandes'][$targetIdx]['statut'] = 'annulee';
    } else {
        $produits = $body['produits'] ?? [];
        $produitsSanitized = [];
        foreach (array_keys(FESTIVAL_PRIX) as $key) $produitsSanitized[$key] = max(0, (int)($produits[$key] ?? 0));
        $data['commandes'][$targetIdx]['produits'] = $produitsSanitized;
        $data['commandes'][$targetIdx]['total']    = festival_calcul_total($produitsSanitized);
    }
    $data['total'] = array_sum(array_column(
        array_filter($data['commandes'], fn($c) => $c['statut'] === 'en_cours'), 'total'
    ));

    festival_save_row($link, $targetRow['harmonie'], $data, $targetRow['statut_global']);
    mysqli_close($link);
    exit(json_encode(['ok' => true]));
}

http_response_code(405);
exit(json_encode(['ok' => false]));
