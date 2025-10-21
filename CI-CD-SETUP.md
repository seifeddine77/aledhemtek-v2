# 🚀 Configuration CI/CD - Aledhemtek V2

## 📋 Vue d'ensemble

Ce projet utilise **GitHub Actions** pour l'intégration et le déploiement continus (CI/CD).

### Pipeline CI/CD Inclut:
- ✅ Build automatique du Backend (Maven)
- ✅ Build automatique du Frontend (npm)
- ✅ Tests unitaires
- ✅ Scan de sécurité (Trivy)
- ✅ Analyse de qualité du code (SonarCloud)
- ✅ Build Docker
- ✅ Notifications

---

## 🔧 Configuration Requise

### 1️⃣ **Secrets GitHub à Configurer**

Allez dans: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez ces secrets:

| Secret Name | Description | Exemple |
|-------------|-------------|---------|
| `SONAR_TOKEN` | Token SonarCloud | `sqp_xxxxxxxxxxxxx` |
| `DOCKER_USERNAME` | Nom d'utilisateur Docker Hub | `seifeddine77` |
| `DOCKER_PASSWORD` | Mot de passe Docker Hub | `votre_password` |

#### Comment obtenir SONAR_TOKEN:
1. Allez sur https://sonarcloud.io
2. Connectez-vous avec GitHub
3. My Account → Security → Generate Token
4. Copiez le token

#### Comment obtenir Docker Hub credentials:
1. Créez un compte sur https://hub.docker.com
2. Username = votre nom d'utilisateur
3. Password = créez un Access Token dans Account Settings → Security

---

## 📁 Fichiers CI/CD Créés

```
.github/
└── workflows/
    └── ci-cd.yml          # Pipeline principal

service-backend/
└── Dockerfile             # Image Docker backend

service-frontend/
├── Dockerfile             # Image Docker frontend
└── nginx.conf             # Configuration Nginx

docker-compose.yml         # Orchestration complète
```

---

## 🎯 Déclenchement du Pipeline

Le pipeline se déclenche automatiquement sur:
- ✅ Push sur `main` ou `develop`
- ✅ Pull Request vers `main` ou `develop`

### Déclencher manuellement:
1. Allez dans **Actions** sur GitHub
2. Sélectionnez le workflow
3. Cliquez sur **Run workflow**

---

## 📊 Jobs du Pipeline

### 1. **Backend Build & Test**
- Compile le code Java
- Exécute les tests unitaires
- Génère le JAR
- Upload l'artifact

### 2. **Frontend Build & Test**
- Installe les dépendances npm
- Lint le code TypeScript
- Exécute les tests Angular
- Build en mode production
- Upload l'artifact

### 3. **Security Scan**
- Scan des vulnérabilités avec Trivy
- Upload des résultats vers GitHub Security

### 4. **Code Quality**
- Analyse SonarCloud
- Détection de code smell
- Calcul de la couverture de code

### 5. **Docker Build** (sur main uniquement)
- Build des images Docker
- Push vers Docker Hub

### 6. **Notification**
- Résumé du pipeline
- Statut de chaque job

---

## 🐳 Déploiement avec Docker

### Déploiement Local:
```bash
# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Déploiement Production:
```bash
# Build et push les images
docker-compose build
docker-compose push

# Sur le serveur de production
docker-compose pull
docker-compose up -d
```

---

## 📈 Badges de Statut

Ajoutez ces badges à votre README.md:

```markdown
![CI/CD](https://github.com/seifeddine77/aledhemtek-v2/actions/workflows/ci-cd.yml/badge.svg)
![Docker](https://img.shields.io/docker/v/seifeddine77/aledhemtek-backend?label=Docker)
![License](https://img.shields.io/github/license/seifeddine77/aledhemtek-v2)
```

---

## 🔍 Monitoring du Pipeline

### Voir les résultats:
1. **Actions** → Sélectionnez un workflow run
2. Cliquez sur chaque job pour voir les détails
3. Téléchargez les artifacts si nécessaire

### En cas d'échec:
1. Vérifiez les logs du job qui a échoué
2. Corrigez le problème localement
3. Commit et push les corrections
4. Le pipeline se relancera automatiquement

---

## 🚀 Déploiement Automatique (Optionnel)

Pour déployer automatiquement sur un serveur:

### Avec SSH:
Ajoutez ces secrets:
- `SSH_HOST` - IP du serveur
- `SSH_USERNAME` - Nom d'utilisateur
- `SSH_KEY` - Clé privée SSH

Ajoutez ce job dans `.github/workflows/ci-cd.yml`:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [backend-build, frontend-build]
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull
          docker-compose pull
          docker-compose up -d
```

---

## 📝 Bonnes Pratiques

### Branches:
- `main` - Production
- `develop` - Développement
- `feature/*` - Nouvelles fonctionnalités
- `hotfix/*` - Corrections urgentes

### Commits:
```bash
feat: Ajouter authentification OAuth
fix: Corriger bug de paiement
docs: Mettre à jour README
test: Ajouter tests unitaires
```

### Pull Requests:
1. Créez une branche depuis `develop`
2. Faites vos modifications
3. Push et créez une PR vers `develop`
4. Le CI/CD vérifie automatiquement
5. Merge après validation

---

## 🆘 Dépannage

### Pipeline échoue sur les tests:
```bash
# Exécuter les tests localement
cd service-backend
mvn test

cd service-frontend
npm test
```

### Docker build échoue:
```bash
# Tester le build localement
docker build -t test-backend ./service-backend
docker build -t test-frontend ./service-frontend
```

### SonarCloud échoue:
- Vérifiez que le token est valide
- Vérifiez l'organisation et projectKey

---

## 📞 Support

- 📧 Issues GitHub: https://github.com/seifeddine77/aledhemtek-v2/issues
- 📚 Documentation GitHub Actions: https://docs.github.com/actions
- 🐳 Documentation Docker: https://docs.docker.com

---

**Pipeline configuré avec succès! 🎉**
