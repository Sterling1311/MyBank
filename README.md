# 🏦 MyBank

> Personal finance management application — BankBank project

**Live demo:** https://mybank-frontend.fly.dev

---

## 📋 Description

MyBank is a web application that allows users to manage their personal finances. Users can track their income and expenses, organize them by category, set monthly budgets, and visualize their spending through interactive charts.

Developed as part of the **CDA (Concepteur Développeur d'Applications)** certification at L'École Multimédia — 2025.

---

## ✨ Features

- 🔐 **Authentication** — Secure registration and login with JWT (RS256)
- 💸 **Operations** — Create, read, update and delete income/expense operations
- 🗂️ **Categories** — Custom categories with type (expense/income)
- 📊 **Budget** — Allocate monthly budgets per category with progress tracking
- 📈 **Analytics** — Pie chart and monthly bar chart evolution
- 📅 **Monthly navigation** — Navigate between months with cumulative balance
- 📱 **Responsive** — Mobile-first design with bottom navigation bar
- 🔒 **GDPR** — Privacy policy and consent at registration

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | TanStack Query v5 |
| HTTP | Axios |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Symfony 8.1 + PHP 8.5 |
| ORM | Doctrine + Migrations |
| Auth | LexikJWT (RS256) |
| Database | MySQL 8.0 |
| Tests | PHPUnit 13 |
| Quality | PHPStan level 5 + ESLint |
| CI/CD | GitHub Actions |
| Deployment | Fly.io |
| Database (prod) | Filess.io |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [PHP 8.x](https://www.php.net/downloads.php) + Composer
- [Node.js 20+](https://nodejs.org/) + npm

### 1. Clone the repository

```bash
git clone https://github.com/Sterling1311/MyBank.git
cd MyBank
```

### 2. Start the database

```bash
docker compose up db -d
```

### 3. Start the backend

```bash
cd backend
cp .env.example .env
composer install
php bin/console doctrine:migrations:migrate --no-interaction
php -S localhost:8080 -t public
```

### 4. Start the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 5. Open the application

Visit **http://localhost:3000** and create an account.

---

## 🧪 Running Tests

### Backend tests (PHPUnit)

```bash
cd backend
php bin/phpunit --testdox
```

### Static analysis (PHPStan level 5)

```bash
cd backend
vendor/bin/phpstan analyse src --level=5
```

### Frontend linting (ESLint)

```bash
cd frontend
npm run lint
```

---

## 🔄 CI/CD Pipeline

GitHub Actions runs automatically on every push to `main` and `develop`:

1. **PHP setup** — PHP 8.4 + extensions (pdo, pdo_mysql, zip, sodium)
2. **Dependencies** — `composer install`
3. **JWT keys** — Generated via OpenSSL
4. **Database** — Test database creation + migrations
5. **Tests** — PHPUnit integration tests
6. **PHPStan** — Static analysis level 5
7. **Node.js setup** — Node 24 + npm install
8. **ESLint** — Frontend linting
9. **Build** — Vite production build

---

## 🌐 Deployment

The application is deployed on **Fly.io** (Paris region):

| Service | URL |
|---|---|
| Frontend | https://mybank-frontend.fly.dev |
| Backend | https://mybank-backend.fly.dev |
| Database | Filess.io MySQL (managed) |

### Manual deployment

```bash
# Backend
cd backend
fly deploy --local-only --app mybank-backend

# Frontend
cd frontend
fly deploy --local-only --no-cache --app mybank-frontend
```

### Rollback procedure

```bash
# 1. Identify the last stable SHA from GitHub Actions
# 2. Retag the stable image as latest
docker pull ghcr.io/sterling1311/mybank-backend:{SHA}
docker tag ghcr.io/sterling1311/mybank-backend:{SHA} ghcr.io/sterling1311/mybank-backend:latest
docker push ghcr.io/sterling1311/mybank-backend:latest

# 3. SSH into the server and restart
fly ssh console --app mybank-backend
docker compose pull && docker compose up -d
```

---

## 📁 Project Structure

```
MyBank/
├── backend/                    # Symfony 8.1 API
│   ├── src/
│   │   ├── Controller/         # REST controllers
│   │   ├── Entity/             # Doctrine entities
│   │   ├── Repository/         # Database queries
│   │   └── Security/           # JWT configuration
│   ├── migrations/             # Database migrations
│   ├── tests/                  # PHPUnit tests
│   └── docker-entrypoint.sh    # Production startup script
│
├── frontend/                   # React 18 SPA
│   ├── src/
│   │   ├── components/         # Shared components (Navbar, Footer)
│   │   ├── features/
│   │   │   ├── auth/           # Login, AuthContext
│   │   │   ├── operations/     # Dashboard, OperationForm, OperationDetail
│   │   │   ├── categories/     # CategoryPage
│   │   │   └── budget/         # BudgetPage
│   │   ├── pages/              # Static pages (PrivacyPolicy)
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interfaces
│   └── public/
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
│
└── docker-compose.yml          # Local development orchestration
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (Symfony default)
- Authentication via **JWT RS256** tokens (1 hour TTL)
- **Parameterized queries** via Doctrine (SQL injection protection)
- No secrets in repository — all via environment variables
- **HTTPS** enforced on production (Fly.io)
- GDPR-compliant privacy policy and consent flow

---

## 📚 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login + JWT token |
| GET | /api/operations | Yes | List operations (filterable by month) |
| POST | /api/operations | Yes | Create operation |
| GET | /api/operations/{id} | Yes | Get operation |
| PUT | /api/operations/{id} | Yes | Update operation |
| DELETE | /api/operations/{id} | Yes | Delete operation |
| GET | /api/operations/summary | Yes | Monthly summary |
| GET | /api/categories | Yes | List categories |
| POST | /api/categories | Yes | Create category |
| DELETE | /api/categories/{id} | Yes | Delete category |
| GET | /api/budgets | Yes | List budgets + balance |
| POST | /api/budgets | Yes | Create/update budget |
| DELETE | /api/budgets/{id} | Yes | Delete budget |

---

## 👤 Author

**Stelian Wyllan MBA BIVEGUE**
CDA 3ème année — L'École Multimédia — 2025

---

## 📄 License

This project was developed for educational purposes as part of the CDA certification.
