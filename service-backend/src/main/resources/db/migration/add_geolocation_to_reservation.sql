-- Migration pour ajouter les champs de géolocalisation à la table reservation (MySQL 8.0+)
-- À exécuter manuellement ou via un outil de migration

ALTER TABLE reservation 
ADD COLUMN IF NOT EXISTS latitude DOUBLE NULL COMMENT 'Latitude de la localisation de la réservation (optionnel)',
ADD COLUMN IF NOT EXISTS longitude DOUBLE NULL COMMENT 'Longitude de la localisation de la réservation (optionnel)',
ADD COLUMN IF NOT EXISTS address TEXT NULL COMMENT 'Adresse textuelle de la localisation (optionnel)';
