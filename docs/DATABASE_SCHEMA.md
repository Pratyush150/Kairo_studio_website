# Database Schema - KAIRO STUDIO

Complete PostgreSQL database schema using Prisma ORM.

---

## Core Tables

### users
User accounts for clients, team members, and admins.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'CLIENT', -- 'ADMIN', 'TEAM', 'CLIENT'
  company_id UUID REFERENCES companies(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company_id);
```

### companies
Client organizations.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  logo_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
```

### projects
Case studies and client projects.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  hero_asset TEXT, -- URL to 3D model or image
  content JSONB NOT NULL, -- Structured content blocks
  metrics JSONB, -- Project results/metrics
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_published ON projects(published);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
```

### automations
User automation workflows.

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  flow JSONB NOT NULL, -- { nodes: [], edges: [] }
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_user ON automations(user_id);
CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_created ON automations(created_at DESC);
```

### automation_runs
Execution logs for automations.

```sql
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'RUNNING', 'SUCCESS', 'FAILED'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  logs JSONB, -- Execution logs
  error TEXT
);

CREATE INDEX idx_runs_automation ON automation_runs(automation_id);
CREATE INDEX idx_runs_status ON automation_runs(status);
CREATE INDEX idx_runs_started ON automation_runs(started_at DESC);
```

### assets
3D models, textures, images, videos.

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'MODEL', 'TEXTURE', 'IMAGE', 'VIDEO'
  size_bytes INTEGER,
  mime_type TEXT,
  metadata JSONB, -- { width, height, vertices, lod_level, etc }
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_created ON assets(created_at DESC);
```

### leads
Contact form submissions and lead capture.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  source TEXT, -- 'CONTACT_FORM', 'PLATFORM_SIGNUP', 'CHAT'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB, -- Any additional context
  status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
```

### services
Service offerings (automation, marketing, etc).

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured content
  icon_url TEXT,
  planet_model_url TEXT, -- 3D planet model
  featured_order INTEGER,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_published ON services(published);
```

### sessions
User sessions for auth (optional - can use stateless JWT only).

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String        @map("password_hash")
  name         String?
  role         Role          @default(CLIENT)
  companyId    String?       @map("company_id")
  avatarUrl    String?       @map("avatar_url")
  company      Company?      @relation(fields: [companyId], references: [id])
  automations  Automation[]
  sessions     Session[]
  assets       Asset[]       @relation("CreatedAssets")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  @@index([email])
  @@index([role])
  @@map("users")
}

model Company {
  id        String    @id @default(uuid())
  name      String
  website   String?
  industry  String?
  logoUrl   String?   @map("logo_url")
  metadata  Json?
  users     User[]
  projects  Project[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@index([name])
  @@map("companies")
}

model Project {
  id         String    @id @default(uuid())
  companyId  String?   @map("company_id")
  slug       String    @unique
  title      String
  summary    String
  heroAsset  String?   @map("hero_asset")
  content    Json
  metrics    Json?
  tags       String[]
  published  Boolean   @default(false)
  featured   Boolean   @default(false)
  company    Company?  @relation(fields: [companyId], references: [id])
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@index([slug])
  @@index([published])
  @@index([featured])
  @@index([createdAt])
  @@map("projects")
}

model Automation {
  id              String          @id @default(uuid())
  userId          String          @map("user_id")
  title           String
  description     String?
  flow            Json
  status          AutoStatus      @default(DRAFT)
  executionCount  Int             @default(0) @map("execution_count")
  lastExecutedAt  DateTime?       @map("last_executed_at")
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  runs            AutomationRun[]
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("automations")
}

model AutomationRun {
  id            String      @id @default(uuid())
  automationId  String      @map("automation_id")
  status        RunStatus
  startedAt     DateTime    @default(now()) @map("started_at")
  completedAt   DateTime?   @map("completed_at")
  durationMs    Int?        @map("duration_ms")
  logs          Json?
  error         String?
  automation    Automation  @relation(fields: [automationId], references: [id], onDelete: Cascade)

  @@index([automationId])
  @@index([status])
  @@index([startedAt])
  @@map("automation_runs")
}

model Asset {
  id         String     @id @default(uuid())
  filename   String
  url        String
  type       AssetType
  sizeBytes  Int?       @map("size_bytes")
  mimeType   String?    @map("mime_type")
  metadata   Json?
  tags       String[]
  createdBy  String?    @map("created_by")
  creator    User?      @relation("CreatedAssets", fields: [createdBy], references: [id])
  createdAt  DateTime   @default(now()) @map("created_at")

  @@index([type])
  @@index([createdAt])
  @@map("assets")
}

model Lead {
  id          String    @id @default(uuid())
  name        String
  email       String
  message     String
  phone       String?
  company     String?
  source      String?
  utmSource   String?   @map("utm_source")
  utmMedium   String?   @map("utm_medium")
  utmCampaign String?   @map("utm_campaign")
  metadata    Json?
  status      LeadStatus @default(NEW)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("leads")
}

model Service {
  id              String   @id @default(uuid())
  slug            String   @unique
  title           String
  tagline         String?
  description     String
  content         Json
  iconUrl         String?  @map("icon_url")
  planetModelUrl  String?  @map("planet_model_url")
  featuredOrder   Int?     @map("featured_order")
  published       Boolean  @default(true)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([slug])
  @@index([published])
  @@map("services")
}

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  refreshToken String   @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([refreshToken])
  @@index([expiresAt])
  @@map("sessions")
}

enum Role {
  ADMIN
  TEAM
  CLIENT
}

enum AutoStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

enum RunStatus {
  RUNNING
  SUCCESS
  FAILED
}

enum AssetType {
  MODEL
  TEXTURE
  IMAGE
  VIDEO
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}
```

---

## Migration Strategy

1. **Initial migration**: Create all tables
2. **Seed data**: Insert initial services, sample projects
3. **Versioning**: Use Prisma migrations for schema changes
4. **Backup**: Daily automated backups of production DB

---

## Indexes & Performance

### Query Patterns

- Most common: `SELECT * FROM projects WHERE published = true ORDER BY created_at DESC`
- Requires index on: `(published, created_at)`
- Lead queries: Filter by status and sort by date
- Automation queries: Filter by user + status

### JSONB Indexes

For frequently queried JSON fields:

```sql
CREATE INDEX idx_projects_content_gin ON projects USING GIN (content);
CREATE INDEX idx_automations_flow_gin ON automations USING GIN (flow);
```

---

## Data Relationships

```
User ──┬── Automations ──── AutomationRuns
       ├── Sessions
       ├── Assets
       └── Company ──── Projects

Lead (standalone)

Service (standalone)
```

---

## Security

- **No sensitive data in JSONB**: Keep PII in typed columns
- **Soft deletes**: Add `deleted_at` for user data (GDPR)
- **Encryption**: Use pgcrypto for sensitive fields if needed
- **Row-level security**: Implement RLS policies for multi-tenant isolation

---

## Next Steps

1. Initialize Prisma in backend project
2. Create initial migration
3. Seed development database
4. Test queries and indexes
