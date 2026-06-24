<?php
// Include partagé — valide le token Bearer et retourne les infos de session.
// Usage : require 'galerie-auth.php'; -> $session disponible

function galerie_load_config(bool $silent = false) {
    // Lit le nom de l'appli généré au moment du build
    $appNameFile = __DIR__ . '/app-name.php';
    $appName     = file_exists($appNameFile) ? require $appNameFile : 'dfly';
    $configName  = $appName . '-config.php';

    $dirs = [
        __DIR__,
        dirname(__DIR__),
        dirname(dirname(__DIR__)),
        dirname(dirname(dirname(__DIR__))),
        dirname(dirname(dirname(dirname(__DIR__)))),
    ];
    foreach ($dirs as $dir) {
        $p = $dir . '/' . $configName;
        if (file_exists($p)) return require $p;
    }
    if ($silent) return null;
    http_response_code(500);
    exit(json_encode(['ok' => false, 'error' => 'galerie-config.php introuvable']));
}

function galerie_db() {
    $cfg  = galerie_load_config();
    $link = @mysqli_connect(
        $cfg['db_host'],
        $cfg['db_user'],
        $cfg['db_pass'],
        $cfg['db_name'],
        $cfg['db_port'] ?? 3306
    );
    if (!$link) {
        http_response_code(500);
        exit(json_encode(['ok' => false, 'error' => 'Connexion base de données impossible']));
    }
    mysqli_set_charset($link, 'utf8mb4');
    return [$link, $cfg];
}

// Retourne les chemins filesystem et URL pour un client donné
function galerie_ent_paths($cfg, $ent) {
    $base    = $cfg['pro_root'] . '/' . $ent;
    $baseUrl = $cfg['pro_url']  . '/' . $ent;
    return [
        'galerie_root'    => $base    . '/galerie',
        'thumbnails_root' => $base    . '/galerie_thumbnails',
        'hd_root'         => $base    . '/galerie_hd',
        'galerie_url'     => $baseUrl . '/galerie',
        'thumbnails_url'  => $baseUrl . '/galerie_thumbnails',
        'hd_url'          => $baseUrl . '/galerie_hd',
    ];
}

// Convertit Entreprise.shortDesc en nom de dossier : minuscules, sans espaces
function galerie_ent_slug($shortDesc) {
    return strtolower(str_replace(' ', '', $shortDesc));
}

function galerie_require_auth() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        http_response_code(401);
        exit(json_encode(['ok' => false, 'error' => 'Non authentifié']));
    }
    $token = $m[1];

    list($link) = galerie_db();

    $t = mysqli_real_escape_string($link, $token);
    $sql = "SELECT HS.userId, HS.tsLastAccess,
                   HU.firstName, HU.lastName, HU.email, HU.idEnt, HU.lang,
                   E.shortDesc AS shortDescEnt
            FROM HabilSessions HS
            INNER JOIN HabilUsers HU ON HU.id = HS.userId
            INNER JOIN Entreprise E  ON E.id  = HU.idEnt
            WHERE HS.token = '$t'
              AND HS.tsCloseSession IS NULL
              AND HS.tsLastAccess > DATE_SUB(NOW(), INTERVAL 90 DAY)";

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
             WHERE HPU.idUser = $uid";
    $pRes = mysqli_query($link, $pSql);

    if (!$pRes) {
        $authLogFile = __DIR__ . '/galerie-auth.log';
        file_put_contents($authLogFile, date('Y-m-d H:i:s') . ' | profils query FAIL | uid=' . $uid . ' | ient=' . $ient . ' | error=' . mysqli_error($link) . PHP_EOL, FILE_APPEND | LOCK_EX);
    } else {
        $rows = [];
        while ($r = mysqli_fetch_assoc($pRes)) { $rows[] = $r; }
        mysqli_data_seek($pRes, 0);
    }

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
             WHERE HPU.idUser = $uid
             ORDER BY E.id DESC";
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
        $logFile = __DIR__ . '/galerie-auth.log';
        file_put_contents($logFile,
            date('Y-m-d H:i:s') . ' | 403 ' . $rsrc . ':' . $level
            . ' | userId=' . ($session['userId'] ?? '?')
            . ' | idEnt='  . ($session['idEnt']  ?? '?')
            . ' | auths='  . json_encode($session['auths'] ?? [])
            . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );
        http_response_code(403);
        exit(json_encode(['ok' => false, 'error' => 'Accès refusé']));
    }
}
