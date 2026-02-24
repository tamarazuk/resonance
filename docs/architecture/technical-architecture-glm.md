# Technical Architecture Document
# Resonance - AI-Native Job Matching Platform

**Version:** 1.0  
**Date:** February 2026  
**Author:** Engineering Team  
**Status:** Draft

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Components](#2-system-components)
3. [Technology Stack](#3-technology-stack)
4. [Data Architecture](#4-data-architecture)
5. [AI/ML Architecture](#5-aiml-architecture)
6. [API Design](#6-api-design)
7. [Infrastructure & Deployment](#7-infrastructure--deployment)
8. [Security & Privacy](#8-security--privacy)
9. [Integration Architecture](#9-integration-architecture)
10. [Scalability & Performance](#10-scalability--performance)
11. [Development Workflow](#11-development-workflow)
12. [MVP Architecture (Steadyhand)](#12-mvp-architecture-steadyhand)
13. [Future Considerations](#13-future-considerations)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

Resonance is built as a **distributed, event-driven microservices architecture** with three primary subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web App     │  │  iOS App     │  │  Android App │          │
│  │  (React)     │  │  (React Nav) │  │  (React Nav) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│  • Authentication/Authorization                                  │
│  • Rate Limiting                                                 │
│  • Request Routing                                               │
│  • API Versioning                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Steadyhand  │    │  Clearview   │    │  Resonance   │
│   Service    │    │   Service    │    │     Core     │
│              │    │              │    │              │
│ • Profile    │    │ • Role Def   │    │ • Matching   │
│ • Memory     │    │ • Culture    │    │ • Scoring    │
│ • Cognitive  │    │ • Hidden Req │    │ • Intro      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ PostgreSQL│  │  Redis   │  │   S3     │  │Elasticsearch│     │
│  │(Primary)  │  │ (Cache)  │  │ (Files)  │  │  (Search)   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI/ML INFRASTRUCTURE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Model   │  │ Feature  │  │ Training │  │   LLM    │       │
│  │ Serving  │  │  Store   │  │ Pipeline │  │ Gateway  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Privacy-First**: Consent-gated data usage, explicit user control, and minimal cross-party data exposure
2. **Event-Driven**: Async communication between services via event bus
3. **API-First**: All features exposed via versioned APIs
4. **Scalable**: Horizontal scaling, stateless services
5. **Resilient**: Circuit breakers, graceful degradation, retry logic
6. **Observable**: Comprehensive logging, metrics, tracing
7. **Secure**: Defense in depth, encryption everywhere

### 1.3 System Qualities

| Quality | Target | Measurement |
|---------|--------|-------------|
| **Availability** | 99.9% uptime | < 8.7 hours downtime/year |
| **Latency** | p95 < 200ms | API response time |
| **Throughput** | 10K requests/sec | Sustained load |
| **Match Latency** | < 5 seconds | New profile to first match |
| **Data Durability** | 99.999999999% | 11 9's for critical data |
| **Security** | SOC 2 Type II | Annual compliance audit |

### 1.4 PRD Guardrails (Non-Negotiable)

| Guardrail | Architecture Implication |
|---------|-------------|
| **Double opt-in introductions** | Introduction endpoints must enforce `candidate_status=interested` AND `employer_status=interested` before unlock. |
| **Humans decide, AI recommends** | No outbound intro, employer ping, or candidate outreach from model output alone. Every external action requires explicit API action by the acting user. |
| **Candidate free forever** | No candidate-side paywall, ranking boost, or pay-for-placement path in matching and API gateway policy. |
| **Consent-based model training** | Only candidates with explicit training consent are included in training corpora; revocation is auditable and honored in subsequent training datasets. |
| **Explainable matching** | Every surfaced match includes machine-readable strengths, gaps, and rationale. |
| **No demographic features in inference** | Protected-class data can be used only in offline fairness audits, never as online scoring features. |

---

## 2. System Components

### 2.1 Steadyhand Service (Candidate-Facing)

**Purpose**: Build and maintain professional identity graphs, protect cognitive load

**Core Subsystems**:

#### 2.1.1 Profile Management Service
```
Responsibilities:
• Professional Identity Graph CRUD operations
• Memory Bank management
• Preference Map management  
• Growth Map management
• Profile versioning and history

Tech Stack:
• Node.js + TypeScript
• PostgreSQL for structured data
• S3 for document storage
• Redis for caching
```

#### 2.1.2 Conversation Service
```
Responsibilities:
• AI-guided profile building conversations
• Natural language experience capture
• STAR structure extraction
• Reflection prompts and debriefs

Tech Stack:
• Node.js + TypeScript
• WebSocket for real-time chat
• LLM Gateway for AI responses
• Redis for session state
```

#### 2.1.3 Cognitive Protection Service
```
Responsibilities:
• Triage engine (opportunity prioritization)
• Prep engine (interview preparation)
• Follow-up manager
• Emotional intelligence layer

Tech Stack:
• Python (ML inference)
• Redis for user state
• Celery for async tasks
• Scheduled jobs for timing
```

#### 2.1.4 Document Import Service
```
Responsibilities:
• Resume parsing (PDF, DOCX)
• LinkedIn profile import
• GitHub activity analysis
• Portfolio analysis

Tech Stack:
• Python + Textract
• OCR for image-based docs
• NER for entity extraction
```

### 2.2 Clearview Service (Employer-Facing)

**Purpose**: Help companies articulate team needs and build structured role profiles

**Core Subsystems**:

#### 2.2.1 Role Definition Service
```
Responsibilities:
• Team Needs Graph CRUD
• Must-have vs nice-to-have elicitation
• Day-to-day work structuring
• Success criteria definition

Tech Stack:
• Node.js + TypeScript
• PostgreSQL
• LLM Gateway for guided elicitation
```

#### 2.2.2 Culture Signal Service
```
Responsibilities:
• Decision-making style capture
• Communication pattern analysis
• Values in practice identification
• Team composition analysis

Tech Stack:
• Node.js + TypeScript
• Survey/analytics integrations
• Text analysis for culture signals
```

#### 2.2.3 Posting Quality Service
```
Responsibilities:
• Job posting analysis
• Bias detection
• Requirement calibration
• Inclusivity scoring

Tech Stack:
• Python (NLP models)
• Bias detection ML models
• Text analysis pipelines
```

### 2.3 Resonance Core (Matching Engine)

**Purpose**: Translate between candidate/employer representations, find alignment

**Core Subsystems**:

#### 2.3.1 Matching Service
```
Responsibilities:
• Multi-dimensional matching
• Match confidence scoring
• Match explanation generation
• Match lifecycle management

Tech Stack:
• Python (ML heavy)
• TensorFlow/PyTorch models
• FAISS for similarity search
• Redis for match caching
```

#### 2.3.2 Scoring Engine
```
Responsibilities:
• Capability alignment scoring
• Growth trajectory scoring
• Culture compatibility scoring
• Values/mission alignment scoring
• Practical compatibility scoring
• Mutual advantage scoring

Tech Stack:
• Python
• Ensemble ML models
• Feature store integration
• Real-time inference
```

#### 2.3.3 Introduction Protocol Service
```
Responsibilities:
• Double opt-in management
• Match presentation to both sides
• Introduction facilitation
• Match outcome tracking

Tech Stack:
• Node.js + TypeScript
• PostgreSQL for state management
• Event-driven architecture
• Notification service integration
```

### 2.4 Shared Infrastructure Services

#### 2.4.1 Authentication Service
```
Responsibilities:
• User registration/login
• OAuth providers (Google, LinkedIn)
• JWT token management
• Session management
• Multi-factor authentication

Tech Stack:
• Node.js + TypeScript
• Passport.js
• Redis for sessions
• JWT for tokens
```

#### 2.4.2 Notification Service
```
Responsibilities:
• Email notifications
• Push notifications
• In-app notifications
• Notification preferences
• Delivery tracking

Tech Stack:
• Node.js + TypeScript
• SendGrid (email)
• Firebase (push)
• Redis queue
```

#### 2.4.3 Analytics Service
```
Responsibilities:
• Event tracking
• User behavior analytics
• Funnel analysis
• Cohort analysis
• Custom dashboards

Tech Stack:
• Python
• Snowflake/Databricks
• Apache Kafka (events)
• Metabase (dashboards)
```

#### 2.4.4 Aggregation Service
```
Responsibilities:
• Job board API ingestion
• Career page monitoring
• Candidate-submitted postings
• Deduplication
• Data normalization

Tech Stack:
• Python
• Scrapy/Selenium
• Celery for jobs
• PostgreSQL
```

---

## 3. Technology Stack

### 3.1 Frontend Stack

#### 3.1.1 Web Application
```
Framework: React 18+ with TypeScript
State Management: Redux Toolkit + RTK Query
UI Components: 
  • Radix UI (headless components)
  • Tailwind CSS (styling)
  • Framer Motion (animations)

Build Tools:
  • Vite (build tool)
  • ESLint + Prettier (linting)
  • Jest + React Testing Library (testing)
  • Playwright (E2E testing)

Key Libraries:
  • React Query (server state)
  • React Hook Form (forms)
  • Zod (validation)
  • date-fns (dates)
  • Chart.js (visualizations)
```

**Rationale**: 
- React: Largest ecosystem, best talent pool
- TypeScript: Type safety at scale
- Vite: Fast development, modern build
- Radix + Tailwind: Accessible, customizable, performant

#### 3.1.2 Mobile Applications
```
Framework: React Native 0.72+
Language: TypeScript
Navigation: React Navigation 6
State: Redux Toolkit (shared with web)

Platform-Specific:
  • iOS: Swift modules for native features
  • Android: Kotlin modules for native features

Testing:
  • Jest + React Native Testing Library
  • Detox (E2E)
```

**Rationale**:
- React Native: Code sharing with web, good performance
- Single codebase for iOS + Android
- Native modules when needed

### 3.2 Backend Stack

#### 3.2.1 Application Services
```
Runtime: Node.js 20 LTS
Language: TypeScript 5+
Framework: Fastify (high performance)
API Style: REST + GraphQL (hybrid)

Key Libraries:
  • TypeORM (ORM)
  • Zod (validation)
  • Pino (logging)
  • Bull (job queues)
  • Socket.io (WebSockets)
```

**Rationale**:
- Node.js: JavaScript everywhere, fast I/O
- TypeScript: Type safety, better refactoring
- Fastify: 2x faster than Express, great DX

#### 3.2.2 ML/AI Services
```
Language: Python 3.11+
Framework: FastAPI
ML Stack:
  • PyTorch (deep learning)
  • scikit-learn (classical ML)
  • spaCy (NLP)
  • Transformers (Hugging Face)

Serving:
  • TorchServe / TensorFlow Serving
  • ONNX Runtime (optimized inference)
  • Ray Serve (distributed inference)
```

**Rationale**:
- Python: Best ML ecosystem
- FastAPI: Fast, async, great tooling
- PyTorch: Research-friendly, production-ready

#### 3.2.3 Background Jobs
```
Queue System: Redis + Bull (Node.js)
Or: Celery + Redis (Python)

Job Types:
  • Email sending
  • Document processing
  • ML inference
  • Report generation
  • Data aggregation

Scheduled Jobs:
  • Daily match updates
  • Weekly digest emails
  • Data cleanup tasks
```

### 3.3 Data Layer

#### 3.3.1 Primary Database: PostgreSQL
```
Version: PostgreSQL 15+
Extensions:
  • pg_trgm (trigram similarity)
  • pgvector (vector similarity)
  • PostGIS (geographic data)

Schema Management:
  • TypeORM migrations
  • Version-controlled schemas

Replication:
  • Read replicas for scaling
  • Streaming replication
  • Automatic failover
```

**Rationale**:
- ACID compliance for critical data
- JSON support for flexible schemas
- Excellent performance and reliability
- pgvector for similarity search

#### 3.3.2 Caching Layer: Redis
```
Version: Redis 7+
Use Cases:
  • Session storage
  • API response caching
  • Rate limiting
  • Real-time leaderboards
  • Pub/Sub for events
  • Job queues

Configuration:
  • Cluster mode for scaling
  • Persistence enabled (AOF + RDB)
  • TLS encryption
```

**Rationale**:
- Extremely fast in-memory operations
- Versatile (cache, queue, pub/sub)
- Well-supported, stable

#### 3.3.3 Search Engine: Elasticsearch
```
Version: Elasticsearch 8+
Use Cases:
  • Full-text search (job postings)
  • Candidate search (for employers)
  • Aggregation and analytics
  • Log aggregation

Index Strategy:
  • Daily indices for logs
  • Per-tenant indices for data isolation
  • Alias-based index management
```

**Rationale**:
- Best-in-class full-text search
- Excellent for log analytics
- Scales horizontally

#### 3.3.4 Object Storage: S3-Compatible
```
Provider: AWS S3 (or compatible: MinIO, GCS)
Use Cases:
  • Resume documents
  • Profile photos
  • Exported data
  • Model artifacts
  • Static assets

Features:
  • Versioning enabled
  • Lifecycle policies
  • Server-side encryption
  • CDN integration
```

#### 3.3.5 Time-Series Data: TimescaleDB
```
Extension: PostgreSQL + TimescaleDB
Use Cases:
  • User activity tracking
  • Match performance over time
  • System metrics
  • A/B test results

Benefits:
  • SQL interface
  • Automatic partitioning
  • Compression
  • Retention policies
```

### 3.4 AI/ML Infrastructure

#### 3.4.1 LLM Integration
```
Primary: OpenAI GPT-4 / GPT-4 Turbo
Alternative: Anthropic Claude 3

Use Cases:
  • Conversation service (profile building)
  • STAR structure extraction
  • Match explanation generation
  • Job posting analysis

Gateway: Custom LLM Gateway
  • Request routing
  • Cost tracking
  • Rate limiting
  • Fallback logic
  • Prompt management
```

**Rationale**:
- GPT-4: Best overall performance for complex tasks
- Gateway: Centralized control, cost optimization

#### 3.4.2 Embedding Models
```
Primary: OpenAI text-embedding-3-large
Alternative: Sentence-BERT (self-hosted)

Use Cases:
  • Candidate profile embeddings
  • Job posting embeddings
  • Semantic similarity
  • Clustering

Vector DB: pgvector (in PostgreSQL)
Alternative: Pinecone / Weaviate
```

#### 3.4.3 Feature Store
```
Tool: Feast (open source) or Tecton
Purpose:
  • Feature consistency
  • Feature versioning
  • Training-serving skew prevention
  • Real-time feature serving

Features:
  • User features (profile completeness, activity)
  • Job features (requirements, seniority)
  • Cross features (match history)
```

#### 3.4.4 Model Registry
```
Tool: MLflow
Purpose:
  • Model versioning
  • Experiment tracking
  • Model deployment
  • Performance monitoring

Models Tracked:
  • Matching models
  • Scoring models
  • Bias detection models
  • NER models
```

### 3.5 Infrastructure & DevOps

#### 3.5.1 Cloud Provider
```
Primary: AWS
Regions:
  • us-east-1 (primary)
  • us-west-2 (secondary)
  • eu-west-1 (EU expansion)

Services:
  • EKS (Kubernetes)
  • RDS (PostgreSQL)
  • ElastiCache (Redis)
  • S3 (object storage)
  • CloudFront (CDN)
  • Route 53 (DNS)
```

**Rationale**:
- AWS: Most mature, best services
- Multi-region for resilience
- Managed services reduce ops burden

#### 3.5.2 Container Orchestration
```
Platform: Kubernetes (EKS)
Version: Kubernetes 1.28+

Namespaces:
  • production
  • staging
  • development

Key Tools:
  • Helm (package manager)
  • ArgoCD (GitOps)
  • Istio (service mesh)
  • Cert-Manager (TLS)
```

#### 3.5.3 CI/CD Pipeline
```
Platform: GitHub Actions
Workflows:
  • Pull request checks (lint, test, build)
  • Staging deployment (on merge)
  • Production deployment (manual approval)
  • Database migrations
  • Model training

Key Features:
  • Matrix builds (Node 18, 20)
  • Caching (node_modules, Docker layers)
  • Secrets management (GitHub Secrets)
  • Deployment gates
```

#### 3.5.4 Monitoring & Observability
```
Metrics: Prometheus + Grafana
Logging: 
  • Application: Datadog / Loki
  • Access logs: Nginx → Elasticsearch
Tracing: Jaeger / Datadog APM

Alerting:
  • PagerDuty (incidents)
  • Slack (warnings)
  • Email (daily summaries)

Dashboards:
  • System health
  • Business metrics
  • ML model performance
  • Cost tracking
```

---

## 4. Data Architecture

### 4.1 Core Data Models

#### 4.1.1 Candidate Profile Schema

```sql
-- Core candidate table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile status
  profile_status VARCHAR(50) DEFAULT 'incomplete',
  profile_completeness_score DECIMAL(3,2) DEFAULT 0.00,
  
  -- Privacy settings
  visibility VARCHAR(50) DEFAULT 'matches_only',
  allow_contact BOOLEAN DEFAULT false,
  match_notification_opt_in BOOLEAN DEFAULT true,
  model_training_opt_in BOOLEAN DEFAULT false,
  model_training_opt_in_at TIMESTAMP WITH TIME ZONE,
  model_training_opt_out_at TIMESTAMP WITH TIME ZONE,
  consent_version VARCHAR(50),
  
  -- Metadata
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  last_match_notification_at TIMESTAMP WITH TIME ZONE
);

-- Consent audit trail
CREATE TABLE candidate_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL, -- 'model_training', 'notifications'
  consent_value BOOLEAN NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) NOT NULL -- 'onboarding', 'settings', 'api'
);

-- Memory Bank: Experiences
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  
  -- Structured content
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  
  -- Raw input
  raw_description TEXT,
  
  -- AI-extracted features
  skills_demonstrated JSONB DEFAULT '[]',
  themes JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  evidence_strength DECIMAL(3,2) DEFAULT 0.00,
  
  -- Metadata
  source VARCHAR(50), -- 'conversation', 'import', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vector embedding for semantic search
  embedding vector(1536)
);

CREATE INDEX idx_experiences_candidate ON experiences(candidate_id);
CREATE INDEX idx_experiences_embedding ON experiences USING ivfflat (embedding vector_cosine_ops);

-- Preference Map
CREATE TABLE candidate_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Role preferences
  role_types JSONB DEFAULT '[]', -- ['backend', 'fullstack', 'leadership']
  seniority_levels JSONB DEFAULT '[]',
  industries JSONB DEFAULT '[]',
  
  -- Work style
  work_arrangements JSONB DEFAULT '[]', -- ['remote', 'hybrid', 'onsite']
  work_style_preferences JSONB DEFAULT '{}',
  
  -- Compensation
  min_salary_expectation INTEGER,
  max_salary_expectation INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_preference VARCHAR(50),
  
  -- Location
  locations JSONB DEFAULT '[]',
  willing_to_relocate BOOLEAN DEFAULT false,
  
  -- Growth goals
  growth_areas JSONB DEFAULT '[]',
  career_trajectory TEXT,
  
  -- Dealbreakers
  dealbreakers JSONB DEFAULT '[]',
  non_negotiables JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth Map
CREATE TABLE growth_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Skills being developed
  skills_in_progress JSONB DEFAULT '[]',
  
  -- Growth edges
  identified_growth_edges JSONB DEFAULT '[]',
  
  -- Career trajectory
  short_term_goals TEXT,
  long_term_goals TEXT,
  trajectory_direction VARCHAR(100),
  
  -- Learning patterns
  topics_engaged JSONB DEFAULT '[]',
  projects_pursued JSONB DEFAULT '[]',
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile documents (resumes, etc.)
CREATE TABLE profile_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  document_type VARCHAR(50), -- 'resume', 'cover_letter', 'portfolio'
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,
  
  -- Parsed content
  parsed_text TEXT,
  parsed_structured JSONB DEFAULT '{}',
  
  -- Metadata
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'pending'
);
```

#### 4.1.2 Employer/Role Schema

```sql
-- Employer organizations
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  
  -- Company info
  size VARCHAR(50), -- 'startup', 'mid', 'enterprise'
  industry VARCHAR(100),
  founded_year INTEGER,
  headquarters_location JSONB,
  
  -- Subscription
  subscription_tier VARCHAR(50),
  subscription_status VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members (employer users)
CREATE TABLE employer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  role VARCHAR(100), -- 'admin', 'recruiter', 'hiring_manager'
  permissions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles/Positions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES employer_users(id),
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location JSONB,
  
  -- Requirements
  must_have_requirements JSONB DEFAULT '[]',
  nice_to_have_requirements JSONB DEFAULT '[]',
  seniority_level VARCHAR(50),
  
  -- Day-to-day
  months_1_3_responsibilities TEXT,
  months_3_6_responsibilities TEXT,
  months_6_12_responsibilities TEXT,
  
  -- Success criteria
  success_criteria_6_months TEXT,
  
  -- Team composition
  team_composition JSONB DEFAULT '{}',
  team_gap_description TEXT,
  
  -- Growth opportunity
  growth_opportunities JSONB DEFAULT '[]',
  career_path TEXT,
  
  -- Culture signals
  decision_making_style VARCHAR(100),
  communication_style VARCHAR(100),
  pace VARCHAR(100),
  autonomy_level VARCHAR(100),
  values_in_practice JSONB DEFAULT '[]',
  
  -- Hidden requirements
  hidden_requirements JSONB DEFAULT '{}',
  
  -- Compensation
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_offered BOOLEAN,
  benefits_summary JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'closed'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vector embedding
  embedding vector(1536)
);

CREATE INDEX idx_roles_employer ON roles(employer_id);
CREATE INDEX idx_roles_embedding ON roles USING ivfflat (embedding vector_cosine_ops);

-- Job postings (aggregated from external sources)
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source info
  source VARCHAR(50), -- 'clearview', 'indeed', 'linkedin', 'company_page', 'candidate_submit'
  source_id VARCHAR(255),
  source_url TEXT,
  role_id UUID REFERENCES roles(id),
  
  -- Content
  title VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT,
  requirements JSONB DEFAULT '{}',
  
  -- Location & arrangement
  location JSONB,
  work_arrangement VARCHAR(50),
  
  -- Compensation (if available)
  salary_min INTEGER,
  salary_max INTEGER,
  
  -- Quality/confidence
  data_quality_tier INTEGER, -- 1-4
  confidence_score DECIMAL(3,2),
  
  -- Vector embedding
  embedding vector(1536),
  
  -- Metadata
  posted_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

#### 4.1.3 Matching Schema

```sql
-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  role_id UUID REFERENCES roles(id),
  job_posting_id UUID REFERENCES job_postings(id),
  
  -- Scores
  overall_score DECIMAL(5,2),
  capability_alignment_score DECIMAL(5,2),
  growth_trajectory_score DECIMAL(5,2),
  culture_compatibility_score DECIMAL(5,2),
  values_alignment_score DECIMAL(5,2),
  practical_compatibility_score DECIMAL(5,2),
  mutual_advantage_score DECIMAL(5,2),
  
  -- Match tier
  match_tier VARCHAR(50), -- 'strong', 'promising', 'stretch', 'weak'
  
  -- Explanation
  match_reasoning TEXT,
  strengths JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  
  -- Status
  candidate_status VARCHAR(50), -- 'pending', 'interested', 'passed', 'saved'
  employer_status VARCHAR(50), -- 'pending', 'interested', 'passed', 'saved'
  candidate_responded_at TIMESTAMP WITH TIME ZONE,
  employer_responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Introduction
  introduction_status VARCHAR(50), -- 'none', 'initiated', 'in_progress', 'completed', 'declined'
  introduction_unlocked_at TIMESTAMP WITH TIME ZONE,
  introduced_at TIMESTAMP WITH TIME ZONE,
  
  -- Outcome tracking
  outcome VARCHAR(50), -- 'no_response', 'interview', 'offer', 'hired', 'rejected'
  outcome_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_candidate ON matches(candidate_id);
CREATE INDEX idx_matches_role ON matches(role_id);
CREATE INDEX idx_matches_score ON matches(overall_score DESC);

-- Match feedback (for model improvement)
CREATE TABLE match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  
  user_type VARCHAR(50), -- 'candidate', 'employer'
  feedback_type VARCHAR(50), -- 'explicit_rating', 'implicit_action', 'outcome'
  
  rating INTEGER, -- 1-5 stars
  feedback_text TEXT,
  
  action_taken VARCHAR(100), -- 'interested', 'passed', 'saved', 'interviewed', 'hired'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Data Flow Architecture

#### 4.2.1 Profile Building Flow

```
1. User Input (Conversation)
   └─> Conversation Service
       └─> LLM Gateway
           └─> Extract entities & structure
               └─> Profile Management Service
                   ├─> PostgreSQL (structured data)
                   ├─> Embedding Service
                   │   └─> PostgreSQL (vectors)
                   └─> Event Bus
                       └─> Matching Service (trigger rematch)
```

#### 4.2.2 Matching Flow

```
1. Profile Update Event
   └─> Matching Service
       ├─> Fetch candidate profile
       ├─> Fetch relevant roles/postings
       ├─> Scoring Engine
       │   ├─> Feature Store (get features)
       │   ├─> ML Models (inference)
       │   └─> Calculate scores
       ├─> Generate explanations
       └─> Store matches
           └─> Notification Service (candidate-only digest, requires notification opt-in)

2. Candidate Decision
   └─> Candidate marks match as interested/passed/saved
       └─> If interested and source = first-party role (Clearview), notify employer queue

3. Employer Decision (first-party roles only)
   └─> Employer marks match as interested/passed/saved
       └─> Introduction Service unlocks only when both sides are interested
```

#### 4.2.3 Aggregation Flow

```
1. Scheduled Job (hourly)
   └─> Aggregation Service
       ├─> Job Board APIs (fetch new postings)
       ├─> Career Page Monitor (scrape)
       ├─> Candidate Submissions (queue)
       └─> Normalization Pipeline
           ├─> Deduplication
           ├─> Entity Extraction
           ├─> Quality Scoring
           └─> Embedding Generation
               └─> PostgreSQL + Elasticsearch

2. Aggregated Posting Constraint
   └─> External/aggregated roles do not trigger employer-side outreach workflows
       └─> Candidate can only perform candidate-initiated outbound apply action
```

### 4.3 Data Privacy & Security

#### 4.3.1 Encryption

```
At Rest:
  • PostgreSQL: TDE (Transparent Data Encryption)
  • S3: Server-side encryption (SSE-S3)
  • Backups: AES-256 encryption

In Transit:
  • TLS 1.3 for all connections
  • Certificate pinning for mobile apps
  • mTLS for service-to-service (via Istio)

Application-Level:
  • PII fields encrypted before storage
  • Encryption key management (AWS KMS)
  • Field-level encryption for sensitive data
```

#### 4.3.2 Data Access Control

```sql
-- Row-level security for multi-tenancy
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_isolation_policy ON roles
  USING (employer_id = current_setting('app.current_employer_id')::UUID);

-- Data masking for sensitive fields
CREATE VIEW candidate_profiles_masked AS
SELECT 
  id,
  email, -- masked in application layer
  '***@***' as email_masked,
  profile_status,
  profile_completeness_score
FROM candidates;
```

#### 4.3.3 Data Retention

```
Active Users:
  • Profile data: Retained while account active
  • Match data: 2 years
  • Activity logs: 1 year

Inactive Users:
  • Soft delete after 2 years inactivity
  • Hard delete after 5 years
  • Anonymize for analytics before deletion

Employer Data:
  • Active roles: Retained while active
  • Closed roles: 3 years
  • Aggregated analytics: Retained indefinitely (anonymized)
```

---

## 5. AI/ML Architecture

### 5.1 Matching Model Architecture

#### 5.1.1 Two-Tower Model

```
Candidate Tower:
  Input: Professional Identity Graph
    ├─> Experience embeddings (BERT)
    ├─> Skills embeddings (custom)
    ├─> Preference embeddings
    └─> Growth trajectory embeddings
  
  Processing:
    ├─> Dense layers (768 → 512 → 256)
    ├─> Layer normalization
    ├─> Dropout (0.2)
    └─> Output: 128-dim candidate vector

Role/Posting Tower:
  Input: Team Needs Graph / Job Posting
    ├─> Requirements embeddings
    ├─> Culture signal embeddings
    ├─> Growth opportunity embeddings
    └─> Compensation/location embeddings
  
  Processing:
    ├─> Dense layers (768 → 512 → 256)
    ├─> Layer normalization
    ├─> Dropout (0.2)
    └─> Output: 128-dim role vector

Similarity:
  • Cosine similarity between vectors
  • Learned temperature scaling
  • Output: Raw match score (0-1)
```

#### 5.1.2 Multi-Dimensional Scoring

```
Each dimension has specialized models:

Capability Alignment:
  • Skill matching (NER + similarity)
  • Experience relevance (semantic similarity)
  • Requirement satisfaction (classification)

Growth Trajectory:
  • Trajectory prediction (sequence model)
  • Learning signal analysis (attention)
  • Opportunity fit (regression)

Culture Compatibility:
  • Work style matching (classification)
  • Values alignment (sentiment + similarity)
  • Communication fit (NLP)

Values/Mission:
  • Mission statement analysis (NLP)
  • Values extraction (NER)
  • Alignment scoring (regression)

Practical Compatibility:
  • Compensation matching (rules + ML)
  • Location feasibility (geospatial)
  • Timeline alignment (temporal)

Mutual Advantage:
  • Rarity scoring (statistical)
  • Benefit prediction (regression)
  • Two-sided value estimation
```

### 5.2 Conversation AI

#### 5.2.1 Profile Building Assistant

```
Architecture:
  • LLM: GPT-4 Turbo
  • Context: Last 10 exchanges + profile state
  • Prompt Engineering: Structured system prompts

Capabilities:
  • Ask clarifying questions
  • Extract STAR structures
  • Identify skills and themes
  • Prompt for missing information
  • Validate consistency

Prompt Template Structure:
  ┌─────────────────────────────────────┐
  │ System: Role and guidelines         │
  │ Context: Current profile state      │
  │ User: Last message                  │
  │ History: Recent conversation        │
  │ Instructions: Response format       │
  └─────────────────────────────────────┘

Output:
  • Natural language response
  • Structured extractions (JSON)
  • Profile update suggestions
```

#### 5.2.2 STAR Extraction Pipeline

```
Input: Natural language experience description
  │
  ├─> Sentence Segmentation
  │   └─> spaCy sentence tokenizer
  │
  ├─> Component Classification
  │   └─> BERT classifier (S/T/A/R/Other)
  │
  ├─> Entity Extraction
  │   ├─> Skills (NER model)
  │   ├─> Technologies (NER model)
  │   └─> Outcomes (pattern matching)
  │
  ├─> Theme Identification
  │   └─> Zero-shot classification
  │
  └─> Structured Output
      └─> JSON with all components
```

### 5.3 Bias Detection & Mitigation

#### 5.3.1 Bias Detection Models

```
Job Posting Analysis:
  • Gendered language detection
  • Exclusionary phrase identification
  • Unrealistic requirement flagging
  
  Model: Fine-tuned BERT for bias classification
  
  Output:
    - Bias score (0-1)
    - Flagged phrases
    - Suggested alternatives

Match Outcome Analysis:
  • Statistical parity testing
  • Demographic impact analysis
  • Disparate impact detection
  • Fairness data isolated in offline analytics store (never online scoring features)
  
  Methods:
    - Chi-square tests
    - Fairness metrics (demographic parity, equalized odds)
    - Causal analysis
```

#### 5.3.2 Mitigation Strategies

```
Algorithmic:
  • Blind matching (remove demographic features)
  • Adversarial debiasing
  • Fairness constraints in optimization
  • Regular model audits

Data-Level:
  • Diverse training data
  • Oversampling underrepresented groups
  • Synthetic data augmentation

Process-Level:
  • Human review for edge cases
  • Feedback loops for bias reporting
  • Regular third-party audits
```

### 5.4 Model Training & Deployment

#### 5.4.1 Training Pipeline

```
Data Collection:
  ├─> User interactions (with consent)
  ├─> Consent filter (only users with model_training_opt_in = true)
  ├─> Match outcomes
  ├─> Feedback (explicit & implicit)
  └─> External datasets (job boards, skills)

Feature Engineering:
  ├─> Feature Store (Feast)
  │   ├─> Entity features
  │   ├─> Aggregate features
  │   └─> Real-time features
  └─> Feature pipelines (Spark)

Training:
  ├─> Training cluster (GPU instances)
  ├─> Experiment tracking (MLflow)
  ├─> Hyperparameter tuning (Optuna)
  └─> Cross-validation

Validation:
  ├─> Offline metrics (precision, recall, NDCG)
  ├─> Fairness metrics
  ├─> A/B test planning
  └─> Model explainability (SHAP)

Governance:
  ├─> Dataset snapshots include consent_version
  ├─> Consent revocation removes records from next training cycle
  └─> Training lineage is auditable per model version
```

#### 5.4.2 Model Serving

```
Serving Architecture:
  ├─> Model registry (MLflow)
  ├─> Model server (TorchServe / TF Serving)
  ├─> API wrapper (FastAPI)
  └─> Load balancer (Kubernetes Ingress)

Deployment Strategy:
  ├─> Canary deployments (5% → 50% → 100%)
  ├─> Shadow mode (new model runs in parallel)
  ├─> Automatic rollback (if metrics degrade)
  └─> A/B testing framework

Performance Optimization:
  ├─> Model quantization (int8)
  ├─> ONNX Runtime
  ├─> Batching requests
  └─> Caching (Redis)
```

### 5.5 MLOps

```
Monitoring:
  ├─> Model performance metrics
  ├─> Data drift detection
  ├─> Feature drift detection
  └─> Prediction distribution

Alerting:
  ├─> Performance degradation
  ├─> Bias detection
  ├─> Data quality issues
  └─> Serving errors

Retraining:
  ├─> Scheduled (weekly)
  ├─> Triggered (performance threshold)
  └─> Manual (data quality issues)

Versioning:
  ├─> Model versions
  ├─> Training data versions
  ├─> Feature versions
  └─> Prompt versions
```

---

## 6. API Design

### 6.1 API Standards

```
Style: REST + GraphQL hybrid
Versioning: URL path (/api/v1/)
Format: JSON
Authentication: JWT Bearer tokens
Rate Limiting: Token bucket algorithm
Action Guardrails:
  • Match and introduction side effects require explicit user action APIs
  • No server-initiated introduction messages without recorded user action
  • Candidate-facing APIs cannot expose paid ranking or placement controls

Response Format:
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-13T10:00:00Z",
    "request_id": "uuid"
  },
  "errors": [] // if any
}

Error Format:
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email is required",
      "field": "email",
      "details": {}
    }
  ]
}
```

### 6.2 Core API Endpoints

#### 6.2.1 Candidate API

```yaml
# Profile Management
POST   /api/v1/candidates/profile
  Request: { email, password, name }
  Response: { candidate_id, profile_status }

GET    /api/v1/candidates/profile
  Response: { profile: ProfessionalIdentityGraph }

PATCH  /api/v1/candidates/profile
  Request: { fields to update }
  Response: { updated_profile }

# Experiences (Memory Bank)
POST   /api/v1/candidates/experiences
  Request: { title, company, description, ... }
  Response: { experience_id, structured_data }

GET    /api/v1/candidates/experiences
  Query: ?limit=20&offset=0
  Response: { experiences: [], total_count }

GET    /api/v1/candidates/experiences/:id
  Response: { experience }

PUT    /api/v1/candidates/experiences/:id
  Request: { fields to update }
  Response: { updated_experience }

DELETE /api/v1/candidates/experiences/:id
  Response: { success: true }

# Preferences
GET    /api/v1/candidates/preferences
  Response: { preferences }

PUT    /api/v1/candidates/preferences
  Request: { preferences }
  Response: { updated_preferences }

# Growth Map
GET    /api/v1/candidates/growth-map
  Response: { growth_map }

PUT    /api/v1/candidates/growth-map
  Request: { growth_map }
  Response: { updated_growth_map }

# Matches
GET    /api/v1/candidates/matches
  Query: ?status=pending&tier=strong&limit=20
  Response: { matches: [], total_count }

GET    /api/v1/candidates/matches/:id/explanation
  Response: { strengths: [], gaps: [], reasoning, score_breakdown: {} }

POST   /api/v1/candidates/matches/:id/respond
  Request: { action: "interested" | "passed" | "saved" }
  Response: { updated_match }

# Consent & Data Dignity
PUT    /api/v1/candidates/consents
  Request: { model_training_opt_in, match_notification_opt_in, consent_version }
  Response: { updated_consents }

GET    /api/v1/candidates/data-export
  Response: { export_url, expires_at }

DELETE /api/v1/candidates/account
  Response: { deletion_requested: true, scheduled_delete_at }

# Conversation
WebSocket /api/v1/candidates/conversation
  Messages: { type, content }
  Responses: { type, content, extractions }
```

#### 6.2.2 Employer API

```yaml
# Organization
POST   /api/v1/employers/organizations
  Request: { name, domain, size, ... }
  Response: { employer_id }

GET    /api/v1/employers/organizations/:id
  Response: { organization }

# Roles
POST   /api/v1/employers/roles
  Request: { title, requirements, ... }
  Response: { role_id }

GET    /api/v1/employers/roles
  Query: ?status=active&limit=20
  Response: { roles: [], total_count }

GET    /api/v1/employers/roles/:id
  Response: { role, team_needs_graph }

PUT    /api/v1/employers/roles/:id
  Request: { fields to update }
  Response: { updated_role }

# Matches
GET    /api/v1/employers/roles/:id/matches
  Query: ?tier=strong&limit=20
  Response: { matches: [], total_count }

POST   /api/v1/employers/matches/:id/respond
  Request: { action: "interested" | "passed" | "saved" }
  Response: { updated_match }

# Introduction (double opt-in enforced server-side)
POST   /api/v1/matches/:id/introductions
  Request: { initiated_by: "candidate" | "employer" }
  Response: { status: "created" }
  Errors: 409 if both sides are not already "interested"
```

#### 6.2.3 GraphQL Schema

```graphql
type Candidate {
  id: ID!
  email: String!
  profile: ProfessionalIdentityGraph!
  matches(filter: MatchFilter): [Match!]!
  experiences: [Experience!]!
}

type ProfessionalIdentityGraph {
  memoryBank: MemoryBank!
  preferenceMap: PreferenceMap!
  growthMap: GrowthMap!
  completenessScore: Float!
}

type MemoryBank {
  experiences: [Experience!]!
  skills: [Skill!]!
  themes: [String!]!
}

type Experience {
  id: ID!
  title: String!
  company: String
  startDate: Date
  endDate: Date
  starStructure: STARStructure
  skillsDemonstrated: [Skill!]!
  evidenceStrength: Float!
}

type Match {
  id: ID!
  candidate: Candidate!
  role: Role
  overallScore: Float!
  tier: MatchTier!
  reasoning: String!
  candidateStatus: MatchStatus!
  employerStatus: MatchStatus!
}

type Query {
  candidate(id: ID!): Candidate
  matches(
    candidateId: ID
    roleId: ID
    filter: MatchFilter
  ): MatchConnection!
  role(id: ID!): Role
}

type Mutation {
  createExperience(
    candidateId: ID!
    input: ExperienceInput!
  ): Experience!
  
  updatePreferences(
    candidateId: ID!
    input: PreferenceInput!
  ): PreferenceMap!
  
  respondToMatch(
    matchId: ID!
    action: MatchAction!
  ): Match!
}

type Subscription {
  matchUpdates(candidateId: ID!): Match!
}
```

### 6.3 Internal APIs

```
Service-to-Service Communication:
  • gRPC for synchronous calls
  • Apache Kafka for async events
  • Service mesh (Istio) for security

Event Topics (Kafka):
  • candidate.profile.updated
  • candidate.experience.created
  • employer.role.created
  • match.created
  • match.status_changed
  • notification.send
```

---

## 7. Infrastructure & Deployment

### 7.1 Kubernetes Architecture

```yaml
# Namespace structure
namespaces:
  - production
  - staging
  - development
  - monitoring
  - istio-system

# Production namespace resources
# Example: Steadyhand Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: steadyhand-service
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: steadyhand
  template:
    spec:
      containers:
      - name: api
        image: resonance/steadyhand:v1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: steadyhand-service
  namespace: production
spec:
  selector:
    app: steadyhand
  ports:
  - port: 80
    targetPort: 3000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: steadyhand-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: steadyhand-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 7.2 Service Mesh (Istio)

```yaml
# Traffic management
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: steadyhand-service
spec:
  hosts:
  - steadyhand
  http:
  - route:
    - destination:
        host: steadyhand-service
        subset: stable
      weight: 95
    - destination:
        host: steadyhand-service
        subset: canary
      weight: 5
---
# Circuit breaker
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: steadyhand-service
spec:
  host: steadyhand-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

### 7.3 Database Infrastructure

```
PostgreSQL (RDS):
  Instance: db.r6g.xlarge (4 vCPU, 32 GB RAM)
  Storage: 1 TB gp3
  Multi-AZ: Yes
  Read Replicas: 2
  Backup: 7-day retention, point-in-time recovery
  
  Parameters:
    • shared_buffers = 8GB
    • effective_cache_size = 24GB
    • work_mem = 256MB
    • max_connections = 200

Redis (ElastiCache):
  Instance: cache.r6g.large (2 vCPU, 13.07 GB)
  Nodes: 3 (cluster mode)
  Replication: Yes
  Encryption: At-rest and in-transit

Elasticsearch:
  Instance: r6g.large.search (2 vCPU, 16 GB RAM)
  Nodes: 3 (master + data)
  Storage: 500 GB gp3 per node
```

### 7.4 CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run tests
      run: |
        npm ci
        npm test
        npm run e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Build Docker image
      run: docker build -t resonance/app:${{ github.sha }} .
    - name: Push to ECR
      run: |
        aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
        docker push $ECR_REGISTRY/resonance/app:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - name: Deploy to staging
      run: |
        kubectl set image deployment/app app=$ECR_REGISTRY/resonance/app:${{ github.sha }} -n staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
    - name: Deploy to production (canary)
      run: |
        # Deploy canary (5% traffic)
        kubectl apply -f k8s/production/canary.yaml
    - name: Monitor canary
      run: |
        # Wait 30 minutes, check metrics
        ./scripts/monitor-canary.sh
    - name: Promote to full rollout
      run: |
        kubectl apply -f k8s/production/stable.yaml
```

### 7.5 Disaster Recovery

```
Backup Strategy:
  • Database: Daily snapshots + WAL archiving
  • Redis: AOF + RDB snapshots
  • S3: Cross-region replication
  • Code: Git (GitHub)

Recovery Objectives:
  • RPO (Recovery Point Objective): 1 hour
  • RTO (Recovery Time Objective): 4 hours

DR Region: us-west-2
  • Standby database (async replication)
  • S3 cross-region replication
  • Kubernetes cluster (scaled down)

Failover Process:
  1. DNS failover (Route 53)
  2. Promote read replica to primary
  3. Scale up DR Kubernetes cluster
  4. Update service endpoints
```

---

## 8. Security & Privacy

### 8.1 Authentication & Authorization

```
Authentication Methods:
  • Email/password (bcrypt, cost factor 12)
  • OAuth 2.0 (Google, LinkedIn)
  • Magic links (passwordless)

JWT Tokens:
  • Algorithm: RS256 (asymmetric)
  • Access token: 15 minutes
  • Refresh token: 7 days
  • Stored in: HttpOnly, Secure cookies

Authorization:
  • Role-based access control (RBAC)
  • Resource-level permissions
  • Attribute-based access control (ABAC) for fine-grained
```

```typescript
// Example: Permission middleware
enum Permission {
  VIEW_PROFILE = 'view:profile',
  EDIT_PROFILE = 'edit:profile',
  VIEW_MATCHES = 'view:matches',
  MANAGE_ROLES = 'manage:roles',
}

function requirePermission(permission: Permission) {
  return async (req, res, next) => {
    const user = req.user;
    const hasPermission = await checkPermission(user, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}
```

### 8.2 Data Protection

```
PII Handling:
  • Classification: Public, Internal, Confidential, Restricted
  • Encryption: AES-256-GCM for PII fields
  • Tokenization: For sensitive identifiers
  • Masking: In logs and non-prod environments

Data Minimization:
  • Collect only necessary data
  • Automatic expiration for temporary data
  • Anonymization for analytics
  • User data export functionality
  • User data deletion (GDPR/CCPA compliance)

Data Dignity Guarantees:
  • Candidate profiles are portable via self-serve export
  • Model training uses explicit opt-in only
  • No sale of candidate data to third parties
  • No ad-targeting pipeline on candidate data
  • Immutable audit log for consent changes and intro actions

Secure Storage:
  • Secrets: AWS Secrets Manager
  • API keys: AWS Parameter Store (SecureString)
  • Encryption keys: AWS KMS (customer-managed CMKs)
```

### 8.3 Network Security

```
Network Architecture:
  • VPC with private subnets
  • NAT gateways for outbound traffic
  • VPC endpoints for AWS services
  • Network ACLs and security groups

Ingress:
  • AWS ALB (Application Load Balancer)
  • WAF (Web Application Firewall) rules
  • DDoS protection (AWS Shield)
  • Rate limiting (per IP, per user)

Service-to-Service:
  • Istio service mesh
  • mTLS for all internal communication
  • Network policies (Kubernetes)
  • Zero-trust architecture
```

### 8.4 Security Monitoring

```
Logging:
  • Application logs (structured JSON)
  • Access logs (all API requests)
  • Audit logs (sensitive operations)
  • Security events

SIEM (Security Information & Event Management):
  • AWS Security Hub
  • Datadog Security
  • Custom alerting rules

Threat Detection:
  • Anomaly detection (ML-based)
  • Brute force detection
  • Impossible travel detection
  • Credential stuffing detection

Incident Response:
  • Runbooks for common incidents
  • PagerDuty integration
  • Automated containment actions
  • Post-incident reviews
```

### 8.5 Compliance

```
Certifications:
  • SOC 2 Type II (annual audit)
  • GDPR compliance
  • CCPA compliance
  • EEOC (hiring regulations)

Controls:
  • Access control reviews (quarterly)
  • Penetration testing (annual)
  • Vulnerability scanning (continuous)
  • Security training (annual)

Data Residency:
  • US data in us-east-1
  • EU data in eu-west-1 (future)
  • Data sovereignty compliance
```

---

## 9. Integration Architecture

### 9.1 External Integrations

#### 9.1.1 Job Board APIs

```
LinkedIn:
  • API: LinkedIn Job Posting API
  • Auth: OAuth 2.0
  • Rate limits: 100K requests/day
  • Data: Jobs, companies, applications

Indeed:
  • API: Indeed Publisher API
  • Auth: API key
  • Rate limits: Varies by publisher
  • Data: Job postings, clicks

Glassdoor:
  • API: Glassdoor API
  • Auth: Partner ID + key
  • Data: Jobs, reviews, salaries

Integration Pattern:
  • Adapter pattern for each provider
  • Unified job posting schema
  • Daily sync (batch processing)
  • Webhook for real-time updates (if available)
```

#### 9.1.2 OAuth Providers

```
Google:
  • Scopes: email, profile
  • Use case: SSO, profile import

LinkedIn:
  • Scopes: r_emailaddress, r_liteprofile
  • Use case: SSO, profile import, endorsements

GitHub:
  • Scopes: user, repo (optional)
  • Use case: Code contributions, projects

Implementation:
  • Passport.js strategies
  • Account linking
  • Token refresh handling
```

#### 9.1.3 Communication Services

```
Email: SendGrid
  • Transactional emails
  • Template management
  • Delivery tracking
  • Webhooks for events

Push Notifications: Firebase Cloud Messaging
  • iOS and Android
  • Topic-based messaging
  • Token management

SMS: Twilio (future)
  • Verification codes
  • Critical alerts
```

### 9.2 Internal Integration Patterns

```
Synchronous (REST/gRPC):
  • User-facing requests
  • Low-latency requirements
  • Strong consistency needed

Asynchronous (Kafka):
  • Event notifications
  • Batch processing
  • Eventual consistency acceptable
  • Decoupled services

Event Sourcing (specific contexts):
  • Audit logs
  • Match history
  • Profile versioning
```

### 9.3 API Gateway

```
Kong / AWS API Gateway:

Features:
  • Rate limiting
  • Authentication
  • Request/response transformation
  • API versioning
  • Caching
  • Request logging

Rate Limits:
  • Unauthenticated: 100 req/hour
  • Authenticated candidate: 1000 req/hour
  • Employer standard: 2000 req/hour
  • Employer enterprise: 10000 req/hour

Monetization Guardrail:
  • Higher limits/features apply only to employer plans, never candidate visibility in matching

Caching:
  • GET requests (5 min TTL)
  • Static content (1 hour TTL)
  • Invalidation on updates
```

---

## 10. Scalability & Performance

### 10.1 Scalability Strategy

```
Horizontal Scaling:
  • Stateless services
  • Kubernetes HPA (Horizontal Pod Autoscaler)
  • Database read replicas
  • Sharding (future, if needed)

Vertical Scaling:
  • Database instances (resize when needed)
  • Cache nodes
  • ML serving instances

Auto-Scaling Triggers:
  • CPU utilization > 70%
  • Memory utilization > 80%
  • Request latency p95 > 500ms
  • Queue depth > 1000
```

### 10.2 Performance Optimization

```
Frontend:
  • Code splitting (route-based)
  • Lazy loading
  • Image optimization (WebP, srcset)
  • Service Worker caching
  • CDN for static assets
  • Target: < 3s LCP (Largest Contentful Paint)

Backend:
  • Database query optimization
  • Connection pooling
  • Response caching (Redis)
  • Async processing (queues)
  • Target: p95 < 200ms

ML Models:
  • Model quantization
  • Batching inference requests
  • GPU acceleration
  • Edge caching for embeddings
  • Target: < 100ms inference
```

### 10.3 Caching Strategy

```
Cache Layers:

1. CDN Cache (CloudFront):
   • Static assets
   • Public API responses
   • TTL: 1 hour

2. Application Cache (Redis):
   • User sessions
   • Profile data
   • Match results
   • TTL: 5-60 minutes

3. Database Query Cache (PostgreSQL):
   • Prepared statements
   • Query plan caching

4. Browser Cache:
   • Static assets (1 year)
   • API responses (5 minutes)

Cache Invalidation:
  • Time-based expiration
  • Event-driven invalidation
  • Manual invalidation (admin)
```

### 10.4 Database Performance

```
Query Optimization:
  • Indexing strategy (frequently queried columns)
  • Query analysis (EXPLAIN ANALYZE)
  • Slow query logging (> 100ms)
  • Query rewriting

Connection Management:
  • Connection pooling (PgBouncer)
  • Max connections: 200 per instance
  • Pool size: 20 per service instance

Read Replicas:
  • 2 read replicas
  • Read/write splitting at application layer
  • Eventually consistent reads for non-critical

Partitioning (future):
  • By employer_id (roles table)
  • By date (audit logs)
```

---

## 11. Development Workflow

### 11.1 Development Environment

```
Local Development:
  • Docker Compose for local services
  • Minikube for Kubernetes testing
  • Local PostgreSQL, Redis, Elasticsearch
  • Mock external services

Setup:
  docker-compose up -d  # Start local services
  npm run dev           # Start API server
  npm run web           # Start frontend
  npm run test:watch    # Run tests

Environment Variables:
  • .env.local (git-ignored)
  • .env.example (committed)
  • Environment-specific configs
```

### 11.2 Code Quality

```
Linting:
  • ESLint (JavaScript/TypeScript)
  • Prettier (formatting)
  • pre-commit hooks (Husky)

Testing:
  • Unit tests (Jest)
  • Integration tests (Jest + Supertest)
  • E2E tests (Playwright)
  • Load tests (k6)

Coverage:
  • Minimum: 80% line coverage
  • Critical paths: 100% coverage
  • ML models: Dedicated test sets

Code Review:
  • Required for all changes
  • At least 1 approval
  • CI must pass
  • Security review for sensitive changes
```

### 11.3 Branch Strategy

```
Git Flow:

main (production)
  │
  ├── develop (staging)
  │   │
  │   ├── feature/PROJ-123-add-memory-bank
  │   ├── feature/PROJ-124-improve-matching
  │   └── bugfix/PROJ-125-fix-auth-bug
  │
  └── hotfix/critical-security-fix

Branch Naming:
  • feature/PROJ-123-description
  • bugfix/PROJ-124-description
  • hotfix/description

Commit Messages:
  • Format: PROJ-123: Brief description
  • Body: Detailed explanation (why, what)
  • Footer: Breaking changes, issues closed
```

### 11.4 Documentation

```
Code Documentation:
  • TSDoc for TypeScript
  • OpenAPI/Swagger for APIs
  • Architecture Decision Records (ADRs)

Product Documentation:
  • User guides
  • API documentation
  • Integration guides

Internal Documentation:
  • Runbooks (ops procedures)
  • Architecture diagrams (C4 model)
  • Onboarding guides

Tools:
  • Notion (product docs)
  • Confluence (internal docs)
  • Storybook (component library)
```

---

## 12. MVP Architecture (Steadyhand)

### 12.1 MVP Scope Definition

**Goal**: Launch Steadyhand as standalone candidate platform with basic matching

**What's In**:
- ✅ Profile Management (Professional Identity Graph)
- ✅ Memory Bank (experiences, skills)
- ✅ Preference Map
- ✅ Basic Growth Map
- ✅ Conversation-based profile building
- ✅ Resume import and parsing
- ✅ Basic job aggregation (from 1-2 sources)
- ✅ Simple matching algorithm
- ✅ Match display and response
- ✅ Basic cognitive load features (triage, prep)
- ✅ Web application (mobile later)
- ✅ Candidate-controlled notifications and consent controls
- ✅ PRD bright line: no outbound communication without explicit user action

**What's Out (v2)**:
- ❌ Employer-facing Clearview tools
- ❌ Multi-dimensional sophisticated matching
- ❌ Advanced cognitive load features
- ❌ Mobile apps
- ❌ Multiple aggregation sources
- ❌ Advanced analytics
- ❌ Automated employer outreach for aggregated postings

### 12.2 MVP Architecture

```
Simplified Architecture:

┌─────────────────────────────────────────┐
│         React Web Application           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            API Gateway                  │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Profile │   │  Aggre- │   │  Match  │
│ Service │   │  gator  │   │ Service │
└─────────┘   └─────────┘   └─────────┘
    │               │               │
    └───────────────┼───────────────┘
                    ▼
          ┌─────────────────┐
          │   PostgreSQL    │
          │     Redis       │
          │   (S3 for docs) │
          └─────────────────┘
```

MVP Behavioral Guardrails:
- For first-party roles, introductions still require double opt-in.
- For aggregated external roles, MVP supports candidate-initiated outbound apply only (no employer-side workflow).
- Match notifications are candidate opt-in and digest-based.

### 12.3 MVP Tech Stack

```
Frontend:
  • React 18 + TypeScript
  • Vite
  • Tailwind CSS
  • React Router
  • React Query

Backend:
  • Node.js 20 + TypeScript
  • Fastify
  • TypeORM
  • PostgreSQL 15
  • Redis 7

AI/ML:
  • OpenAI GPT-4 (conversation, extraction)
  • text-embedding-3-small (embeddings)
  • pgvector (similarity search)
  • scikit-learn (simple matching)

Infrastructure:
  • AWS (ECS or single EC2 instance)
  • RDS PostgreSQL
  • ElastiCache Redis
  • S3
  • CloudFront

No Kubernetes initially (simplify ops)
```

### 12.4 MVP Data Model

```sql
-- Simplified schema for MVP

-- Candidates (same as full schema)
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_completeness_score DECIMAL(3,2) DEFAULT 0.00
);

-- Experiences (simplified)
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT,
  skills JSONB DEFAULT '[]',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preferences (simplified)
CREATE TABLE candidate_preferences (
  candidate_id UUID PRIMARY KEY REFERENCES candidates(id),
  role_types JSONB DEFAULT '[]',
  locations JSONB DEFAULT '[]',
  min_salary INTEGER,
  work_arrangements JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Postings (simplified, aggregated)
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  embedding vector(1536),
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches (simplified)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  score DECIMAL(5,2),
  candidate_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12.5 MVP Matching Algorithm

```python
# Simplified matching for MVP

def calculate_match_score(candidate, job_posting):
    """
    Simple matching based on:
    1. Semantic similarity (embeddings)
    2. Skill overlap
    3. Location match
    4. Salary alignment
    """
    
    scores = {}
    
    # 1. Semantic similarity
    candidate_embedding = get_candidate_embedding(candidate)
    job_embedding = job_posting.embedding
    scores['semantic'] = cosine_similarity(candidate_embedding, job_embedding)
    
    # 2. Skill overlap
    candidate_skills = set(get_candidate_skills(candidate))
    job_skills = set(extract_job_skills(job_posting))
    scores['skills'] = len(candidate_skills & job_skills) / max(len(job_skills), 1)
    
    # 3. Location match
    candidate_locations = candidate.preferences.locations
    job_location = job_posting.location
    scores['location'] = 1.0 if location_matches(candidate_locations, job_location) else 0.3
    
    # 4. Salary alignment
    if candidate.preferences.min_salary and job_posting.salary_max:
        scores['salary'] = 1.0 if job_posting.salary_max >= candidate.preferences.min_salary else 0.5
    else:
        scores['salary'] = 0.7  # Neutral if unknown
    
    # Weighted average
    weights = {'semantic': 0.4, 'skills': 0.3, 'location': 0.2, 'salary': 0.1}
    overall_score = sum(scores[key] * weights[key] for key in scores)
    
    return overall_score

def get_matches_for_candidate(candidate_id, limit=20):
    """
    Get top matches for a candidate
    """
    candidate = get_candidate(candidate_id)
    candidate_embedding = get_candidate_embedding(candidate)
    
    # Vector similarity search
    similar_jobs = db.query("""
        SELECT id, 
               1 - (embedding <=> %s) as similarity
        FROM job_postings
        WHERE posted_at > NOW() - INTERVAL '30 days'
        ORDER BY embedding <=> %s
        LIMIT 100
    """, [candidate_embedding, candidate_embedding])
    
    # Score and rank
    scored_matches = []
    for job in similar_jobs:
        score = calculate_match_score(candidate, job)
        if score > 0.5:  # Threshold
            scored_matches.append({
                'job_posting_id': job.id,
                'score': score,
                'similarity': job.similarity
            })
    
    # Sort by score and return top matches
    scored_matches.sort(key=lambda x: x['score'], reverse=True)
    return scored_matches[:limit]
```

### 12.6 MVP Development Timeline

```
Phase 1: Foundation (4 weeks)
  Week 1-2: Core infrastructure, database setup, API scaffold
  Week 3-4: Authentication, basic profile CRUD

Phase 2: Core Features (6 weeks)
  Week 5-6: Memory Bank + conversation interface
  Week 7-8: Preference management + resume import
  Week 9-10: Basic matching + job aggregation (1 source)

Phase 3: Polish & Launch (4 weeks)
  Week 11-12: UI/UX polish, cognitive load features
  Week 13-14: Testing, bug fixes, beta launch

Total: 14 weeks (3.5 months)
```

### 12.7 MVP Success Criteria

```
Quantitative:
  • 1000 candidate signups in first month
  • 70% profile completion rate
  • 50% of users receive at least 5 matches
  • NPS > 40

Qualitative:
  • Positive feedback on profile building experience
  • Users report reduced job search stress
  • Matches perceived as relevant

Technical:
  • 99.5% uptime
  • p95 latency < 500ms
  • Zero critical security incidents
  • 100% of introductions with auditable double opt-in trail
  • 0 unauthorized outbound intro messages
```

---

## 13. Future Considerations

### 13.1 Scalability Improvements

```
When to Scale:
  • > 100K candidates
  • > 10K daily active users
  • > 1M job postings indexed

How to Scale:
  • Migrate to Kubernetes
  • Implement database sharding
  • Add caching layers
  • Optimize ML models for performance
```

### 13.2 Feature Roadmap

```
v2.0: Employer Tools
  • Clearview role definition
  • Full employer workflow for double opt-in protocol
  • Employer dashboard

v3.0: Advanced Matching
  • Multi-dimensional scoring
  • Growth trajectory matching
  • Culture compatibility

v4.0: Scale & Expansion
  • Mobile apps
  • International markets
  • Enterprise features
```

### 13.3 Technical Debt Management

```
Strategies:
  • Allocate 20% of sprint capacity for tech debt
  • Regular architecture reviews
  • Refactoring sprints quarterly
  • Automated code quality tracking

Common Sources:
  • MVP shortcuts
  • Rapid feature development
  • Third-party dependencies
  • Scaling challenges
```

### 13.4 Research & Innovation

```
Areas to Explore:
  • Better matching algorithms (graph neural networks?)
  • Real-time collaboration features
  • AR/VR for interviews
  • Blockchain for credential verification
  • Advanced NLP for resume parsing

Investment:
  • 10% engineering time for R&D
  • Partnerships with universities
  • Open source contributions
```

---

## Appendix A: Technology Decisions Log

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Primary Language | TypeScript | Type safety, JavaScript ecosystem, full-stack consistency | 2026-01 |
| Database | PostgreSQL | ACID compliance, reliability, JSON support, pgvector | 2026-01 |
| Cloud Provider | AWS | Maturity, service breadth, team expertise | 2026-01 |
| Container Orchestration | Kubernetes (future) | Scalability, ecosystem, portability | 2026-02 |
| ML Framework | PyTorch | Flexibility, research-friendly, production-ready | 2026-02 |
| LLM Provider | OpenAI | Best performance, API reliability | 2026-02 |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Professional Identity Graph** | Multi-dimensional representation of candidate's professional self |
| **Memory Bank** | Repository of candidate experiences and skills |
| **Team Needs Graph** | Structured representation of employer requirements |
| **Double Opt-In** | Both parties must agree before introduction |
| **Cognitive Load Protection** | Features to reduce mental burden on users |
| **Embedding** | Dense vector representation of text for semantic similarity |
| **pgvector** | PostgreSQL extension for vector similarity search |

---

## Appendix C: References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [PostgreSQL pgvector Extension](https://github.com/pgvector/pgvector)
- [React Documentation](https://react.dev/)
- [Fastify Framework](https://www.fastify.io/)

---

**Document End**
