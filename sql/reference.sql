-- ============================================================
-- RÉFÉRENCE SQL — DFly / Photos
-- Requêtes utiles pour la gestion manuelle de la base.
-- ============================================================


-- ── Créer une nouvelle entité et lier un utilisateur existant ──────────────

-- 1. Créer l'entreprise
INSERT INTO Entreprise (shortDesc, raiSoc)
VALUES ('slug_en_minuscules', 'Raison Sociale');

-- 2. Créer un profil FULL pour cette entreprise (récupérer l'id de l'entreprise au préalable)
INSERT INTO HabilProfil (name, description, idEnt, auths)
VALUES (
    'FULL',
    'Accès complet',
    <id_entreprise>,
    '[{"rsrc":"galerie","levels":["C","R","U","D"]},{"rsrc":"admin","levels":["R"]}]'
);

-- 3. Lier l'utilisateur existant au profil (récupérer l'id du profil au préalable)
INSERT INTO HabilProfilUser (idUser, idProfil)
VALUES (<id_user>, <id_profil>);


-- ── Créer un profil VISU (lecture seule) ──────────────────────────────────

INSERT INTO HabilProfil (name, description, idEnt, auths)
VALUES (
    'VISU',
    'Accès lecture',
    <id_entreprise>,
    '[{"rsrc":"galerie","levels":["R"]}]'
);


-- ── Lister les utilisateurs d'une entité ──────────────────────────────────

SELECT HU.firstName, HU.lastName, HU.email, HP.shortDesc AS profil, HU.id
FROM HabilUsers HU
INNER JOIN HabilProfilUser HPU ON HPU.idUser = HU.id
INNER JOIN HabilProfil HP ON HP.id = HPU.idProfil
WHERE HP.idEnt = 1
ORDER BY HU.firstName, HU.lastName;


-- ── Supprimer définitivement un utilisateur ───────────────────────────────

-- Vérifier avant de supprimer
SELECT id, firstName, lastName, email FROM HabilUsers WHERE id = <id_user>;

-- Supprimer dans l'ordre (contraintes de clés étrangères)
DELETE FROM HabilSessions    WHERE userId  = <id_user>;
DELETE FROM HabilProfilUser  WHERE idUser  = <id_user>;
DELETE FROM HabilUsers       WHERE id      = <id_user>;




DELETE FROM HabilProfilUser
WHERE idUser = <id_user>
  AND idProfil IN (SELECT id FROM HabilProfil WHERE idEnt = <id_entreprise>);


-- ── Fermer toutes les sessions d'un utilisateur ───────────────────────────

UPDATE HabilSessions
SET tsCloseSession = NOW()
WHERE userId = <id_user>
  AND tsCloseSession IS NULL;


-- ── Lister les sessions actives ───────────────────────────────────────────

SELECT HS.id, HU.email, HS.tsOpenSession, HS.tsLastAccess, HS.ip
FROM HabilSessions HS
INNER JOIN HabilUsers HU ON HU.id = HS.userId
WHERE HS.tsCloseSession IS NULL
  AND HS.tsLastAccess > DATE_SUB(NOW(), INTERVAL 90 DAY)
ORDER BY HS.tsLastAccess DESC;
