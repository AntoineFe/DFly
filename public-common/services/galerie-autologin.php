<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); exit(json_encode(['ok' => false]));
}

require 'galerie-auth.php';

$cle = trim($_GET['cle'] ?? '');
if ($cle === '') {
    http_response_code(400);
    exit(json_encode(['ok' => false, 'error' => 'Clé manquante']));
}

list($link) = galerie_db();

$logFile = __DIR__ . '/galerie-autologin.log';

$c   = mysqli_real_escape_string($link, $cle);
$sql = "SELECT HU.id, HU.firstName, HU.lastName, HU.email, HU.idEnt, HU.lang,
               E.shortDesc AS shortDescEnt
        FROM HabilUsers HU
        INNER JOIN Entreprise E ON E.id = HU.idEnt
        WHERE HU.cle = '$c'";

$res = mysqli_query($link, $sql);
if (!$res || mysqli_num_rows($res) === 0) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' | SELECT user FAIL | rows=' . ($res ? mysqli_num_rows($res) : 'query_failed') . ' | error=' . mysqli_error($link) . ' | cle=' . $cle . PHP_EOL, FILE_APPEND | LOCK_EX);
    mysqli_close($link);
    http_response_code(401);
    exit(json_encode(['ok' => false, 'error' => 'Lien invalide ou expiré']));
}

$user  = mysqli_fetch_assoc($res);
$uid   = (int)$user['id'];
$ient  = (int)$user['idEnt'];
$token = bin2hex(random_bytes(32));
$ip    = mysqli_real_escape_string($link, $_SERVER['REMOTE_ADDR'] ?? '');

$iRes = mysqli_query($link, "INSERT INTO HabilSessions (token, userId, tsOpenSession, tsLastAccess, ip)
    VALUES ('$token', $uid, NOW(), NOW(), '$ip')");
if (!$iRes) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' | INSERT session FAIL | uid=' . $uid . ' | error=' . mysqli_error($link) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// Profils/auths
$pSql  = "SELECT HP.auths FROM HabilProfilUser HPU
           INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
           WHERE HPU.idUser = $uid AND HP.idEnt = $ient";
$pRes  = mysqli_query($link, $pSql);
if (!$pRes) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' | SELECT profils FAIL | uid=' . $uid . ' | error=' . mysqli_error($link) . PHP_EOL, FILE_APPEND | LOCK_EX);
}
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
         WHERE HPU.idUser = $uid
         ORDER BY E.id DESC";
$eRes = mysqli_query($link, $eSql);
if (!$eRes) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' | SELECT entreprises FAIL | uid=' . $uid . ' | error=' . mysqli_error($link) . PHP_EOL, FILE_APPEND | LOCK_EX);
}
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
