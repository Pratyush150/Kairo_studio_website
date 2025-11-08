# Kairo Studio - PERN Stack Application

A modern full-stack web application with an immersive 3D experience built using PostgreSQL, Express, React, and Node.js (PERN stack).

## Architecture

### Backend (Server)
- **Node.js** with **Express** - RESTful API server
- **PostgreSQL** - Relational database
- **Environment**: ES6 modules, CORS, Rate limiting, Security headers

### Frontend (Client)
- **React 18** with **Vite** - Modern build tool and development server
- **Three.js** - 3D graphics and WebGL
- **GSAP** - Smooth animations
- **CSS3** - Modern styling with CSS variables

## Features

- ✨ Immersive 3D hexagonal studio experience
- 🎨 Interactive project showcases
- 📊 Real-time performance monitoring
- ♿ Accessibility features (motion toggle, keyboard navigation)
- 📱 Responsive design with mobile fallback
- 🔒 Secure API with rate limiting
- 📧 Contact form with validation
- 🗄️ PostgreSQL database with migrations

## Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd kairo_studio
```

### 2. Database Setup

**Create PostgreSQL database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kairo_studio;

# Exit psql
\q
```

**Configure database credentials:**

Edit `server/.env` and update the database settings:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=kairo_studio
DB_PASSWORD=your_password_here
DB_PORT=5432
```

### 3. Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
node seeds/seedData.js

# Start development server
npm run dev
```

The server will start on `http://localhost:5000`

### 4. Client Setup

Open a new terminal:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The client will start on `http://localhost:5173`

## Project Structure

```
kairo_studio/
├── server/                  # Backend Express API
│   ├── config/
│   │   └── database.js     # PostgreSQL connection
│   ├── routes/
│   │   ├── projects.js     # Project endpoints
│   │   ├── contact.js      # Contact form endpoints
│   │   └── content.js      # Content endpoints
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── runMigrations.js
│   ├── seeds/
│   │   └── seedData.js     # Sample data seeding
│   ├── server.js           # Express app entry point
│   ├── package.json
│   └── .env                # Environment variables
│
├── client/                  # Frontend React app
│   ├── public/
│   │   └── assets/
│   │       └── js/
│   │           └── main.js # Three.js logic
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env                # Environment variables
│
└── README.md
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:slug` - Get project by slug

### Content
- `GET /api/content/services` - Get all services
- `GET /api/content/stats` - Get statistics

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact/messages` - Get all messages (admin)

## Environment Variables

### Server (.env)
```env
PORT=5000
NODE_ENV=development
DB_USER=postgres
DB_HOST=localhost
DB_NAME=kairo_studio
DB_PASSWORD=your_password_here
DB_PORT=5432
CORS_ORIGIN=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## Development Commands

### Server
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run db:migrate   # Run database migrations
```

### Client
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Production Deployment

### Server
1. Set environment variables in production
2. Run migrations: `npm run db:migrate`
3. Start server: `npm start`

### Client
1. Build the app: `npm run build`
2. Serve the `dist` folder with a static file server (Nginx, Apache, etc.)

## Database Schema

### Tables
- **projects** - Portfolio projects with images, descriptions, and metadata
- **services** - Service offerings with descriptions
- **contact_messages** - Contact form submissions
- **stats** - Site statistics and metrics

See `server/migrations/001_initial_schema.sql` for full schema.

## Technologies Used

### Backend
- Express.js
- PostgreSQL (pg library)
- Helmet (security headers)
- CORS
- express-rate-limit
- Joi (validation)
- dotenv

### Frontend
- React 18
- Vite
- Three.js (3D graphics)
- GSAP (animations)
- Modern CSS3

## Key Features & Navigation

### 3D Navigation
- **Arrow Keys**: Navigate through hexagonal walls
- **Number Keys (1-6)**: Jump to specific sections
- **Mouse**: Click or hover over walls
- **ESC**: Close panels and return to center

### Sections
1. **Entry** - Welcome and navigation guide
2. **About** - Company information and stats
3. **Work** - Case studies and projects
4. **Services** - Service workflow and offerings
5. **Demos** - Interactive demonstrations
6. **Contact** - Contact form and information

### Performance
- FPS monitor in top-right corner
- Automatic performance throttling
- Motion toggle for accessibility
- WebGL detection and fallbacks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for 3D features.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
- Check credentials in `server/.env`
- Ensure database `kairo_studio` exists

### Port Already in Use
- Server: Change `PORT` in `server/.env`
- Client: Vite will automatically try next available port

### Three.js Not Loading
- Check browser console for errors
- Ensure CDN links are accessible
- Try clearing browser cache

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Email: hello@kairostudio.com
- GitHub Issues: [repository-url]/issues
