<?php
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["ok" => false]));
}

$raw = file_get_contents("php://input");
$d   = json_decode($raw, true);

if (!$d || empty($d['email'])) {
    http_response_code(400);
    exit(json_encode(["ok" => false, "error" => "Données manquantes"]));
}

$from   = "contact@dfly.fr";
$to     = filter_var($d['email'], FILTER_SANITIZE_EMAIL);
$cc     = "contact@dfly.fr";
$prenom = htmlspecialchars($d['prenom'] ?? '', ENT_QUOTES);
$nom    = htmlspecialchars($d['nom']    ?? '', ENT_QUOTES);
$tel    = htmlspecialchars($d['tel']    ?? '', ENT_QUOTES);

$subject = "Votre demande de devis — DFly Mariage";

// ── Corps du mail ────────────────────────────────────────────────────────────
$sim     = $d['simulation'] ?? [];
$format  = $sim['format']   ?? '';
$moments = $sim['moments']  ?? '';
$price   = isset($sim['price'])  ? number_format($sim['price'],  0, ',', ' ') . ' €' : '';
$travel  = $sim['travel']   ?? [];
$demandes = htmlspecialchars($d['demandes'] ?? '', ENT_QUOTES);

$body  = "Bonjour {$prenom},\n\n";
$body .= "Merci pour votre demande. Voici le récapitulatif de votre estimation.\n\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "VOTRE DEVIS ESTIMATIF\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$body .= "Format       : {$format}\n";
$body .= "Moments      : {$moments}\n";
$body .= "Estimation   : {$price} TTC\n";

if (!empty($travel['km']) && $travel['km'] > 0) {
    $km   = (int) $travel['km'];
    $cost = number_format((float) $travel['cost'], 0, ',', ' ');
    $body .= "Déplacement  : {$km} km A/R → {$cost} € + péages\n";
}

if ($demandes) {
    $body .= "\nDemandes particulières :\n{$demandes}\n";
}

$body .= "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$body .= "Cette estimation est indicative.\n";
$body .= "Nous vous confirmons le devis définitif sous 48h.\n\n";

if ($tel) {
    $body .= "Votre téléphone : {$tel}\n\n";
}

$body .= "À très bientôt,\n";
$body .= "Antoine & Rémi\n";
$body .= "DFly — Photographie & Film de mariage\n";
$body .= "https://dfly.fr\n";

// ── En-têtes ─────────────────────────────────────────────────────────────────
$headers = implode("\r\n", [
    "From: DFly <{$from}>",
    "Reply-To: {$from}",
    "Cc: {$cc}",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
]);

$sent = mail($to, $subject, $body, $headers);

if (!$sent) {
    error_log("[DFly send-devis] mail() a échoué — to:{$to} subject:{$subject}");
}

echo json_encode(["ok" => (bool) $sent, "debug" => error_get_last()]);
