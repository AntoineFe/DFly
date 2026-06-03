<?php
$cle = trim($_GET['cle'] ?? '');
$url = '/galerie' . ($cle !== '' ? '?cle=' . urlencode($cle) : '');
header('Location: ' . $url, true, 301);
exit;
