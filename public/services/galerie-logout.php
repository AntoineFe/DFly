<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
    require 'galerie-auth.php';
    list($link) = galerie_db();
    $t = mysqli_real_escape_string($link, $m[1]);
    mysqli_query($link, "UPDATE HabilSessions SET tsCloseSession = NOW() WHERE token = '$t'");
    mysqli_close($link);
}
echo json_encode(['ok' => true]);
