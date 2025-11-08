# Quick Installation Guide

## Step-by-Step Setup

### 1. Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Or if you have a postgres user password:
psql -U postgres

# Inside psql:
CREATE DATABASE kairo_studio;
CREATE USER kairo_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE kairo_studio TO kairo_user;
\q
```

### 3. Configure Environment Variables

**Server configuration:**
```bash
cd server
cp .env.example .env
# Edit .env and update:
# - DB_PASSWORD with your PostgreSQL password
# - DB_USER if using custom user
# - Other settings as needed
```

**Client configuration:**
```bash
cd ../client
# Create .env file (already exists)
# Update VITE_API_URL if server is on different port
```

### 4. Install Dependencies & Run Migrations

```bash
# Install server dependencies
cd ../server
npm install

# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
node seeds/seedData.js
```

### 5. Install Client Dependencies

```bash
cd ../client
npm install
```

### 6. Start Development Servers

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### 7. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Verification

1. Open browser to http://localhost:5173
2. You should see the Kairo Studio loading screen
3. Wait for 3D scene to load
4. Navigate using arrow keys or clicking walls

## Common Issues

### PostgreSQL Not Running
```bash
# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list
brew services start postgresql
```

### Port 5000 or 5173 Already in Use
Edit the respective `.env` files:
- Server: Change `PORT` in `server/.env`
- Client: Vite will auto-increment port if 5173 is busy

### Database Connection Fails
1. Check PostgreSQL is running
2. Verify credentials in `server/.env`
3. Test connection:
```bash
psql -U postgres -d kairo_studio -c "SELECT 1;"
```

### Node Version Issues
Ensure Node.js v14+ is installed:
```bash
node --version
# If older, update Node.js:
# Ubuntu: sudo apt install nodejs
# macOS: brew upgrade node
# Windows: Download from nodejs.org
```

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in server
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Change all default secrets and passwords
- [ ] Run `npm run build` in client
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure SSL certificates
- [ ] Set up PostgreSQL backups
- [ ] Enable PostgreSQL connection pooling
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in `server/routes/`
- Check console logs for errors
- Ensure all dependencies are installed correctly
