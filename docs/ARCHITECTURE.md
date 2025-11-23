# Technical Architecture - KAIRO STUDIO

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │     R3F      │  │   Tailwind   │      │
│  │   (SSR/SSG)  │  │  (3D Scene)  │  │    (UI)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────┐
            │   Vercel Edge  │  │  CDN Assets │
            │   (Frontend)   │  │ (R2/CloudFlare)│
            └───────┬────────┘  └─────────────┘
                    │
            ┌───────▼────────┐
            │  Express API   │
            │  (Node + TS)   │
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │   PostgreSQL   │
            │   (Managed)    │
            └────────────────┘
```

## Architecture Principles

1. **Progressive Enhancement** - Core content works without JS/WebGL
2. **Edge-First** - Leverage edge functions for speed
3. **API-First** - Clean separation of concerns
4. **Performance Budget** - Strict limits on bundle/asset sizes
5. **Security by Default** - JWT, CORS, rate limiting, CSP

---

## Frontend Architecture (Next.js 14)

### App Router Structure

```
/app
├── (marketing)/          # Public marketing pages
│   ├── page.tsx         # Landing page
│   ├── services/
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── work/
│   ├── about/
│   └── contact/
├── (dashboard)/         # Authenticated app
│   ├── layout.tsx
│   └── app/
│       ├── dashboard/
│       ├── automations/
│       └── profile/
├── api/                 # API routes (proxy to Express)
├── layout.tsx
└── globals.css
```

### Component Architecture

```
/components
├── 3d/                  # React Three Fiber components
│   ├── SceneRoot.tsx
│   ├── CameraController.tsx
│   ├── Planet.tsx
│   ├── LODModel.tsx
│   ├── OrbitControls.tsx
│   └── scenes/
│       ├── HeroOrbit.tsx
│       ├── ServicePlanet.tsx
│       └── CaseStudyRoom.tsx
├── ui/                  # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Form.tsx
│   └── Modal.tsx
├── layout/              # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── providers/           # Context providers
    ├── ThemeProvider.tsx
    └── AuthProvider.tsx
```

### State Management

- **Zustand** for global app state
- **React Query** for server state
- **React Context** for theme/auth

```typescript
// Store structure
interface AppState {
  user: User | null;
  currentPlanet: string | null;
  cameraMode: 'orbit' | 'transit' | 'focus';
  loadingAssets: boolean;
}
```

### 3D Scene Management

```typescript
// LOD System
interface LODConfig {
  distances: [number, number, number]; // [low, mid, high]
  models: {
    low: string;    // /models/planet-low.glb
    mid: string;
    high: string;
  }
}

// Asset Loading Strategy
1. Load low-poly models first (< 100KB)
2. Preload mid-poly on proximity
3. Lazy load high-poly on focus
4. Use suspense boundaries for loading states
```

---

## Backend Architecture (Express + TypeScript)

### Project Structure

```
/server
├── src/
│   ├── controllers/     # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   └── assets.controller.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── storage.service.ts
│   ├── models/          # Prisma models
│   │   └── index.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   └── assets.routes.ts
│   ├── utils/           # Utilities
│   │   ├── validation.ts
│   │   └── jwt.ts
│   ├── config/          # Configuration
│   │   └── index.ts
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

### Middleware Stack

```typescript
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));          // CORS
app.use(express.json());             // Body parser
app.use(rateLimiter);                // Rate limiting
app.use('/api', routes);             // API routes
app.use(errorHandler);               // Error handling
```

### Authentication Flow

```
1. User submits login credentials
2. Server validates & generates JWT + refresh token
3. JWT stored in httpOnly cookie
4. Refresh token stored in secure cookie
5. Client includes JWT in Authorization header
6. Middleware validates JWT on protected routes
7. Refresh endpoint exchanges refresh token for new JWT
```

---

## Database Architecture (PostgreSQL + Prisma)

### Schema Overview

```prisma
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String
  name          String?
  role          Role          @default(CLIENT)
  company       Company?      @relation(fields: [companyId], references: [id])
  companyId     String?
  automations   Automation[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Company {
  id            String        @id @default(uuid())
  name          String
  website       String?
  users         User[]
  projects      Project[]
  createdAt     DateTime      @default(now())
}

model Project {
  id            String        @id @default(uuid())
  slug          String        @unique
  title         String
  summary       String
  content       Json
  heroAsset     String
  company       Company       @relation(fields: [companyId], references: [id])
  companyId     String
  published     Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Automation {
  id            String        @id @default(uuid())
  title         String
  flow          Json
  status        AutoStatus    @default(DRAFT)
  user          User          @relation(fields: [userId], references: [id])
  userId        String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Asset {
  id            String        @id @default(uuid())
  filename      String
  url           String
  type          AssetType
  metadata      Json?
  createdAt     DateTime      @default(now())
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
}

enum AssetType {
  MODEL
  TEXTURE
  IMAGE
  VIDEO
}
```

### Indexes & Performance

```prisma
@@index([email])
@@index([slug])
@@index([createdAt])
@@index([userId, status])
```

---

## Asset Pipeline

### 3D Asset Optimization Flow

```
Source (.blend/.fbx)
    ↓
Export GLB (uncompressed)
    ↓
gltfpack (Draco compression)
    ↓
Generate LODs (3 levels)
    ↓
Compress textures (Basis/KTX2)
    ↓
Upload to R2/S3
    ↓
Serve via CDN with cache headers
```

### Asset Budget

- Per model (LOD0): < 200KB
- Per texture: 1024x1024 max, compressed
- Total initial load: < 500KB (3D assets)
- Total page load: < 2MB

---

## Performance Strategy

### SSR + Hydration

1. Server renders HTML with content
2. Client receives static HTML (FCP < 1s)
3. Hydrate React (TTI < 2s)
4. Initialize 3D canvas (3D ready < 3s)

### Code Splitting

```typescript
// Dynamic imports for heavy components
const CaseStudyRoom = dynamic(() => import('@/components/3d/CaseStudyRoom'), {
  ssr: false,
  loading: () => <Loader />
});
```

### Caching Strategy

- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- API responses: `Cache-Control: private, max-age=300`
- 3D models: CDN edge cache + browser cache

---

## Security Architecture

### Defense Layers

1. **Input Validation** - Zod schemas for all inputs
2. **Authentication** - JWT with short expiry + refresh tokens
3. **Authorization** - Role-based access control (RBAC)
4. **Rate Limiting** - Per IP, per user, per endpoint
5. **CORS** - Whitelist allowed origins
6. **CSP** - Content Security Policy headers
7. **HTTPS Only** - Strict transport security
8. **SQL Injection** - Prisma parameterized queries
9. **XSS Prevention** - React auto-escaping + CSP

### Secrets Management

- Environment variables for sensitive config
- Vercel/Render environment settings
- No secrets in git
- Rotate keys quarterly

---

## Monitoring & Observability

### Metrics

- **Performance**: Core Web Vitals (LCP, FID, CLS)
- **Errors**: Error rate, error types (Sentry)
- **Business**: Conversion rate, lead volume
- **Infrastructure**: API latency, DB query time

### Logging

```typescript
// Structured logging
logger.info('User login', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date()
});
```

### Alerts

- API error rate > 5%
- Response time p95 > 1s
- Database connection failures
- Critical security events

---

## Deployment Architecture

### CI/CD Pipeline

```
GitHub Push
    ↓
Run Tests (Jest + Playwright)
    ↓
Lint & Type Check
    ↓
Build Frontend (Next.js)
    ↓
Build Backend (TypeScript)
    ↓
Deploy Frontend → Vercel
    ↓
Deploy Backend → Render
    ↓
Run Smoke Tests
    ↓
Update Monitoring
```

### Environments

- **Development**: Local (Docker Compose)
- **Staging**: Vercel Preview + Render staging
- **Production**: Vercel Production + Render production

---

## Scalability Considerations

### Current Architecture (MVP)

- Handles ~10K monthly visitors
- ~100 concurrent users
- Single server instance

### Scale Path

1. **10K → 100K users**: Add Redis cache, CDN edge caching
2. **100K → 1M users**: Horizontal API scaling, read replicas
3. **1M+ users**: Microservices, message queue, dedicated assets service

---

## Technology Choices - Rationale

| Technology | Rationale |
|-----------|-----------|
| Next.js 14 | SSR, edge functions, image optimization, great DX |
| React Three Fiber | Declarative 3D, React ecosystem, performance |
| TypeScript | Type safety, better DX, fewer runtime errors |
| Prisma | Type-safe ORM, migrations, great DX |
| Tailwind | Utility-first, small bundle, fast development |
| Vercel | Edge network, zero-config, preview deployments |
| PostgreSQL | ACID compliance, JSON support, mature ecosystem |

---

## Next Steps

See `PHASES.md` for implementation roadmap.
