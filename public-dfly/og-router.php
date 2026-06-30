<?php
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

$PAGES = [
  '/' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe & Vidéaste PACA | DFly - Antoine & Rémi Ferrera',
    'description' => 'Mariage, immobilier, entreprise, événement, portrait. Photo et vidéo en Provence Alpes Côte d\'Azur. Devis gratuit.',
  ],
  '/mariage' => [
    'image'       => 'og-mariage.jpg',
    'title'       => 'Photographe Vidéaste Mariage Nice · Côte d\'Azur — DFly',
    'description' => 'Photographe et vidéaste mariage à Nice, Cannes, Antibes, Monaco. Style reportage naturel, approche cinéma. Devis gratuit.',
  ],
  '/mariage/film' => [
    'image'       => 'og-mariage.jpg',
    'title'       => 'Film de mariage — DFly · PACA',
    'description' => 'Films de mariage cinématographiques en Provence Alpes Côte d\'Azur. Teaser, film souvenir, drone.',
  ],
  '/immobilier' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe Immobilier PACA | Photos & Vidéos de biens — DFly',
    'description' => 'Photos et vidéos immobilières professionnelles en PACA, Cagnes-sur-mer, Antibes, Nice, Cannes... Intérieurs, extérieurs, drone, livraison 72h. Devis gratuit.',
  ],
  '/communication' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe Vidéaste Entreprise PACA | Communication & Marque — DFly',
    'description' => 'Photos et vidéos pour entreprises et marques en PACA. Reportage, portraits, réseaux sociaux, publicité. Devis gratuit.',
  ],
  '/spectacle' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe Vidéaste Spectacle & Événement PACA — DFly',
    'description' => 'Photo et vidéo de spectacles, concerts, conférences et événements en PACA. De Menton à Toulon. Devis gratuit.',
  ],
  '/evenements' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe Vidéaste Spectacle & Événement PACA — DFly',
    'description' => 'Photo et vidéo de spectacles, concerts, conférences et événements en PACA. De Menton à Toulon. Devis gratuit.',
  ],
  '/famille' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photographe Famille & Portrait PACA | Séance Photo — DFly',
    'description' => 'Séances photo famille, portrait et book en PACA. En extérieur ou en intérieur. Des images simples, vraies et durables.',
  ],
  '/contact' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Contact & Devis Gratuit | DFly Photographe Vidéaste PACA',
    'description' => 'Contactez Antoine & Rémi Ferrera pour votre projet photo ou vidéo en PACA. Réponse sous 48h, devis gratuit et sans engagement.',
  ],
  '/photos-190e-festival-des-musiques-du-faucigny-saint-jeoire-2026' => [
    'image'       => 'og-accueil.jpg',
    'title'       => 'Photos — 190e Festival des Musiques du Faucigny · Saint-Jeoire 2026',
    'description' => 'Galerie photo officielle du 190e Festival des Musiques du Faucigny, 28 juin 2026 à Saint-Jeoire. Petit déjeuner, ambiance, cérémonie, vues aériennes et 27 orchestres.',
  ],
];

$page = $PAGES[$path] ?? $PAGES['/'];

$html = file_get_contents(__DIR__ . '/index.html');

$esc_title = htmlspecialchars($page['title'], ENT_QUOTES);
$esc_desc  = htmlspecialchars($page['description'], ENT_QUOTES);
$image_url = 'https://dfly.fr/assets/' . $page['image'];

$html = preg_replace('~(<meta\s+property="og:title"\s+content=")[^"]*("[^/]*/?>)~',    '${1}' . $esc_title . '$2', $html);
$html = preg_replace('~(<meta\s+property="og:description"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $esc_desc  . '$2', $html);
$html = preg_replace('~(<meta\s+property="og:image"\s+content=")[^"]*("[^/]*/?>)~',    '${1}' . $image_url . '$2', $html);
$html = preg_replace('~(<meta\s+name="twitter:title"\s+content=")[^"]*("[^/]*/?>)~',   '${1}' . $esc_title . '$2', $html);
$html = preg_replace('~(<meta\s+name="twitter:description"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $esc_desc . '$2', $html);
$html = preg_replace('~(<meta\s+name="twitter:image"\s+content=")[^"]*("[^/]*/?>)~',   '${1}' . $image_url . '$2', $html);

echo $html;
