-- ==========================================================
-- SCRIPT COMPLET D'INJECTION DE DONNÉES RÉELLES POUR ALEDHEMTEK V2
-- ==========================================================
USE aledhemtek;

-- 1. Nettoyer et mettre à jour les catégories
DELETE FROM evaluations;
DELETE FROM reservation_tasks;
DELETE FROM reservation;
DELETE FROM material;
DELETE FROM rate;
DELETE FROM task;
DELETE FROM service;
DELETE FROM category;

-- Réinitialisation des auto-increments
ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE service AUTO_INCREMENT = 1;
ALTER TABLE task AUTO_INCREMENT = 1;
ALTER TABLE rate AUTO_INCREMENT = 1;
ALTER TABLE material AUTO_INCREMENT = 1;
ALTER TABLE reservation AUTO_INCREMENT = 1;
ALTER TABLE evaluations AUTO_INCREMENT = 1;

-- 2. Insertion des 8 Catégories Métier
INSERT INTO category (id, name, description, img) VALUES
(1, 'Plomberie & Sanitaire', 'Dépannage d''urgence, fuites, robinetterie, chauffe-eau et canalisations.', 'plomberie.jpg'),
(2, 'Électricité & Domotique', 'Mise aux normes, dépannage, tableaux électriques, luminaires et objets connectés.', 'electricite.jpg'),
(3, 'Peinture & Décoration', 'Peinture intérieure, enduits, rénovation de murs, plafonds et revêtements.', 'peinture.jpg'),
(4, 'Bricolage & Menuiserie', 'Montage de meubles, pose de tringles, étagères, rabotage et agencement.', 'bricolage.jpg'),
(5, 'Jardinage & Extérieurs', 'Entretien d''espaces verts, tonte, taille de haies, élagage et nettoyage terrasse.', 'jardinage.jpg'),
(6, 'Climatisation & Chauffage', 'Installation, entretien annuel climatiseurs, purge de radiateurs et thermostats.', 'chauffage.jpg'),
(7, 'Serrurerie & Sécurité', 'Ouverture de portes, remplacement de serrures multipoints et sécurisation.', 'serrurerie.jpg'),
(8, 'Nettoyage & Entretien', 'Ménage à domicile régulier, nettoyage vitres et remise en état après chantier.', 'nettoyage.jpg');

-- 3. Insertion des 16 Services Métier
INSERT INTO service (id, name, description, img, category_id) VALUES
(1, 'Recherche & Réparation de Fuite', 'Diagnostic précis par caméra thermique et réparation immédiate de fuite d''eau.', 'reparation.jpg', 1),
(2, 'Débouchage de Canalisation', 'Débouchage mécanique et hydrocurage haute pression pour éviers, douches et WC.', 'debouchage.jpg', 1),
(3, 'Remplacement Chauffe-eau & Ballon', 'Dépose de l''ancien cumulus, raccordement et mise en service d''un ballon neuf.', 'chauffe-eau.jpg', 1),
(4, 'Rénovation Tableau Électrique', 'Mise en sécurité totale selon norme NF C 15-100 avec disjoncteurs différentiels.', 'tableau-elec.jpg', 2),
(5, 'Pose de Luminaires & Prises', 'Installation soignée d''appliques, spots encastrés, variateurs et prises murales.', 'luminaire.jpg', 2),
(6, 'Installation Domotique & Sécurité', 'Pose de caméras connectées, détecteurs de fumée et interphones vidéo.', 'domotique.jpg', 2),
(7, 'Peinture Murs & Plafonds', 'Préparation minutieuse des supports, application de 2 couches satinées ou mates.', 'peinture-murs.jpg', 3),
(8, 'Rénovation Boiseries & Volets', 'Ponçage, traitement hydrofuge et lasure ou peinture de protection extérieure.', 'boiseries.jpg', 3),
(9, 'Montage Meubles & Dressings', 'Assemblage rigoureux de dressings, buffets, canapés et meubles toutes marques.', 'montage-meubles.jpg', 4),
(10, 'Pose de Portes & Menuiserie', 'Ajustement de portes intérieures, pose de plinthes, baguettes et poignées.', 'menuiserie.jpg', 4),
(11, 'Tonte de Pelouse & Débroussaillage', 'Tonte soignée avec finitions au coupe-bordure et évacuation des déchets verts.', 'tonte.jpg', 5),
(12, 'Taille de Haies & Arbustes', 'Taille rectiligne de haies végétales, désépaississement et ramassage complet.', 'taille-haies.jpg', 5),
(13, 'Entretien & Désinfection Climatiseur', 'Nettoyage des filtres, désinfection de l''évaporateur et contrôle des fluides.', 'clim-entretien.jpg', 6),
(14, 'Désembouage Radiateurs & Purge', 'Optimisation du rendement thermique, purge des circuits et traitement anticalcaire.', 'purge-radiateurs.jpg', 6),
(15, 'Ouverture Porte & Remplacement Serrure', 'Intervention d''urgence sans dégradation et pose de barillet haute sécurité.', 'serrure.jpg', 7),
(16, 'Nettoyage Complet & Fin de Chantier', 'Lessivage des sols, vitrerie intégrale, dépoussiérage et désinfection complète.', 'nettoyage-chantier.jpg', 8);

-- 4. Insertion des Tâches Standardisées
INSERT INTO task (id, name, description, duration, image_name, service_id) VALUES
(1, 'Remplacer joint & clapet robinet', 'Changement des joints d''étanchéité fuyards et cartouche céramique.', 30, 'robinet.jpg', 1),
(2, 'Détecter fuite encastrée', 'Passage de caméra d''inspection et localisation sans destruction de cloison.', 60, 'fuite.jpg', 1),
(3, 'Furet mécanique canalisation', 'Passage de câble rotatif pour désintégrer les bouchons domestiques.', 45, 'furet.jpg', 2),
(4, 'Remplacement disjoncteur différentiel', 'Remplacement d''un disjoncteur 30mA défaillant sur tableau général.', 45, 'disjoncteur.jpg', 4),
(5, 'Pose lustre ou suspension haute', 'Perçage plafond, fixation sécurisée et raccordement électrique.', 40, 'lustre.jpg', 5),
(6, 'Peinture couche d''impression sous-couche', 'Application au rouleau d''un fixateur régulateur de fond.', 90, 'impression.jpg', 7),
(7, 'Peinture 2 couches teinte personnalisée', 'Application fine et croisée pour un tendu parfait sans trace.', 120, 'rouleau.jpg', 7),
(8, 'Montage lit double avec tiroirs', 'Assemblage structure lit, sommier et mécanisme coffre.', 60, 'lit.jpg', 9),
(9, 'Assemblage armoire dressing 3 portes', 'Montage caissons, tringles, étagères et alignement des portes.', 120, 'armoire.jpg', 9),
(10, 'Tonte pelouse < 300m²', 'Passage tondeuse thermique autotractée et coupe-bordure.', 60, 'tonte-task.jpg', 11),
(11, 'Taille linéaire haie < 15m', 'Taille horizontale et verticale au taille-haie électrique silencieux.', 90, 'haie.jpg', 12),
(12, 'Nettoyage filtres et échangeur split', 'Brossage antibactérien et spray désinfectant professionnel.', 45, 'filtre-clim.jpg', 13),
(13, 'Remplacement cylindre européen A2P', 'Dépose de l''ancien barillet et installation d''un cylindre 5 clés protégées.', 30, 'cylindre.jpg', 15),
(14, 'Lavage vitres et baies vitrées', 'Raclage professionnel des vitres intérieures/extérieures sans trace.', 60, 'vitre.jpg', 16);

-- 5. Grilles Tarifaires Actives (rates)
INSERT INTO rate (id, price, start_date, end_date, task_id) VALUES
(1, 45.0, '2026-01-01', NULL, 1),
(2, 85.0, '2026-01-01', NULL, 2),
(3, 70.0, '2026-01-01', NULL, 3),
(4, 95.0, '2026-01-01', NULL, 4),
(5, 50.0, '2026-01-01', NULL, 5),
(6, 65.0, '2026-01-01', NULL, 6),
(7, 110.0, '2026-01-01', NULL, 7),
(8, 55.0, '2026-01-01', NULL, 8),
(9, 120.0, '2026-01-01', NULL, 9),
(10, 45.0, '2026-01-01', NULL, 10),
(11, 75.0, '2026-01-01', NULL, 11),
(12, 80.0, '2026-01-01', NULL, 12),
(13, 90.0, '2026-01-01', NULL, 13),
(14, 40.0, '2026-01-01', NULL, 14);

-- 6. Matériaux et Fournitures associées
INSERT INTO material (id, name, quantity, task_id) VALUES
(1, 'Joint fibre 15/21', 4, 1),
(2, 'Cartouche céramique 35mm', 1, 1),
(3, 'Disjoncteur Legrand 16A', 1, 4),
(4, 'Chevilles Molly multimatière', 4, 5),
(5, 'Ruban de masquage pro 50mm', 2, 6),
(6, 'Peinture blanche satinée 2.5L', 1, 7),
(7, 'Cylindre haute sécurité A2P*', 1, 13);

-- 7. Insertion de Réservations Terminées Réalistes (pour les Avis & Statistiques)
INSERT INTO reservation (id, title, description, address, latitude, longitude, start_date, end_date, status, total_price, assigned, client_id, consultant_id, created_at, updated_at) VALUES
(1, 'Réparation fuite sous évier cuisine', 'Goutte à goutte persistant sous le siphon de cuisine.', '14 Rue de Rivoli, Paris', 48.8566, 2.3522, '2026-02-15 09:00:00', '2026-02-15 10:30:00', 'COMPLETED', 65.0, 1, 2, 3, '2026-02-14 10:00:00', '2026-02-15 11:00:00'),
(2, 'Rénovation tableau disjoncteurs', 'Remplacement des vieux fusibles par des disjoncteurs modernes.', '28 Boulevard Haussmann, Paris', 48.8738, 2.3315, '2026-02-20 14:00:00', '2026-02-20 16:30:00', 'COMPLETED', 135.0, 1, 2, 3, '2026-02-18 11:30:00', '2026-02-20 17:00:00'),
(3, 'Peinture chambre parentale', 'Deux couches de peinture blanc lin et préparation murs.', '5 Avenue Victor Hugo, Paris', 48.8712, 2.2901, '2026-02-25 08:30:00', '2026-02-25 12:30:00', 'COMPLETED', 175.0, 1, 2, 3, '2026-02-22 15:00:00', '2026-02-25 13:00:00'),
(4, 'Montage grand meuble dressing', 'Assemblage dressing 3 portes coulissantes avec tiroirs.', '12 Rue Saint-Honoré, Paris', 48.8654, 2.3328, '2026-03-01 10:00:00', '2026-03-01 12:00:00', 'COMPLETED', 120.0, 1, 2, 3, '2026-02-28 09:00:00', '2026-03-01 12:30:00'),
(5, 'Taille de haie de jardin', 'Taille soignée de 20 mètres de thuyas et ramassage.', '45 Rue de Courcelles, Paris', 48.8790, 2.3080, '2026-03-04 14:00:00', '2026-03-04 16:00:00', 'COMPLETED', 95.0, 1, 2, 3, '2026-03-02 16:20:00', '2026-03-04 16:30:00'),
(6, 'Changement serrure de sécurité', 'Pose d''un nouveau cylindre haute sécurité après emménagement.', '8 Place de la Bastille, Paris', 48.8532, 2.3698, '2026-03-06 11:00:00', '2026-03-06 12:00:00', 'COMPLETED', 90.0, 1, 2, 3, '2026-03-05 18:00:00', '2026-03-06 12:15:00');

-- Liaison des tâches aux réservations
INSERT INTO reservation_tasks (id, quantity, total_price, unit_price, reservation_id, task_id) VALUES
(1, 1, 45.0, 45.0, 1, 1),
(2, 1, 95.0, 95.0, 2, 4),
(3, 1, 110.0, 110.0, 3, 7),
(4, 1, 120.0, 120.0, 4, 9),
(5, 1, 75.0, 75.0, 5, 11),
(6, 1, 90.0, 90.0, 6, 13);

-- 8. Insertion des Évaluations Réelles (Témoignages & Notes)
INSERT INTO evaluations (id, comment, general_rating, service_quality_rating, punctuality_rating, communication_rating, client_id, reservation_id, created_at, updated_at) VALUES
(1, 'Artisan d''un professionnalisme exemplaire ! La fuite sous l''évier a été colmatée en un temps record avec un travail impeccable et de bons conseils préventifs.', 5, 5, 5, 5, 2, 1, '2026-02-15 12:00:00', '2026-02-15 12:00:00'),
(2, 'Remise aux normes de mon tableau électrique exécutée avec une grande rigueur. Tout est bien étiqueté, propre et sécurisé. Je recommande les yeux fermés !', 5, 5, 5, 5, 2, 2, '2026-02-20 18:00:00', '2026-02-20 18:00:00'),
(3, 'Magnifique résultat pour la peinture de notre chambre ! Ligne de démarcation parfaite, zéro projection et finition satinée très élégante.', 5, 5, 4, 5, 2, 3, '2026-02-25 14:30:00', '2026-02-25 14:30:00'),
(4, 'Montage rapide et soigné de notre grand dressing. Les portes coulissantes glissent parfaitement et aucun dégât sur les murs. Très satisfait.', 5, 5, 5, 4, 2, 4, '2026-03-01 13:00:00', '2026-03-01 13:00:00'),
(5, 'Intervention jardinage au top ! Les haies sont taillées au millimètre et le jardin a été nettoyé de tous les résidus de coupe. Vraiment appréciable.', 5, 5, 5, 5, 2, 5, '2026-03-04 17:00:00', '2026-03-04 17:00:00'),
(6, 'Dépannage serrurerie express un samedi matin. Prix transparent annoncé à l''avance sans majoration abusive et serrure de haute qualité posée.', 5, 5, 5, 5, 2, 6, '2026-03-06 13:00:00', '2026-03-06 13:00:00');

SELECT 'Données réelles injectées avec succès !' AS status;
