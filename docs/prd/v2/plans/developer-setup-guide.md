# Developer Setup Guide
## Resonance MVP - Local Development Environment

**Version:** 1.0  
**Last Updated:** January 2025  
**Prerequisites Time:** ~30-45 minutes  
**Setup Time:** ~15-20 minutes

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Setup](#4-database-setup)
5. [Running the Application](#5-running-the-application)
6. [Development Workflow](#6-development-workflow)
7. [Common Tasks](#7-common-tasks)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

Install the following tools before proceeding:

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | 24.x LTS | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 11.x | Package manager | Comes with Node.js |
| **Docker Desktop** | Latest | Container runtime | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | 2.x | Version control | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Latest | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com/) |

### 1.2 Verify Prerequisites

Open your terminal and run:

```bash
# Check Node.js version (should be 24.x)
node --version

# Check npm version (should be 11.x)
npm --version

# Check Docker version
docker --version
docker-compose --version

# Check Git version
git --version
```

**Expected output:**
```
v24.14.0 (or higher 24.x)
11.10.1 (or higher)
Docker version 24.0.7, build afdd53b
Docker Compose version v2.23.3
git version 2.43.0
```

### 1.3 Optional but Recommended

| Software | Purpose |
|----------|---------|
| **PostgreSQL Client** | Database management (pgAdmin, DBeaver) |
| **Redis Commander** | Redis GUI (npm install -g redis-commander) |
| **Postman** | API testing |
| **jq** | JSON processing (brew install jq) |

### 1.4 VS Code Extensions

Install these VS Code extensions for the best development experience:

**Essential:**
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- TypeScript Hero (rbbit.typescript-hero)

**Recommended:**
- GitLens (eamodio.gitlens)
- Docker (ms-azuretools.vscode-docker)
- PostgreSQL (ckolkman.vscode-postgres)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Auto Rename Tag (formulahendry.auto-rename-tag)
- Path Intellisense (christian-kohler.path-intellisense)

**Install all at once:**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension rbbit.typescript-hero
code --install-extension eamodio.gitlens
code --install-extension ms-azuretools.vscode-docker
code --install-extension ckolkman.vscode-postgres
code --install-extension bradlc.vscode-tailwindcss
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
```

---

## 2. Initial Setup

### 2.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/resonance.git

# Navigate to project directory
cd resonance

# Check the structure
ls -la
```

**Expected structure:**
```
resonance/
├── apps/
│   ├── web/           # React frontend
│   ├── api/           # Fastify backend
│   └── ml/            # ML services
├── packages/          # Shared packages
├── infrastructure/    # Terraform configs
├── docs/             # Documentation
├── docker/           # Docker configurations
├── turbo.json        # Turborepo config
├── package.json      # Root package.json
└── README.md
```

### 2.2 Install Dependencies

```bash
# Install all dependencies (uses Turborepo)
npm install

# This will install dependencies for:
# - Root workspace
# - apps/web
# - apps/api
# - apps/ml
# - All shared packages
```

**Time:** ~3-5 minutes depending on internet speed

### 2.3 Verify Installation

```bash
# Check that all packages installed correctly
npm run check

# Should output something like:
# ✅ All dependencies installed
# ✅ TypeScript compilation successful
# ✅ ESLint configurations valid
```

---

## 3. Environment Configuration

### 3.1 Create Environment Files

Each app requires its own `.env` file. We've provided templates.

```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/ml/.env.example apps/ml/.env
```

### 3.2 Configure API Environment

Edit `apps/api/.env`:

```bash
# ==========================================
# API Server Configuration
# ==========================================
NODE_ENV=development
PORT=3000
HOST=localhost

# ==========================================
# Database Configuration
# ==========================================
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=resonance_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# ==========================================
# Redis Configuration
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ==========================================
# Authentication
# ==========================================
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ==========================================
# External Services
# ==========================================
OPENAI_API_KEY=your-openai-api-key-here

# ==========================================
# Email (Development)
# ==========================================
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password

# ==========================================
# File Storage
# ==========================================
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=resonance-dev-uploads

# ==========================================
# Logging
# ==========================================
LOG_LEVEL=debug

# ==========================================
# CORS
# ==========================================
CORS_ORIGIN=http://localhost:5173
```

**Required for MVP:**
- `DATABASE_*` - PostgreSQL connection
- `REDIS_*` - Redis connection
- `JWT_SECRET` - Generate a secure random string
- `OPENAI_API_KEY` - Get from [OpenAI](https://platform.openai.com/api-keys)

**Optional for local development:**
- Email (can use console logging)
- AWS/S3 (can use local storage)

### 3.3 Configure Web App Environment

Edit `apps/web/.env`:

```bash
# ==========================================
# Web App Configuration
# ==========================================
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Resonance
VITE_APP_VERSION=1.0.0

# ==========================================
# Feature Flags
# ==========================================
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false

# ==========================================
# External Services
# ==========================================
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

### 3.4 Configure ML Service Environment

Edit `apps/ml/.env`:

```bash
# ==========================================
# ML Service Configuration
# ==========================================
NODE_ENV=development
PORT=3001

# ==========================================
# OpenAI Configuration
# ==========================================
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# ==========================================
# Database Configuration
# ==========================================
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=resonance_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# ==========================================
# Redis Configuration
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3.5 Generate JWT Secret

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(256).toString('base64'))"

# Copy the output and paste it as your JWT_SECRET
```

### 3.6 Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key immediately (you won't see it again)
6. Add to your `.env` files

**Note:** You'll need to add billing information for GPT-4 access.

---

## 4. Database Setup

### 4.1 Start Infrastructure with Docker

We use Docker Compose for local PostgreSQL and Redis.

```bash
# Start all infrastructure services
npm run infra:up

# Or manually with Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

**This starts:**
- PostgreSQL 16 with pgvector extension
- Redis 7
- (Optional) Local S3 (LocalStack)

**Wait for services to be ready:**
```bash
# Check if services are running
docker-compose -f docker/docker-compose.yml ps

# Should see:
# NAME                COMMAND                  SERVICE             STATUS              PORTS
# resonance-db        "docker-entrypoint.s…"   postgres            running             0.0.0.0:5432->5432/tcp
# resonance-redis     "docker-entrypoint.s…"   redis               running             0.0.0.0:6379->6379/tcp
```

### 4.2 Verify Database Connection

```bash
# Connect to PostgreSQL
docker exec -it resonance-db psql -U postgres -d resonance_dev

# Should see PostgreSQL prompt:
# psql (15.4)
# Type "help" for help.
# 
# resonance_dev=#

# Test pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

# Should return:
#  extname | extversion | nspname | extrelocatable 
# ---------+------------+---------+----------------
#  vector  | 0.5.0      | public  | t

# Exit PostgreSQL
\q
```

### 4.3 Verify Redis Connection

```bash
# Connect to Redis
docker exec -it resonance-redis redis-cli

# Should see:
# 127.0.0.1:6379>

# Test Redis
PING

# Should return:
# PONG

# Exit Redis
exit
```

### 4.4 Run Database Migrations

```bash
# Navigate to API app
cd apps/api

# Run migrations
npm run db:migrate

# Expected output:
# > resonance-api@1.0.0 db:migrate
# >typeorm migration:run -d src/config/database.ts
# 
# query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = ...
# query: CREATE TABLE "migrations" ...
# Running migration: 1704067200000-InitialSchema
# Migration 1704067200000-InitialSchema has been executed successfully.
# All migrations have been executed successfully.
```

### 4.5 Seed Database (Optional)

```bash
# Seed with development data
npm run db:seed

# This creates:
# - Test user accounts
# - Sample experiences
# - Sample job postings
# - Sample matches
```

---

## 5. Running the Application

### 5.1 Start All Services (Development)

**Option A: Start everything at once (recommended)**

```bash
# From project root
npm run dev

# This runs:
# - Frontend (port 5173)
# - Backend API (port 3000)
# - ML service (port 3001)
# - Watches for changes
```

**Option B: Start services individually**

Terminal 1 - API Server:
```bash
cd apps/api
npm run dev
# API running on http://localhost:3000
```

Terminal 2 - Web App:
```bash
cd apps/web
npm run dev
# Web app running on http://localhost:5173
```

Terminal 3 - ML Service:
```bash
cd apps/ml
npm run dev
# ML service running on http://localhost:3001
```

### 5.2 Verify Services Are Running

**API Health Check:**
```bash
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-01-15T10:30:00Z",
#   "services": {
#     "database": "connected",
#     "redis": "connected",
#     "openai": "configured"
#   }
# }
```

**Web App:**
```bash
# Open in browser
open http://localhost:5173

# Should see Resonance landing page
```

**ML Service:**
```bash
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "ok",
#   "model": "gpt-4",
#   "embedding_model": "text-embedding-3-small"
# }
```

### 5.3 Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Web App** | http://localhost:5173 | Frontend application |
| **API** | http://localhost:3000 | Backend API |
| **API Docs** | http://localhost:3000/documentation | Swagger documentation |
| **ML Service** | http://localhost:3001 | ML endpoints |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache/sessions |

---

## 6. Development Workflow

### 6.1 Branch Strategy

```bash
# Create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/MVP-123-profile-ui

# Make changes and commit
git add .
git commit -m "feat: add profile editing form"

# Push and create PR
git push -u origin feature/MVP-123-profile-ui
# Then create PR on GitHub
```

### 6.2 Running Tests

```bash
# Run all tests
npm test

# Run tests for specific app
cd apps/api
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- profile.test.ts
```

### 6.3 Linting and Formatting

```bash
# Lint all code
npm run lint

# Lint specific app
cd apps/web
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### 6.4 Building for Production

```bash
# Build all apps
npm run build

# Build specific app
cd apps/api
npm run build

# Output will be in dist/ directory
```

### 6.5 Database Migrations

```bash
# Create a new migration
cd apps/api
npm run db:create-migration -- -n AddUserProfileFields

# Run migrations
npm run db:migrate

# Revert last migration
npm run db:revert

# Check migration status
npm run db:status
```

### 6.6 Debugging

**VS Code Debugging:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Web",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/web/src"
    }
  ]
}
```

**Node.js Debugging:**
```bash
# Start API with debugger
cd apps/api
NODE_OPTIONS='--inspect' npm run dev

# Open chrome://inspect in Chrome
```

---

## 7. Common Tasks

### 7.1 Creating a New API Endpoint

```bash
# 1. Create route file
touch apps/api/src/routes/profile.ts

# 2. Create service file
touch apps/api/src/services/profile.service.ts

# 3. Add tests
touch apps/api/tests/routes/profile.test.ts

# 4. Register route in apps/api/src/routes/index.ts
# 5. Run tests
npm test
```

### 7.2 Creating a New React Component

```bash
# 1. Create component directory
mkdir -p apps/web/src/components/ProfileEditor

# 2. Create component files
touch apps/web/src/components/ProfileEditor/ProfileEditor.tsx
touch apps/web/src/components/ProfileEditor/ProfileEditor.test.tsx
touch apps/web/src/components/ProfileEditor/index.ts

# 3. Create story (optional)
touch apps/web/src/components/ProfileEditor/ProfileEditor.stories.tsx
```

### 7.3 Adding a New Database Table

```bash
# 1. Create entity file
touch apps/api/src/models/Experience.ts

# 2. Create migration
cd apps/api
npm run db:create-migration -- -n AddExperiencesTable

# 3. Edit migration file in src/migrations/

# 4. Run migration
npm run db:migrate

# 5. Update entity and test
```

### 7.4 Resetting the Database

```bash
# Drop and recreate database
npm run db:reset

# This will:
# - Drop all tables
# - Re-run all migrations
# - Re-seed with test data
```

### 7.5 Viewing Logs

```bash
# View API logs
cd apps/api
npm run dev
# Logs appear in terminal

# View specific log file
tail -f logs/application.log

# View Docker logs
docker-compose -f docker/docker-compose.yml logs -f postgres
docker-compose -f docker/docker-compose.yml logs -f redis
```

### 7.6 Checking API Endpoints

```bash
# Using curl
curl -X GET http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using HTTPie (easier to read)
http GET http://localhost:3000/api/v1/profile \
  Authorization:"Bearer YOUR_TOKEN"

# Using Postman
# Import postman_collection.json from docs/postman/
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: Port already in use

```bash
# Error: Error: listen EADDRINUSE: address already in use :::3000

# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### Issue: Database connection refused

```bash
# Error: connect ECONNREFUSED 127.0.0.1:5432

# Check if PostgreSQL is running
docker ps | grep postgres

# Restart if not running
docker-compose -f docker/docker-compose.yml restart postgres

# Check logs
docker-compose -f docker/docker-compose.yml logs postgres
```

#### Issue: Redis connection refused

```bash
# Error: Redis connection failed

# Check if Redis is running
docker ps | grep redis

# Restart if not running
docker-compose -f docker/docker-compose.yml restart redis

# Test connection
docker exec -it resonance-redis redis-cli ping
```

#### Issue: JWT_SECRET not set

```bash
# Error: JWT_SECRET is required

# Generate and add to .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'))")" >> apps/api/.env
```

#### Issue: OpenAI API errors

```bash
# Error: Invalid API Key

# Verify API key is correct in .env
grep OPENAI_API_KEY apps/api/.env

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check billing at https://platform.openai.com/account/billing
```

#### Issue: Node modules issues

```bash
# Error: Cannot find module or weird errors

# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm package-lock.json
npm install
```

#### Issue: TypeORM migration issues

```bash
# Error: Migration failed

# Check migration status
npm run db:status

# Revert last migration
npm run db:revert

# Reset database
npm run db:reset
```

#### Issue: Docker not starting

```bash
# Error: Cannot connect to Docker daemon

# Check Docker Desktop is running
# macOS: Check for Docker icon in menu bar

# Restart Docker Desktop

# Check Docker status
docker info
```

### 8.2 Getting Help

**Check Documentation:**
- Architecture: `/docs/prd/v2/architecture/technical-architecture-v1.md`
- API Docs: http://localhost:3000/documentation
- README: `/README.md`

**Ask in Slack:**
- #eng-help
- #eng-frontend
- #eng-backend

**Create GitHub Issue:**
- Use issue template
- Include reproduction steps
- Include error logs

### 8.3 Performance Issues

**Slow API responses:**
```bash
# Check database indexes
# Enable query logging
LOG_LEVEL=debug npm run dev

# Check slow queries
# In PostgreSQL:
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

**Slow frontend:**
```bash
# Check bundle size
cd apps/web
npm run analyze

# Check React DevTools Profiler
# Install React DevTools browser extension
```

**Memory issues:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Check memory usage
node --v8-options | grep "max-old-space-size"
```

---

## Appendix A: Quick Start Checklist

**Complete this checklist to ensure everything is set up correctly:**

- [ ] Node.js 24.x installed
- [ ] Docker Desktop installed and running
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment files created (`.env` in each app)
- [ ] JWT_SECRET generated and configured
- [ ] OpenAI API key configured
- [ ] Docker services started (`npm run infra:up`)
- [ ] PostgreSQL connection verified
- [ ] Redis connection verified
- [ ] Database migrated (`npm run db:migrate`)
- [ ] API running on port 3000
- [ ] Web app running on port 5173
- [ ] Health check returns OK
- [ ] Can create test user account
- [ ] VS Code extensions installed
- [ ] Git hooks configured (happens on npm install)

---

## Appendix B: Useful Commands Reference

```bash
# Development
npm run dev                  # Start all services
npm run dev:web             # Start frontend only
npm run dev:api             # Start backend only
npm run dev:ml              # Start ML service only

# Infrastructure
npm run infra:up            # Start Docker services
npm run infra:down          # Stop Docker services
npm run infra:logs          # View Docker logs
npm run infra:reset         # Reset Docker volumes

# Database
npm run db:migrate          # Run migrations
npm run db:revert           # Revert last migration
npm run db:seed             # Seed database
npm run db:reset            # Reset and reseed

# Testing
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage

# Code Quality
npm run lint                # Lint all code
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format code with Prettier
npm run type-check          # TypeScript type checking

# Building
npm run build               # Build all apps
npm run build:web           # Build frontend
npm run build:api           # Build backend

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # Follow logs
docker-compose ps           # List services
```

---

## Appendix C: Environment Variables Reference

### API (apps/api/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment |
| PORT | No | 3000 | Server port |
| DATABASE_HOST | Yes | localhost | PostgreSQL host |
| DATABASE_PORT | Yes | 5432 | PostgreSQL port |
| DATABASE_NAME | Yes | resonance_dev | Database name |
| DATABASE_USER | Yes | postgres | Database user |
| DATABASE_PASSWORD | Yes | postgres | Database password |
| REDIS_HOST | Yes | localhost | Redis host |
| REDIS_PORT | Yes | 6379 | Redis port |
| JWT_SECRET | Yes | - | JWT signing secret |
| JWT_EXPIRES_IN | No | 15m | JWT expiry time |
| OPENAI_API_KEY | Yes | - | OpenAI API key |

### Web (apps/web/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | No | http://localhost:3000 | API URL |
| VITE_APP_NAME | No | Resonance | App name |

### ML (apps/ml/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| DATABASE_HOST | Yes | localhost | PostgreSQL host |
| REDIS_HOST | Yes | localhost | Redis host |

---

## Appendix D: PostgreSQL Setup (Alternative to Docker)

If you prefer not to use Docker for PostgreSQL:

### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb resonance_dev
psql -d resonance_dev -c "CREATE EXTENSION vector;"
```

### Ubuntu/Debian
```bash
sudo apt-get install postgresql-15
sudo service postgresql start
sudo -u postgres createdb resonance_dev
sudo -u postgres psql -d resonance_dev -c "CREATE EXTENSION vector;"
```

### Windows
Download from: https://www.postgresql.org/download/windows/

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | Dev Team | Initial setup guide |

---

**Happy Coding! 🚀**

If you have any issues or questions, reach out in Slack #eng-help or create a GitHub issue.