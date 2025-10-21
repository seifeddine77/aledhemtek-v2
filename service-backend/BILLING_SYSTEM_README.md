# Système de Facturation et Paiement AledhemTek

## Vue d'ensemble

Ce document décrit le système de facturation et paiement automatique intégré à l'application AledhemTek. Le système permet la génération automatique de factures, le traitement de paiements multi-méthodes, l'envoi d'emails automatiques et la gestion complète via un dashboard administrateur.

## Fonctionnalités Principales

### 1. Génération Automatique de Factures
- **Auto-génération** : Factures créées automatiquement après la completion d'une réservation
- **Génération PDF** : Création de fichiers PDF pour les factures (actuellement en HTML)
- **Numérotation automatique** : Format `INV-YYYYMM-XXXXXX`
- **Calculs automatiques** : TVA (20%), frais de service (5%), totaux

### 2. Système de Paiement Multi-Méthodes
- **Carte bancaire** : Intégration Stripe (simulée)
- **PayPal** : Traitement PayPal (simulé)
- **Virement bancaire** : Avec validation manuelle par admin
- **Espèces** : Enregistrement manuel par admin

### 3. Notifications Email Automatiques
- **Envoi de factures** : Email automatique avec PDF en pièce jointe
- **Rappels de paiement** : Pour factures échues (7 jours, puis tous les 15 jours)
- **Confirmations de paiement** : Email de confirmation après paiement réussi

### 4. Dashboard Administrateur
- **Statistiques complètes** : Factures, paiements, revenus
- **Analytiques** : Graphiques mensuels, distribution par statut
- **Actions manuelles** : Génération forcée, traitement factures échues
- **Monitoring système** : Statut santé des services

## Endpoints API

### PaymentController (`/api/payments`)

#### Paiements
- `POST /create-intent` - Créer intention de paiement
- `POST /credit-card` - Traitement carte bancaire
- `POST /paypal` - Traitement PayPal
- `POST /bank-transfer` - Traitement virement (admin)
- `POST /cash` - Traitement espèces (admin)
- `POST /{paymentId}/validate` - Validation virement (admin)

#### Informations
- `GET /statistics` - Statistiques paiements (admin)
- `GET /methods` - Méthodes de paiement disponibles

### AdminController (`/api/admin/dashboard`)

#### Dashboard
- `GET /statistics` - Statistiques complètes
- `GET /invoice-analytics` - Analytiques factures
- `GET /payment-analytics` - Analytiques paiements
- `GET /health` - Statut santé système

#### Actions
- `POST /generate-invoices` - Génération manuelle factures
- `POST /process-overdue` - Traitement factures échues

### InvoiceController (`/api/invoices`)
- Tous les endpoints existants pour gestion des factures
- Nouveaux endpoints pour PDF et envoi email

## Configuration

### Variables d'Environnement

```properties
# Email Configuration
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateways
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

### Configuration Application

```properties
# Company Info
app.company.name=AledhemTek
app.company.email=contact@aledhemtek.com
app.company.address=123 Business Street, City, Country

# Invoice Settings
invoice.pdf.directory=./service-backend/invoices
invoice.vat.rate=0.20
invoice.service.fee.rate=0.05
invoice.overdue.days=30

# Email Settings
spring.mail.host=smtp.gmail.com
spring.mail.port=587
```

## Architecture

### Services Principaux

1. **AutoInvoiceService**
   - Génération automatique de factures
   - Tâches planifiées (toutes les heures)
   - Traitement factures échues (quotidien à 9h)

2. **PaymentProcessingService**
   - Traitement paiements multi-méthodes
   - Validation et confirmation
   - Statistiques paiements

3. **EmailService**
   - Envoi factures avec PDF
   - Rappels de paiement
   - Confirmations de paiement

4. **InvoicePDFService**
   - Génération PDF factures
   - Templates HTML personnalisables

### Entités Principales

1. **Invoice** - Factures avec statuts et calculs automatiques
2. **Payment** - Paiements avec méthodes et statuts
3. **InvoiceItem** - Lignes de facture détaillées

## Tâches Planifiées

### Génération Automatique
- **Fréquence** : Toutes les heures
- **Action** : Recherche réservations complétées sans factures
- **Processus** : Création facture → Génération PDF → Envoi email

### Traitement Factures Échues
- **Fréquence** : Quotidien à 9h00
- **Action** : Mise à jour statuts et envoi rappels
- **Critères** : Factures non payées après date d'échéance

## Sécurité

### Authentification
- Endpoints admin protégés par `@PreAuthorize("hasRole('ADMIN')")`
- JWT tokens pour authentification
- Validation des permissions par rôle

### Données Sensibles
- Clés API en variables d'environnement
- Mots de passe email chiffrés
- Validation des montants et références

## Installation et Déploiement

### Prérequis
1. Java 17+
2. MySQL 8.0+
3. Maven 3.6+
4. Compte email SMTP (Gmail recommandé)

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone [repository-url]
cd aledhemtekv2/service-backend
```

2. **Configurer la base de données**
```sql
CREATE DATABASE aledhemtek;
```

3. **Configurer les variables d'environnement**
```bash
export EMAIL_USERNAME=your-email@gmail.com
export EMAIL_PASSWORD=your-app-password
export STRIPE_SECRET_KEY=sk_test_your_key
```

4. **Compiler et lancer**
```bash
mvn clean install
mvn spring-boot:run
```

### Dépendances Ajoutées

```xml
<!-- JavaMail pour envoi emails -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>jakarta.mail</groupId>
    <artifactId>jakarta.mail-api</artifactId>
</dependency>
```

## Tests et Validation

### Tests Manuels
1. Créer une réservation et la marquer comme complétée
2. Vérifier la génération automatique de facture
3. Tester les différentes méthodes de paiement
4. Vérifier l'envoi d'emails
5. Consulter le dashboard admin

### Logs de Débogage
- Génération factures : `AutoInvoiceService`
- Traitement paiements : `PaymentProcessingService`
- Envoi emails : `EmailService`

## Roadmap et Améliorations

### À Court Terme
1. ✅ Résoudre dépendances JavaMail
2. ✅ Corriger comparaisons dates
3. ✅ Ajouter méthodes repository manquantes
4. 🔄 Intégration vraies passerelles paiement
5. 🔄 Génération PDF réelle (iText/Flying Saucer)

### À Moyen Terme
1. Interface frontend complète
2. Tests unitaires et d'intégration
3. Monitoring et alertes
4. Rapports avancés
5. Multi-devises

### À Long Terme
1. API publique pour intégrations
2. Webhooks pour événements
3. IA pour prédictions de paiement
4. Facturation récurrente
5. Comptabilité intégrée

## Support et Maintenance

### Logs Importants
- `./logs/billing-system.log` - Logs système facturation
- `./logs/payment-processing.log` - Logs traitement paiements
- `./logs/email-service.log` - Logs envoi emails

### Monitoring
- Dashboard admin : `/api/admin/dashboard/health`
- Métriques Spring Boot : `/actuator/health`
- Logs applicatifs : Niveau INFO/DEBUG

### Dépannage Courant
1. **Emails non envoyés** : Vérifier configuration SMTP
2. **Factures non générées** : Vérifier statuts réservations
3. **Paiements échoués** : Vérifier clés API passerelles
4. **PDF non créés** : Vérifier permissions répertoire

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-25  
**Auteur** : Équipe AledhemTek
