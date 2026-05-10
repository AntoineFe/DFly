<?php
// Include partagé — valide le token Bearer et retourne les infos de session.
// Usage : require 'galerie-auth.php'; -> $session disponible

function galerie_db() {
    $cfg_path = dirname($_SERVER['DOCUMENT_ROOT']) . '/db-config.php';
    if (!file_exists($cfg_path)) {
        http_response_code(500);
        exit(json_encode(['ok' => false, 'error' => 'db-config.php introuvable']));
    }
    $cfg  = require $cfg_path;
    $link = @mysqli_connect($cfg['host'], $cfg['user'], $cfg['pass'], $cfg['dbname'], $cfg['port']);
    if (!$link) {
        http_response_code(500);
        exit(json_encode(['ok' => false, 'error' => 'Connexion base de données impossible']));
    }
    mysqli_set_charset($link, 'utf8mb4');
    return [$link, $cfg];
}

function galerie_require_auth() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        http_response_code(401);
        exit(json_encode(['ok' => false, 'error' => 'Non authentifié']));
    }
    $token = $m[1];

    [$link] = galerie_db();

    $t = mysqli_real_escape_string($link, $token);
    $sql = "SELECT HS.userId, HS.tsLastAccess,
                   HU.firstName, HU.lastName, HU.email, HU.idEnt, HU.lang,
                   E.shortDesc AS shortDescEnt
            FROM HabilSessions HS
            INNER JOIN HabilUsers HU ON HU.id = HS.userId
            INNER JOIN Entreprise E  ON E.id  = HU.idEnt
            WHERE HS.token = '$t'
              AND HS.tsCloseSession IS NULL
              AND HS.tsLastAccess > DATE_SUB(NOW(), INTERVAL 8 HOUR)";

    $res = mysqli_query($link, $sql);
    if (!$res || mysqli_num_rows($res) === 0) {
        mysqli_close($link);
        http_response_code(401);
        exit(json_encode(['ok' => false, 'error' => 'Session expirée']));
    }

    $row = mysqli_fetch_assoc($res);

    // Rafraîchir tsLastAccess
    mysqli_query($link, "UPDATE HabilSessions SET tsLastAccess = NOW() WHERE token = '$t'");

    // Profils et auths du user
    $uid  = (int)$row['userId'];
    $ient = (int)$row['idEnt'];
    $pSql = "SELECT HP.auths FROM HabilProfilUser HPU
             INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
             WHERE HPU.idUser = $uid AND HP.idEnt = $ient";
    $pRes = mysqli_query($link, $pSql);

    $auths = [];
    while ($p = mysqli_fetch_assoc($pRes)) {
        $decoded = json_decode($p['auths'], true) ?? [];
        foreach ($decoded as $a) {
            $auths[$a['rsrc']] = $a['levels'];
        }
    }

    // Entreprises accessibles
    $eSql = "SELECT DISTINCT E.id, E.shortDesc, E.raiSoc
             FROM Entreprise E
             INNER JOIN HabilProfil HP ON HP.idEnt = E.id
             INNER JOIN HabilProfilUser HPU ON HPU.idProfil = HP.id
             WHERE HPU.idUser = $uid";
    $eRes  = mysqli_query($link, $eSql);
    $ents  = [];
    while ($e = mysqli_fetch_assoc($eRes)) {
        $ents[] = $e;
    }

    mysqli_close($link);

    return [
        'userId'       => $uid,
        'firstName'    => $row['firstName'],
        'lastName'     => $row['lastName'],
        'email'        => $row['email'],
        'idEnt'        => $ient,
        'shortDescEnt' => $row['shortDescEnt'],
        'lang'         => $row['lang'],
        'auths'        => $auths,
        'ents'         => $ents,
        'token'        => $token,
    ];
}

function galerie_has_auth($session, $rsrc, $level) {
    return isset($session['auths'][$rsrc]) && in_array($level, $session['auths'][$rsrc]);
}

function galerie_require_level($session, $rsrc, $level) {
    if (!galerie_has_auth($session, $rsrc, $level)) {
        http_response_code(403);
        exit(json_encode(['ok' => false, 'error' => 'Accès refusé']));
    }
}
