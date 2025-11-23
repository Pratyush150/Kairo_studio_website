# KAIRO STUDIO - Automation Universe

> A full-stack PERN application with immersive 3D experiences showcasing automation solutions, marketing systems, and AI products.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black)](https://threejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

![KAIRO STUDIO Banner](https://via.placeholder.com/1200x400/0f0724/00E5FF?text=KAIRO+STUDIO+-+Automation+Universe)

---

## 🌟 Overview

KAIRO STUDIO is a next-generation web application that combines cutting-edge 3D graphics with powerful business automation tools. Built with Next.js 14, React Three Fiber, and Prisma, it delivers an interactive "Automation Universe" experience where users can explore services, view case studies, and manage their automation projects.

**Live Demo**: [http://152.67.2.20:3000](http://152.67.2.20:3000)

---

## ✨ Features

### 🎨 Interactive 3D Experience
- **Orbital Navigation**: Navigate through services using an interactive 3D planetary system
- **React Three Fiber**: Smooth 60 FPS animations on desktop, 30+ FPS on mobile
- **Performance Optimized**: Device-aware rendering with LOD (Level of Detail) support
- **WebGL Fallbacks**: Progressive enhancement for non-WebGL browsers

### 🔐 Complete Authentication System
- **JWT-based Authentication**: Secure token-based auth with 7-day expiration
- **Password Security**: Bcrypt hashing with strength validation
- **Protected Routes**: Client dashboard with role-based access control
- **Session Management**: Database-backed sessions with Prisma

### 💼 Business Features
- **5 Service Pages**: Automation, Marketing, SaaS & AI, Branding, Strategy
- **3 Case Studies**: Real-world examples with metrics and testimonials
- **Lead Capture**: Contact form with database persistence and CRM webhooks
- **Client Dashboard**: Protected portal with project and automation stats

### 🗄️ Database & API
- **Prisma ORM**: Type-safe database access with SQLite (production-ready for PostgreSQL)
- **RESTful API**: 4 endpoints for authentication and lead management
- **Database Models**: User, Session, Project, Automation, Lead
- **Migration System**: Version-controlled database schema

### 🔍 SEO & Performance
- **Full SEO Setup**: Meta tags, OpenGraph, Twitter Cards
- **Dynamic Sitemap**: Auto-generated XML sitemap for 14 routes
- **PWA Support**: Manifest.json and offline capabilities
- **Performance**: Optimized bundle size, code splitting, lazy loading

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 8+ (or yarn/pnpm)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kairo-studio.git
cd kairo-studio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: CRM Integration
WEBHOOK_URL="https://hooks.zapier.com/..."
ADMIN_API_KEY="your-admin-key"
```

For production, see `.env.production.example`.

---

## 📦 Project Structure

```
kairo-studio/
├── docs/                          # Comprehensive documentation
│   ├── MASTER_PLAN.md            # Complete implementation plan
│   ├── PHASES.md                 # Development roadmap
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── DATABASE_SCHEMA.md        # Database design
│   ├── API_CONTRACT.md           # API specifications
│   ├── BRAND_GUIDE.md            # Brand & design system
│   └── PHASE_*_COMPLETION.md     # Phase completion reports
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/
│   ├── models/                   # 3D models (GLB/GLTF)
│   ├── textures/                 # 3D textures
│   └── manifest.json             # PWA manifest
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/                  # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   └── leads/           # Lead capture endpoint
│   │   ├── dashboard/           # Protected dashboard
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── services/            # Services pages
│   │   ├── work/                # Case studies
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots.txt
│   ├── components/
│   │   ├── 3d/                  # React Three Fiber components
│   │   │   ├── Scene.tsx        # R3F Canvas wrapper
│   │   │   ├── Orb.tsx          # Central orb
│   │   │   ├── Planet.tsx       # Orbital planets
│   │   │   ├── ParticleField.tsx # Star field
│   │   │   └── HeroOrbit.tsx    # Main 3D scene
│   │   ├── layout/              # Layout components
│   │   │   └── Hero3D.tsx       # 3D hero wrapper
│   │   └── ui/                  # UI components
│   │       ├── ContactForm.tsx  # Lead capture form
│   │       ├── CalendlyModal.tsx # Scheduling modal
│   │       ├── ErrorBoundary.tsx # Error handling
│   │       └── Loader.tsx       # Loading component
│   ├── hooks/
│   │   └── useDeviceCapability.ts # Device detection
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # Auth utilities
│   │   ├── services.ts          # Services data
│   │   └── case-studies.ts      # Case studies data
│   └── styles/
│       └── globals.css          # Global styles
├── DEPLOYMENT.md                 # Deployment guide (420 lines)
├── .env.example                  # Environment template
├── .env.production.example       # Production env template
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── prisma.config.ts              # Prisma config
└── package.json                  # Dependencies
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Useful helpers for R3F
- **[Three.js](https://threejs.org/)** - 3D graphics library

### Backend & Database
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[SQLite](https://www.sqlite.org/)** - Development database (PostgreSQL for production)
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT authentication

### Deployment & DevOps
- **[Vercel](https://vercel.com/)** - Recommended hosting platform
- **Docker** - Containerization support
- **GitHub Actions** - CI/CD (coming soon)

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### Main Documentation
- **[MASTER_PLAN.md](docs/MASTER_PLAN.md)** - Complete project vision and implementation plan
- **[PHASES.md](docs/PHASES.md)** - 7-phase development roadmap (6/7 complete)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and system design
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with 3 options

### API & Database
- **[API_CONTRACT.md](docs/API_CONTRACT.md)** - RESTful API specification
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database models and relationships

### Design & Brand
- **[BRAND_GUIDE.md](docs/BRAND_GUIDE.md)** - Brand identity, colors, typography, copywriting

### Phase Reports
- **[PHASE_B_COMPLETION.md](docs/PHASE_B_COMPLETION.md)** - 3D Framework implementation
- **[PHASE_C_COMPLETION.md](docs/PHASE_C_COMPLETION.md)** - Services & Content
- **[PHASE_D_COMPLETION.md](docs/PHASE_D_COMPLETION.md)** - Conversion flows
- **[PHASE_E_COMPLETION.md](docs/PHASE_E_COMPLETION.md)** - Authentication & Dashboard
- **[PHASE_F_COMPLETION.md](docs/PHASE_F_COMPLETION.md)** - Polish & Deploy

---

## 🌐 Available Routes

### Public Routes
- `/` - Landing page with 3D orbital navigation
- `/services` - Services overview (grid)
- `/services/[slug]` - Service detail pages (5 services)
  - `/services/automation`
  - `/services/marketing`
  - `/services/saas-ai`
  - `/services/branding`
  - `/services/strategy`
- `/work` - Case studies overview
- `/work/[slug]` - Case study details (3 studies)
  - `/work/acme-automation`
  - `/work/techstart-marketing`
  - `/work/proptech-saas`
- `/login` - User authentication
- `/signup` - User registration

### Protected Routes
- `/dashboard` - Client dashboard (requires authentication)

### SEO Routes
- `/sitemap.xml` - Dynamic XML sitemap
- `/robots.txt` - Search engine directives
- `/manifest.json` - PWA manifest

### API Endpoints
- `POST /api/leads` - Lead capture
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get authenticated user info

---

## 🎨 Features Deep Dive

### 3D Orbital Navigation

The centerpiece of KAIRO STUDIO is the interactive 3D orbital system:

- **5 Orbiting Planets**: Each represents a service (Automation, Marketing, SaaS & AI, Branding, Strategy)
- **Central Orb**: Glowing icosahedron with emissive materials
- **Particle Field**: 500/300/200 particles based on device capability
- **OrbitControls**: Drag to rotate, scroll to zoom
- **Click Navigation**: Click planets to navigate to service pages
- **Performance Optimized**: 60 FPS on desktop, 30+ FPS on mobile

**Technical Details**:
- React Three Fiber for declarative 3D
- Device capability detection for quality adjustment
- Lazy loading with Suspense boundaries
- SSR-safe with dynamic imports

### Authentication System

Secure JWT-based authentication with:

- **Password Security**:
  - Bcrypt hashing (10 rounds)
  - Strength validation (8+ chars, uppercase, lowercase, numbers)
- **JWT Tokens**:
  - 7-day expiration
  - Secure secret from environment
- **Session Management**:
  - Database-backed sessions
  - Token refresh support
- **Protected Routes**:
  - Client dashboard
  - Admin endpoints (role-based)

### Database Schema

5 models with proper relationships:

```prisma
User (authentication & profile)
├── Session (JWT sessions)
├── Project (client projects)
└── Automation (workflow automations)

Lead (contact form submissions)
```

**Migration System**:
- Version-controlled schema
- Easy rollback support
- Production-ready migrations

---

## 🚀 Deployment

### Quick Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Deploy to production
vercel --prod
```

**Set Environment Variables** in Vercel Dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Other Options

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for:
- Docker deployment
- VPS deployment (Ubuntu + Nginx + PM2)
- Database migration to PostgreSQL
- SSL configuration
- Monitoring setup

---

## 📊 Project Stats

**Development Progress**: 86% Complete (6/7 phases)

**Codebase**:
- 33 TypeScript/TSX files
- 11 comprehensive documentation files
- 4 API endpoints
- 14 public routes
- 5 database models

**Testing**:
- ✅ 14/14 routes working (100%)
- ✅ 4/4 API endpoints verified (100%)
- ✅ 0 compilation errors
- ✅ 0 runtime errors

**Features**:
- ✅ Interactive 3D navigation
- ✅ Complete authentication system
- ✅ Database-backed lead capture
- ✅ Protected client dashboard
- ✅ 5 service pages with details
- ✅ 3 case studies with metrics
- ✅ Full SEO setup
- ✅ PWA-ready
- ✅ Production deployment guides

---

## 🎯 Roadmap

### Completed (6/7 Phases)
- ✅ Phase A: Foundations
- ✅ Phase B: 3D Framework
- ✅ Phase C: Services & Content
- ✅ Phase D: Conversion Flows
- ✅ Phase E: Authentication & Dashboard
- ✅ Phase F: Polish & Deploy

### Phase G: Iterate & Optimize (Optional)
- [ ] Analytics integration (Google Analytics / Plausible)
- [ ] A/B testing framework
- [ ] Performance monitoring (Lighthouse CI)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] User feedback system
- [ ] Advanced automation builder UI

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test all changes locally
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Prisma Team** - Best ORM experience
- **Poimandres** - React Three Fiber & Drei
- **Vercel** - Deployment platform

---

## 📞 Support

For questions or support:
- 📧 Email: contact@kairostudio.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/kairo-studio/issues)
- 📖 Documentation: See `/docs` folder

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ by KAIRO STUDIO**

*Automations that move your business*

---

## 📸 Screenshots

### Homepage with 3D Orbital
![Homepage](https://via.placeholder.com/800x400/0f0724/00E5FF?text=3D+Orbital+Navigation)

### Service Detail Page
![Service Page](https://via.placeholder.com/800x400/0f0724/FF6B6B?text=Service+Detail+Page)

### Client Dashboard
![Dashboard](https://via.placeholder.com/800x400/0f0724/00E5FF?text=Client+Dashboard)

### Case Study
![Case Study](https://via.placeholder.com/800x400/0f0724/FF6B6B?text=Case+Study+Page)

---

**Last Updated**: November 23, 2025
**Version**: 1.0.0
**Status**: Production Ready 🚀
