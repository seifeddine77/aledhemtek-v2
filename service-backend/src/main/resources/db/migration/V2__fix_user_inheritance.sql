-- Migration pour corriger l'héritage des utilisateurs
-- Ajouter la colonne discriminator à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'USER';

-- Créer la table client avec héritage JOINED
CREATE TABLE IF NOT EXISTS client (
    id BIGINT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Créer la table consultant avec héritage JOINED
CREATE TABLE IF NOT EXISTS consultant (
    id BIGINT PRIMARY KEY,
    profession VARCHAR(255),
    exp INTEGER,
    company_name VARCHAR(255),
    resume_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
