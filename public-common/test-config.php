<?php
require __DIR__ . '/services/galerie-auth.php';
$cfg = galerie_load_config(true);
echo '<pre>';
$deployPath = str_replace('\\', '/', dirname(__DIR__) . '/services');
echo 'deployPath testé: ' . $deployPath . "\n";
echo 'contient /photos/ : ' . (strpos($deployPath, '/photos/') !== false ? 'OUI' : 'NON') . "\n";
echo 'smtp_host: ' . ($cfg['smtp_host'] ?? 'VIDE') . "\n";
echo 'db_name: ' . ($cfg['db_name'] ?? 'VIDE') . "\n";

echo 'galerie-auth.php chargé depuis: ' . realpath(__DIR__ . '/services/galerie-auth.php') . "\n";
echo '__DIR__ : ' . __DIR__ . "\n";
echo 'SCRIPT_FILENAME : ' . $_SERVER['SCRIPT_FILENAME'] . "\n";

echo '</pre>';