<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/festival-common.php';

// ── GET : preview avant lancement ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $harmonie = trim($_GET['harmonie'] ?? '');
    if (!$harmonie || !in_array($harmonie, FESTIVAL_HARMONIES)) {
        http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
    }
    list($link) = festival_db();
    $row = festival_get_row($link, $harmonie);
    mysqli_close($link);
    if (!$row) { http_response_code(404); exit(json_encode(['ok' => false, 'error' => 'Aucune donnée pour cet orchestre'])); }
    if (!$row['data']['responsable']) { http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Aucun contact de livraison désigné'])); }

    $commandes_en_cours = array_values(array_filter($row['data']['commandes'], function($c) { return $c['statut'] === 'en_cours'; }));
    $total = array_sum(array_column($commandes_en_cours, 'total'));

    exit(json_encode([
        'ok'          => true,
        'responsable' => $row['data']['responsable'],
        'commandes'   => $commandes_en_cours,
        'total'       => $total,
        'statut'      => $row['statut_global'],
    ]));
}

// ── POST : confirme le lancement ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $harmonie = trim($body['harmonie'] ?? '');
    $adresse  = trim($body['adresse']  ?? '');

    if (!$harmonie || !in_array($harmonie, FESTIVAL_HARMONIES)) {
        http_response_code(400); exit(json_encode(['ok' => false, 'error' => 'Harmonie inconnue']));
    }

    list($link) = festival_db();
    $row = festival_get_row($link, $harmonie);
    if (!$row || !$row['data']['responsable']) {
        mysqli_close($link); http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Contact de livraison manquant']));
    }
    if ($row['statut_global'] !== 'ouvert') {
        mysqli_close($link); http_response_code(409); exit(json_encode(['ok' => false, 'error' => 'Commande déjà lancée']));
    }

    $data = $row['data'];
    if ($adresse) $data['responsable']['adresse'] = $adresse;

    $commandes_en_cours = array_filter($data['commandes'], function($c) { return $c['statut'] === 'en_cours'; });
    $total = array_sum(array_column(array_values($commandes_en_cours), 'total'));
    $data['total'] = $total;

    festival_save_row($link, $harmonie, $data, 'virement_attendu');
    mysqli_close($link);

    // Construit le récap pour l'email
    $resp = $data['responsable'];
    $slug = strtoupper(str_replace(' ', '-', $harmonie));
    $ref_virement = 'FESMUS-' . FESTIVAL_ANNEE . '-' . $slug;

    $body_email  = "Bonjour {$resp['nom']},\n\n";
    $body_email .= "Vous avez lancé la commande groupée de votre orchestre pour le " . FESTIVAL_NOM . ".\n\n";
    $body_email .= "Adresse de livraison :\n{$resp['adresse']}\n\n";
    $body_email .= "Récapitulatif des commandes :\n";
    $body_email .= str_repeat('─', 50) . "\n";
    foreach ($commandes_en_cours as $cmd) {
        $body_email .= "\n{$cmd['nom']} ({$cmd['email']}) :\n";
        $body_email .= festival_format_recap($cmd) . "\n";
        $body_email .= "  Sous-total : " . number_format($cmd['total'], 2, ',', ' ') . " €\n";
    }
    $body_email .= "\n" . str_repeat('─', 50) . "\n";
    $body_email .= "TOTAL HORS FRAIS DE PORT : " . number_format($total, 2, ',', ' ') . " €\n\n";
    $body_email .= "Merci d'effectuer le virement à l'ordre de DFly :\n";
    $body_email .= "IBAN : " . FESTIVAL_IBAN . "\n";
    $body_email .= "Référence à indiquer : {$ref_virement}\n\n";
    $body_email .= "Pour toute difficulté : https://dfly.fr/contact\n\n";
    $body_email .= "À bientôt,\nDFly";

    festival_smtp_send($resp['email'], "Commande groupée " . FESTIVAL_NOM . " — récapitulatif et virement", $body_email, '', festival_cc());

    exit(json_encode(['ok' => true]));
}

http_response_code(405);
exit(json_encode(['ok' => false]));
