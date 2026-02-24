# Resonance MVP - Recommended Technology Versions

**Last Updated:** January 2025  
**Purpose:** Reference document for all technology versions used in Resonance MVP

---

## Overview

This document lists all recommended versions for technologies used in the Resonance MVP. Each version has been verified against official sources. **Please verify each version before installation** as new versions may have been released since this document was created.

---

## Core Runtime & Languages

### Node.js
- **Recommended Version:** 24.x LTS
- **Current LTS:** v24.14.0 (as of January 2025)
- **Verification:** https://nodejs.org/
- **Installation:** Download from nodejs.org or use nvm
- **Why LTS:** Long-term support, stability, security updates
- **Notes:** 
  - Version 24 is the current LTS (active support until April 2026)
  - Avoid using "Current" release for production

### npm
- **Recommended Version:** 11.x
- **Current Version:** v11.10.1 (as of January 2025)
- **Verification:** https://github.com/npm/cli/releases
- **Installation:** Comes bundled with Node.js
- **Why This Version:** Latest stable, comes with Node.js 24.x
- **Notes:** To update npm: `npm install -g npm@latest`

### TypeScript
- **Recommended Version:** 5.x
- **Current Version:** 5.3+ (as of January 2025)
- **Verification:** https://www.typescriptlang.org/
- **Installation:** npm install -D typescript
- **Why This Version:** Latest stable with improved type inference

---

## Frontend Technologies

### React
- **Recommended Version:** 19.x
- **Current Version:** v19.2 (as of January 2025)
- **Verification:** https://react.dev/blog
- **Installation:** npm install react react-dom
- **Why This Version:** 
  - Latest stable release (December 2024)
  - Includes React Server Components
  - React Compiler support
  - Security updates
- **Important:** Ensure you're using v19.0.1+ or v19.1.2+ to avoid critical security vulnerability in React Server Components

### React Router
- **Recommended Version:** 7.x
- **Current Version:** 7.x (as of January 2025)
- **Verification:** https://reactrouter.com/
- **Installation:** npm install react-router-dom
- **Why This Version:** Compatible with React 19

### Vite
- **Recommended Version:** 6.x
- **Current Version:** v6.x (as of January 2025)
- **Verification:** https://vitejs.dev/
- **Installation:** npm install -D vite
- **Why This Version:** 
  - Fastest build tool
  - Excellent DX
  - Native ES modules support

### Tailwind CSS
- **Recommended Version:** 4.x
- **Current Version:** v4.x (as of January 2025)
- **Verification:** https://tailwindcss.com/
- **Installation:** npm install -D tailwindcss
- **Why This Version:** Latest with improved performance

### Radix UI
- **Recommended Version:** 1.x
- **Current Version:** v1.x (as of January 2025)
- **Verification:** https://www.radix-ui.com/
- **Installation:** npm install @radix-ui/react-*
- **Why This Version:** Accessible, unstyled components

---

## Backend Technologies

### Fastify
- **Recommended Version:** 5.x
- **Current Version:** v5.x (as of January 2025)
- **Verification:** https://fastify.dev/
- **Installation:** npm install fastify
- **Why This Version:** 
  - High performance (2x faster than Express)
  - Excellent TypeScript support
  - Active community

### TypeORM
- **Recommended Version:** 0.3.x
- **Current Version:** v0.3.x (as of January 2025)
- **Verification:** https://typeorm.io/
- **Installation:** npm install typeorm
- **Why This Version:** 
  - Mature ORM with TypeScript support
  - Active Record and Data Mapper patterns
  - Migration support

---

## Database & Caching

### PostgreSQL
- **Recommended Version:** 16.x
- **Alternative Versions:** 15.x, 17.x, 18.x (all supported)
- **Current Version:** v16.12 (as of January 2025)
- **Verification:** https://www.postgresql.org/support/versioning/
- **Installation:** Docker image: postgres:16
- **Why This Version:** 
  - Supported until November 2028
  - Good balance of stability and features
  - Widely used in production
- **Required Extensions:**
  - pgvector (vector similarity search)
  - pg_trgm (trigram similarity)
  - PostGIS (optional, for geographic data)

### Redis
- **Recommended Version:** 7.x
- **Current Version:** v7.x (as of January 2025)
- **Verification:** https://redis.io/
- **Installation:** Docker image: redis:7
- **Why This Version:** 
  - Current stable version
  - Performance improvements
  - New data structures

---

## AI/ML Technologies

### OpenAI API
- **Recommended Model:** GPT-4
- **Embedding Model:** text-embedding-3-small
- **Verification:** https://platform.openai.com/
- **Why These Versions:**
  - GPT-4: Best quality for conversation and extraction
  - text-embedding-3-small: Good balance of quality and cost
- **Cost Considerations:** 
  - GPT-4: ~$0.03/1K input tokens, $0.06/1K output tokens
  - Embeddings: ~$0.02/1M tokens
  - Budget for ~$2,000/month for MVP

### Python (for ML services)
- **Recommended Version:** 3.11.x
- **Current Version:** 3.11.x (as of January 2025)
- **Verification:** https://www.python.org/
- **Why This Version:** 
  - Performance improvements (10-60% faster than 3.10)
  - Better error messages
  - Active support

### Key Python Libraries
- **scikit-learn:** 1.4.x
- **PyTorch:** 2.2.x
- **spaCy:** 3.7.x
- **Transformers:** 4.37.x
- **FastAPI:** 0.109.x

---

## Infrastructure & DevOps

### Docker
- **Recommended Version:** Latest (Docker Desktop)
- **Current Version:** 24.x+ (as of January 2025)
- **Verification:** https://www.docker.com/
- **Installation:** Docker Desktop for macOS/Windows
- **Why Latest:** Security updates, bug fixes, new features

### Docker Compose
- **Recommended Version:** 2.x (bundled with Docker Desktop)
- **Current Version:** v2.x (as of January 2025)
- **Verification:** https://docs.docker.com/compose/
- **Why This Version:** Integrated with Docker Desktop

### Git
- **Recommended Version:** 2.x
- **Current Version:** 2.43+ (as of January 2025)
- **Verification:** https://git-scm.com/
- **Installation:** Download from git-scm.com or via package manager
- **Why This Version:** Latest features and security updates

### AWS Services
- **RDS PostgreSQL:** PostgreSQL 16
- **ElastiCache Redis:** Redis 7.x
- **S3:** N/A (service version)
- **CloudFront:** N/A (service version)
- **EC2:** Amazon Linux 2023 or Ubuntu 22.04 LTS
- **Verification:** https://aws.amazon.com/

---

## Development Tools

### VS Code
- **Recommended Version:** Latest
- **Current Version:** 1.85+ (as of January 2025)
- **Verification:** https://code.visualstudio.com/
- **Installation:** Download from code.visualstudio.com
- **Why Latest:** Security updates, new features

### ESLint
- **Recommended Version:** 9.x (Flat Config)
- **Current Version:** v9.x (as of January 2025)
- **Installation:** npm install -D eslint
- **Why This Version:** New flat config system, better performance

### Prettier
- **Recommended Version:** 3.x
- **Current Version:** v3.x (as of January 2025)
- **Installation:** npm install -D prettier
- **Why This Version:** Latest stable, ESM support

---

## Testing Tools

### Jest
- **Recommended Version:** 29.x
- **Current Version:** v29.x (as of January 2025)
- **Installation:** npm install -D jest
- **Why This Version:** Stable, widely used, good React support

### React Testing Library
- **Recommended Version:** 14.x
- **Current Version:** v14.x (as of January 2025)
- **Installation:** npm install -D @testing-library/react
- **Why This Version:** Compatible with React 19

### Playwright
- **Recommended Version:** 1.40+
- **Current Version:** v1.40+ (as of January 2025)
- **Installation:** npm install -D @playwright/test
- **Why This Version:** Cross-browser E2E testing

---

## Version Verification Commands

After installation, verify versions with these commands:

```bash
# Runtime
node --version          # Should show v24.x
npm --version           # Should show 11.x
python --version        # Should show 3.11.x

# Tools
git --version           # Should show 2.x
docker --version        # Should show 24.x
docker-compose --version # Should show v2.x

# Database (via Docker)
docker run postgres:16 psql --version
docker run redis:7 redis-server --version
```

---

## Package.json Version Format

When specifying versions in package.json, use these formats:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "fastify": "^5.0.0",
    "typeorm": "^0.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Version Update Policy

### When to Update
- **Security patches:** Immediately
- **Minor versions:** After testing (within 1-2 weeks)
- **Major versions:** After thorough testing and team review

### Testing Before Updates
1. Check changelog for breaking changes
2. Test in development environment
3. Run full test suite
4. Update documentation
5. Deploy to staging first

### Lock Files
- Commit package-lock.json (npm) or yarn.lock
- Use exact versions for critical dependencies
- Review lock file changes in PR reviews

---

## Common Version Issues

### Issue: Version Mismatch in Team
**Solution:** Use package-lock.json and ensure all team members run `npm ci` instead of `npm install`

### Issue: Peer Dependency Conflicts
**Solution:** 
1. Check peer dependency requirements
2. Use `npm install --legacy-peer-deps` as temporary fix
3. Update conflicting packages to compatible versions

### Issue: Breaking Changes in Major Version
**Solution:**
1. Read migration guide in changelog
2. Update code incrementally
3. Test thoroughly before deploying

---

## Docker Image Versions

For docker-compose.yml or Dockerfile:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    
  redis:
    image: redis:7-alpine
    
  api:
    image: node:24-alpine
    
  ml:
    image: python:3.11-slim
```

**Why Alpine:** Smaller image size, faster builds, fewer vulnerabilities

---

## Version Compatibility Matrix

| Component | Version | Compatible With |
|-----------|---------|-----------------|
| Node.js | 24.x | TypeScript 5.x, React 19.x |
| React | 19.x | Node 24.x, TypeScript 5.x |
| PostgreSQL | 16.x | TypeORM 0.3.x, pgvector 0.5.x |
| Redis | 7.x | Node redis client 4.x |
| TypeScript | 5.x | Node 24.x, React 19.x |

---

## Verification Checklist

Before starting development, verify:

- [ ] Node.js 24.x installed
- [ ] npm 11.x installed (comes with Node)
- [ ] PostgreSQL 16.x accessible (via Docker)
- [ ] Redis 7.x accessible (via Docker)
- [ ] Git 2.x installed
- [ ] Docker Desktop latest version
- [ ] VS Code latest version with extensions
- [ ] Python 3.11.x (for ML services)

---

## Updating This Document

This document should be reviewed and updated:
- **Monthly:** Check for minor version updates
- **Quarterly:** Review major version releases
- **As needed:** When security vulnerabilities are discovered
- **After updates:** When team updates any component

---

## References

- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [React Blog](https://react.dev/blog)
- [PostgreSQL Versioning](https://www.postgresql.org/support/versioning/)
- [Redis Documentation](https://redis.io/docs/)
- [Docker Hub](https://hub.docker.com/)
- [npm Documentation](https://docs.npmjs.com/)

---

**Last Verified:** January 2025  
**Next Review Date:** February 2025  
**Maintained By:** Tech Lead