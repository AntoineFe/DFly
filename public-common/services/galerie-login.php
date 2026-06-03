<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';

$body     = json_decode(file_get_contents('php://input'), true);
$login    = trim($body['login']    ?? '');
$password = trim($body['password'] ?? '');

if ($login === '' || $password === '') {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Identifiants manquants']));
}

list($link, $cfg) = galerie_db();

$l = mysqli_real_escape_string($link, $login);
$p = hash('sha256', $password);

$sql = "SELECT HU.id, HU.firstName, HU.lastName, HU.email, HU.idEnt, HU.lang,
               E.shortDesc AS shortDescEnt
        FROM HabilUsers HU
        INNER JOIN Entreprise E ON E.id = HU.idEnt
        WHERE HU.login = '$l' AND HU.password = '$p'";

$res = mysqli_query($link, $sql);
if (!$res || mysqli_num_rows($res) === 0) {
    mysqli_close($link);
    http_response_code(401);
    exit(json_encode(['ok' => false, 'error' => 'Identifiant ou mot de passe incorrect']));
}

$user  = mysqli_fetch_assoc($res);
$uid   = (int)$user['id'];
$ient  = (int)$user['idEnt'];
$token = bin2hex(random_bytes(32));
$ip    = $_SERVER['REMOTE_ADDR'] ?? '';

mysqli_query($link, "INSERT INTO HabilSessions (token, userId, tsOpenSession, tsLastAccess, ip)
    VALUES ('$token', $uid, NOW(), NOW(), '" . mysqli_real_escape_string($link, $ip) . "')");

// Profils/auths
$pSql  = "SELECT HP.auths FROM HabilProfilUser HPU
           INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
           WHERE HPU.idUser = $uid AND HP.idEnt = $ient";
$pRes  = mysqli_query($link, $pSql);
$auths = [];
while ($p = mysqli_fetch_assoc($pRes)) {
    $decoded = json_decode($p['auths'], true) ?? [];
    foreach ($decoded as $a) { $auths[$a['rsrc']] = $a['levels']; }
}

// Entreprises accessibles
$eSql = "SELECT DISTINCT E.id, E.shortDesc, E.raiSoc
         FROM Entreprise E
         INNER JOIN HabilProfil HP ON HP.idEnt = E.id
         INNER JOIN HabilProfilUser HPU ON HPU.idProfil = HP.id
         WHERE HPU.idUser = $uid";
$eRes = mysqli_query($link, $eSql);
$ents = [];
while ($e = mysqli_fetch_assoc($eRes)) { $ents[] = $e; }

mysqli_close($link);

echo json_encode([
    'ok'    => true,
    'token' => $token,
    'user'  => [
        'firstName'    => $user['firstName'],
        'lastName'     => $user['lastName'],
        'email'        => $user['email'],
        'idEnt'        => $ient,
        'shortDescEnt' => $user['shortDescEnt'],
        'lang'         => $user['lang'],
        'auths'        => $auths,
        'ents'         => $ents,
    ],
]);
