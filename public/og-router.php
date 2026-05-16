<?php
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

$OG = [
  '/'              => 'og-accueil.jpg',
  '/mariage'       => 'og-mariage.jpg',
  '/mariage/film'  => 'og-mariage.jpg',
  '/immobilier'    => 'og-accueil.jpg',
  '/communication' => 'og-accueil.jpg',
  '/spectacle'     => 'og-accueil.jpg',
  '/evenements'    => 'og-accueil.jpg',
  '/famille'       => 'og-accueil.jpg',
  '/contact'       => 'og-accueil.jpg',
];

$image = $OG[$path] ?? 'og-accueil.jpg';

$html = file_get_contents(__DIR__ . '/index.html');

// Remplace og:image et twitter:image par l'image de la page
$html = preg_replace(
  '~(<meta\s+property="og:image"\s+content=")[^"]*(")\s*/?>~',
  '${1}https://dfly.fr/assets/' . $image . '$2 />',
  $html
);
$html = preg_replace(
  '~(<meta\s+name="twitter:image"\s+content=")[^"]*(")\s*/?>~',
  '${1}https://dfly.fr/assets/' . $image . '$2 />',
  $html
);

echo $html;
