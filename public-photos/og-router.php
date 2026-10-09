<?php
// Open Graph dynamique pour l'application Photos.
//
// Par défaut, le lien partagé d'une galerie (?path=...&i=<entId>) devait
// afficher un aperçu générique (texte DFly) sur WhatsApp/Facebook, quelle que
// soit la galerie — parce que leur robot visite l'URL sans session, et que
// rien ne réinjectait de titre/image par galerie. Ce script lit le dossier
// désigné et sert un aperçu adapté, sans jamais exposer plus que ce dossier
// précis (jamais de récursion dans les sous-dossiers).

$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($uri, '/') ?: '/';

$html = file_get_contents(__DIR__ . '/index.html');

$title    = 'Photos';
$desc     = '';
$imageUrl = null;

if ($path === '/albums') {
    require __DIR__ . '/services/galerie-auth.php';
    $cfg = galerie_load_config(true);

    if ($cfg) {
        $title = $cfg['app_name'] ?? $title;

        $entId   = isset($_GET['i']) ? (int) $_GET['i'] : 0;
        $subPath = isset($_GET['path']) ? (string) $_GET['path'] : '';
        $subPath = ltrim(preg_replace('/\.\./', '', $subPath), '/');

        if ($entId > 0) {
            $link = @mysqli_connect($cfg['db_host'], $cfg['db_user'], $cfg['db_pass'], $cfg['db_name'], $cfg['db_port'] ?? 3306);
            if ($link) {
                mysqli_set_charset($link, 'utf8mb4');
                $res = mysqli_query($link, 'SELECT shortDesc FROM Entreprise WHERE id = ' . $entId . ' LIMIT 1');
                $row = $res ? mysqli_fetch_assoc($res) : null;
                mysqli_close($link);

                if ($row) {
                    $entSlug   = galerie_ent_slug($row['shortDesc']);
                    $paths     = galerie_ent_paths($cfg, $entSlug);
                    $targetDir = $subPath !== '' ? $paths['galerie_root'] . '/' . $subPath : $paths['galerie_root'];

                    if (is_dir($targetDir)) {
                        // ── Titre / texte depuis _meta.json de CE dossier uniquement ──
                        $metaFile = $targetDir . '/_meta.json';
                        $meta     = file_exists($metaFile) ? (json_decode(file_get_contents($metaFile), true) ?? []) : [];

                        $title = $meta['title'] ?? ($subPath !== '' ? basename($subPath) : $title);

                        $descParts = [];
                        if (!empty($meta['subtitle'])) {
                            $descParts[] = $meta['subtitle'];
                        }
                        if (!empty($meta['message'])) {
                            $descParts[] = $meta['message'];
                        } elseif (!empty($meta['videoHtml'])) {
                            $stripped = trim(preg_replace('/\s+/', ' ', strip_tags($meta['videoHtml'])));
                            if ($stripped !== '') $descParts[] = $stripped;
                        }
                        $desc = trim(implode(' — ', $descParts));
                        if (mb_strlen($desc) > 200) $desc = mb_substr($desc, 0, 197) . '…';

                        // ── Image = 1re photo DIRECTEMENT dans ce dossier (jamais un sous-dossier) ──
                        $IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
                        $images = [];
                        foreach (scandir($targetDir) as $f) {
                            if ($f === '.' || $f === '..') continue;
                            if (is_file($targetDir . '/' . $f) && in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), $IMAGE_EXT)) {
                                $images[] = $f;
                            }
                        }
                        natsort($images);
                        $images = array_values($images);

                        if (!empty($images)) {
                            $relFile   = ($subPath !== '' ? $subPath . '/' : '') . $images[0];
                            $thumbPath = $paths['thumbnails_root'] . '/' . $relFile;
                            $relUrl    = file_exists($thumbPath)
                                ? $paths['thumbnails_url'] . '/' . $relFile
                                : $paths['galerie_url']    . '/' . $relFile;
                            $imageUrl  = rtrim($cfg['app_url'], '/') . $relUrl;
                        }
                    }
                }
            }
        }
    }
}

$escTitle = htmlspecialchars($title, ENT_QUOTES);
$escDesc  = htmlspecialchars($desc,  ENT_QUOTES);

$html = preg_replace('~<title>.*?</title>~s', '<title>' . $escTitle . '</title>', $html);
$html = preg_replace('~(<meta\s+name="description"\s+content=")[^"]*("[^/]*/?>)~',       '${1}' . $escDesc  . '$2', $html);
$html = preg_replace('~(<meta\s+property="og:title"\s+content=")[^"]*("[^/]*/?>)~',      '${1}' . $escTitle . '$2', $html);
$html = preg_replace('~(<meta\s+property="og:description"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $escDesc  . '$2', $html);
$html = preg_replace('~(<meta\s+name="twitter:title"\s+content=")[^"]*("[^/]*/?>)~',      '${1}' . $escTitle . '$2', $html);
$html = preg_replace('~(<meta\s+name="twitter:description"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $escDesc  . '$2', $html);

if ($imageUrl) {
    $escImg = htmlspecialchars($imageUrl, ENT_QUOTES);
    $html = preg_replace('~(<meta\s+property="og:image"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $escImg . '$2', $html);
    $html = preg_replace('~(<meta\s+name="twitter:image"\s+content=")[^"]*("[^/]*/?>)~', '${1}' . $escImg . '$2', $html);
}

echo $html;
