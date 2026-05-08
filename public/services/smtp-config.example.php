<?php
// Copier ce fichier en smtp-config.php UN NIVEAU AU-DESSUS du web root
// Ex : /home/user/smtp-config.php  (jamais dans public_html/)
// Ne jamais committer smtp-config.php dans le repo.

return [
    'host' => 'mail.dfly.fr',
    'port' => 465,
    'user' => 'contact@dfly.fr',
    'pass' => 'MOT_DE_PASSE_ICI',
    'from' => 'contact@dfly.fr',
    'cc'   => 'contact@dfly.fr',
];
