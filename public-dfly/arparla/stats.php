<?php
$PASSWORD = 'arparla2026';
$auth = false;

if (isset($_POST['pwd']) && $_POST['pwd'] === $PASSWORD) {
    setcookie('arparla_auth', md5($PASSWORD), time()+3600*8, '/');
    $auth = true;
}
if (isset($_COOKIE['arparla_auth']) && $_COOKIE['arparla_auth'] === md5($PASSWORD)) {
    $auth = true;
}
if (isset($_GET['logout'])) {
    setcookie('arparla_auth', '', time()-3600, '/');
    header('Location: stats.php');
    exit;
}

$logFile = __DIR__ . '/arparla_log.csv';
$rows = [];
$totals  = ['scans'=>0,'plays'=>0,'end'=>0];
$uniques = ['scans'=>[],'plays'=>[],'end'=>[]];

if ($auth && file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    array_shift($lines);
    foreach (array_reverse($lines) as $line) {
        $cols = str_getcsv($line);
        if (count($cols) >= 5) {
            $rows[] = $cols;
            // Utiliser vid si dispo, sinon l'IP comme fallback
            $vid = !empty($cols[5]) ? $cols[5] : ($cols[3] ?? 'unknown');
            $evt = $cols[2] ?? '';
            if ($evt === 'visit') { $totals['scans']++; $uniques['scans'][$vid] = true; }
            if ($evt === 'play')  { $totals['plays']++; $uniques['plays'][$vid] = true; }
            if ($evt === 'end')   { $totals['end']++;   $uniques['end'][$vid]   = true; }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Arparla — Stats</title>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Raleway', sans-serif; font-weight: 300; background: #0D0B09; color: #F0E8D8; min-height: 100vh; padding: 2rem 1rem; }
  h1 { font-size: 1.8rem; font-weight: 300; color: #C9A84C; margin-bottom: 0.3rem; }
  h2 { font-size: 0.9rem; font-weight: 300; color: rgba(240,232,216,0.4); margin-bottom: 2rem; letter-spacing: 0.12em; text-transform: uppercase; }
  .login { max-width: 300px; margin: 20vh auto; text-align: center; }
  .login input { width: 100%; padding: 12px 16px; margin: 1rem 0 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; color: #F0E8D8; font-family: inherit; font-size: 14px; }
  .login input::placeholder { color: rgba(240,232,216,0.3); }
  .btn { padding: 10px 28px; background: transparent; border: 1px solid rgba(201,168,76,0.5); border-radius: 8px; color: #C9A84C; font-family: inherit; font-size: 13px; letter-spacing: 0.1em; cursor: pointer; }
  .btn:hover { background: rgba(201,168,76,0.08); }
  .cards { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .card { flex: 1; min-width: 120px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 1.2rem; text-align: center; }
  .card-num { font-size: 2rem; font-weight: 400; color: #C9A84C; line-height: 1.2; }
  .card-num .slash { color: rgba(201,168,76,0.35); margin: 0 4px; font-weight: 300; }
  .card-num .unique { color: rgba(201,168,76,0.6); font-size: 1.4rem; }
  .card-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(240,232,216,0.4); margin-top: 6px; }
  .card-sublabel { font-size: 9px; letter-spacing: 0.1em; color: rgba(240,232,216,0.2); margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(201,168,76,0.7); border-bottom: 1px solid rgba(201,168,76,0.15); }
  td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(240,232,216,0.8); }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
  .badge.visit { background: rgba(100,149,237,0.15); color: #6495ED; }
  .badge.play  { background: rgba(201,168,76,0.15);  color: #C9A84C; }
  .badge.end   { background: rgba(80,200,120,0.15);  color: #50C878; }
  .vid { font-family: monospace; font-size: 11px; color: rgba(240,232,216,0.4); }
  .logout { float: right; font-size: 11px; color: rgba(240,232,216,0.3); text-decoration: none; letter-spacing: 0.08em; }
  .logout:hover { color: #C9A84C; }
  .empty { text-align: center; padding: 3rem; color: rgba(240,232,216,0.3); font-style: italic; }
</style>
</head>
<body>

<?php if (!$auth): ?>
<div class="login">
  <h1>Arparla</h1>
  <h2>Statistiques</h2>
  <form method="post">
    <input type="password" name="pwd" placeholder="Mot de passe" autofocus>
    <br>
    <button type="submit" class="btn">Accéder</button>
  </form>
</div>

<?php else: ?>
<a href="?logout" class="logout">Déconnexion</a>
<h1>Arparla</h1>
<h2>Activité du QR code</h2>

<div class="cards">
  <div class="card">
    <div class="card-num">
      <?= $totals['scans'] ?><span class="slash">/</span><span class="unique"><?= count($uniques['scans']) ?></span>
    </div>
    <div class="card-label">Scans</div>
    <div class="card-sublabel">total / uniques</div>
  </div>
  <div class="card">
    <div class="card-num">
      <?= $totals['plays'] ?><span class="slash">/</span><span class="unique"><?= count($uniques['plays']) ?></span>
    </div>
    <div class="card-label">Écoutes</div>
    <div class="card-sublabel">total / uniques</div>
  </div>
  <div class="card">
    <div class="card-num">
      <?= $totals['end'] ?><span class="slash">/</span><span class="unique"><?= count($uniques['end']) ?></span>
    </div>
    <div class="card-label">Fins écoutées</div>
    <div class="card-sublabel">total / uniques</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Heure</th>
      <th>Événement</th>
      <th>Lieu</th>
      <th>Appareil</th>
      <th>Visiteur</th>
    </tr>
  </thead>
  <tbody>
  <?php if (empty($rows)): ?>
    <tr><td colspan="6" class="empty">Aucune activité enregistrée</td></tr>
  <?php else: ?>
    <?php foreach ($rows as $r): ?>
    <tr>
      <td><?= htmlspecialchars($r[0]) ?></td>
      <td><?= htmlspecialchars($r[1]) ?></td>
      <td><span class="badge <?= htmlspecialchars($r[2]) ?>">
        <?php $labels = ['visit'=>'Scan','play'=>'Lecture','end'=>'Fin écoutée'];
              echo $labels[$r[2]] ?? htmlspecialchars($r[2]); ?>
      </span></td>
      <td><?= htmlspecialchars($r[3]) ?></td>
      <td><?= htmlspecialchars($r[4]) ?></td>
      <td class="vid"><?= htmlspecialchars($r[5] ?? '') ?></td>
    </tr>
    <?php endforeach; ?>
  <?php endif; ?>
  </tbody>
</table>
<?php endif; ?>

</body>
</html>
