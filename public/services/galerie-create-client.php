<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

list($link, $cfg) = galerie_db();

$body      = json_decode(file_get_contents('php://input'), true);
$raiSoc    = trim($body['raiSoc']    ?? '');
$shortDesc = trim($body['shortDesc'] ?? '');
$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = trim($body['email']     ?? '');
$login     = trim($body['login']     ?? $email);
$lang      = in_array($body['lang'] ?? '', ['FR', 'EN']) ? $body['lang'] : 'FR';

if (!$raiSoc || !$shortDesc || !$firstName || !$lastName || !$email) {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Champs obligatoires manquants']));
}

// Vérifier unicité shortDesc
$sd = mysqli_real_escape_string($link, $shortDesc);
$res = mysqli_query($link, "SELECT id FROM Entreprise WHERE shortDesc = '$sd'");
if ($res && mysqli_num_rows($res) > 0) {
    http_response_code(409);
    exit(json_encode(['ok' => false, 'error' => 'Un client avec ce shortDesc existe déjà']));
}

// Générer mot de passe temporaire et cle autologin
function random_str($len) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $out = '';
    for ($i = 0; $i < $len; $i++) $out .= $chars[random_int(0, strlen($chars) - 1)];
    return $out;
}
$tempPassword = random_str(10);
$hashedPw     = hash('sha256', $tempPassword);
$cle          = random_str(48);

mysqli_begin_transaction($link);
try {
    $rs = mysqli_real_escape_string($link, $raiSoc);
    $lo = mysqli_real_escape_string($link, $login);
    $em = mysqli_real_escape_string($link, $email);
    $fn = mysqli_real_escape_string($link, $firstName);
    $ln = mysqli_real_escape_string($link, $lastName);
    $la = mysqli_real_escape_string($link, $lang);
    $cl = mysqli_real_escape_string($link, $cle);

    // 1. Entreprise
    mysqli_query($link, "INSERT INTO Entreprise (shortDesc, raiSoc) VALUES ('$sd', '$rs')");
    $idEnt = mysqli_insert_id($link);
    if (!$idEnt) throw new Exception('Impossible de créer l\'entreprise');

    // 2. Profil galerie (R) pour ce client
    $auths = json_encode([['rsrc' => 'galerie', 'levels' => ['R']]]);
    $authsEsc = mysqli_real_escape_string($link, $auths);
    mysqli_query($link, "INSERT INTO HabilProfil (idEnt, auths) VALUES ($idEnt, '$authsEsc')");
    $idProfil = mysqli_insert_id($link);
    if (!$idProfil) throw new Exception('Impossible de créer le profil');

    // 3. Utilisateur client
    mysqli_query($link, "INSERT INTO HabilUsers (firstName, lastName, email, login, password, idEnt, lang, cle)
        VALUES ('$fn', '$ln', '$em', '$lo', '$hashedPw', $idEnt, '$la', '$cl')");
    $idUser = mysqli_insert_id($link);
    if (!$idUser) throw new Exception('Impossible de créer l\'utilisateur');

    // 4. Lier l'utilisateur au profil galerie
    mysqli_query($link, "INSERT INTO HabilProfilUser (idUser, idProfil) VALUES ($idUser, $idProfil)");

    // 5. Habiliter tous les admins sur ce nouveau client
    // Trouver tous les profils admin:R (auths contient "admin")
    $adminRes = mysqli_query($link, "
        SELECT DISTINCT HPU.idUser
        FROM HabilProfilUser HPU
        INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
        WHERE HP.auths LIKE '%\"admin\"%'
    ");
    $adminUserIds = [];
    while ($r = mysqli_fetch_assoc($adminRes)) {
        $adminUserIds[] = (int)$r['idUser'];
    }

    // Pour chaque admin, créer un profil galerie:R pour ce nouveau client et le lier
    foreach ($adminUserIds as $auid) {
        mysqli_query($link, "INSERT INTO HabilProfil (idEnt, auths) VALUES ($idEnt, '$authsEsc')");
        $aProfilId = mysqli_insert_id($link);
        mysqli_query($link, "INSERT INTO HabilProfilUser (idUser, idProfil) VALUES ($auid, $aProfilId)");
    }

    // 6. Créer le dossier images/Pro/{slug}/
    $slug    = galerie_ent_slug($shortDesc);
    $proDir  = $cfg['pro_root'] . '/' . $slug;
    if (!is_dir($proDir)) @mkdir($proDir, 0755, true);

    mysqli_commit($link);
} catch (Exception $e) {
    mysqli_rollback($link);
    mysqli_close($link);
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => $e->getMessage()]));
}

mysqli_close($link);

echo json_encode([
    'ok'           => true,
    'idEnt'        => $idEnt,
    'tempPassword' => $tempPassword,
    'cle'          => $cle,
]);
