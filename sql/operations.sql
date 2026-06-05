-- ============================================================
-- JOURNAL DES INTERVENTIONS DIRECTES SUR LA BASE
-- Consigner ici chaque opération manuelle avec date et contexte.
-- Format : -- [YYYY-MM-DD] [base] [description]
-- ============================================================


-- [2026-06-04] alphoxfr_photos — Ajout colonne ip manquante dans HabilSessions
ALTER TABLE HabilSessions ADD COLUMN ip VARCHAR(15) DEFAULT NULL;
