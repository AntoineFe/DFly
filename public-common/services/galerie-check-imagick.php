<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require 'galerie-auth.php';
$session = galerie_require_auth();
galerie_require_level($session, 'admin', 'R');

echo json_encode([
    'imagick'        => extension_loaded('imagick'),
    'imagick_version'=> extension_loaded('imagick') ? Imagick::getVersion()['versionString'] : null,
    'gd'             => extension_loaded('gd'),
    'gd_version'     => function_exists('gd_info') ? gd_info() : null,
    'php_version'    => PHP_VERSION,
]);
