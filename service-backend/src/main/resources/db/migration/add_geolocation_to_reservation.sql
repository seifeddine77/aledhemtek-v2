-- Migration pour ajouter les champs de géolocalisation à la table reservation
-- À exécuter manuellement ou via un outil de migration

-- Ajouter les colonnes de géolocalisation
ALTER TABLE reservation 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN address TEXT;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN reservation.latitude IS 'Latitude de la localisation de la réservation (optionnel)';
COMMENT ON COLUMN reservation.longitude IS 'Longitude de la localisation de la réservation (optionnel)';
COMMENT ON COLUMN reservation.address IS 'Adresse textuelle de la localisation (optionnel)';

-- Optionnel: Créer un index spatial si nécessaire pour les requêtes géographiques
-- CREATE INDEX idx_reservation_location ON reservation USING gist (point(longitude, latitude));
