# Aledhemtek V2

![CI/CD](https://github.com/seifeddine77/aledhemtek-v2/actions/workflows/ci-cd.yml/badge.svg)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-green)
![Angular](https://img.shields.io/badge/Angular-15-red)

Application web de gestion d'entreprise avec Spring Boot et Angular.

## Technologies

- **Backend:** Spring Boot 3.0, MySQL, JWT
- **Frontend:** Angular 15, TypeScript, Material UI

## Installation

### Prérequis
- Java 17+
- Node.js 16+
- MySQL 8.0+

### Backend
```bash
cd service-backend
mvn spring-boot:run
```

### Frontend
```bash
cd service-frontend
npm install
npm start
```

## Configuration

1. Créer une base de données MySQL `aledhemtek`
2. Copier `.env.example` vers `.env` et configurer les variables
3. L'application sera accessible sur http://localhost:4200

## Licence

MIT

## 🚀 CI/CD

Ce projet utilise **GitHub Actions** pour l'intégration et le déploiement continus.

### Pipeline automatique:
- ✅ Build Backend (Maven + Java 17)
- ✅ Build Frontend (Angular 15)
- ✅ Tests automatiques
- ✅ Scan de sécurité
- ✅ Création d'artifacts
- ✅ Build Docker

**Chaque push déclenche automatiquement le pipeline!**

## 📦 Déploiement Docker

```bash
# Lancer avec Docker Compose
docker-compose up -d

# Accéder à l'application
# Frontend: http://localhost
# Backend: http://localhost:8080
```

## 🤝 Contribution

Les contributions sont les bienvenues! Créez une Pull Request.

## 📞 Contact

- GitHub: [@seifeddine77](https://github.com/seifeddine77)
- Repository: [aledhemtek-v2](https://github.com/seifeddine77/aledhemtek-v2)
