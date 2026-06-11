# MyBank

Application web de gestion de dépenses personnelles.
Développée avec React (frontend) + Symfony (backend) + MySQL + Docker.

## Prérequis

- Docker Desktop installé et lancé
- Git

## Démarrage en local

```bash
git clone https://github.com/Sterling1311/MyBank.git
cd MyBank
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend API : http://localhost:8080
- phpMyAdmin : http://localhost:8081

## Structure

- `backend/` — API REST Symfony
- `frontend/` — SPA React
- `.github/workflows/` — CI/CD GitHub Actions

## Auteur

Sterling1311 — CDA 3ème année — L'École Multimédia 2025