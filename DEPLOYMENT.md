# WebGenix - Docker Deployment Guide

## Prerequisites

- **Docker** (v24+) - [Install Guide](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.20+) - Included with Docker Desktop
- **Git** - For cloning the repository
- **Domain name** (for production) - Optional for local testing

---

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project root
cd WebGenix

# Copy environment template
cp .env.docker .env
```

### 2. Configure Environment

Edit `.env` file with your values:

```bash
# Generate secure JWT secrets
openssl rand -hex 32  # Run twice, use different values

# Update these in .env:
MONGO_ROOT_PASSWORD=your_secure_password
JWT_ACCESS_SECRET=<output-from-openssl-1>
JWT_REFRESH_SECRET=<output-from-openssl-2>
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Build and Start

```bash
# Build all services
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Seed Initial Data

```bash
# Seed ticket departments
docker compose exec backend npm run seed

# Seed billing products
docker compose exec backend npm run seed:products
```

### 5. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health
- **API Health**: http://localhost/api/health

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Nginx (Port 80/443)                     │
│              Reverse Proxy + Static Files                   │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           │ /api/*                   │ /* (frontend SPA)
           ▼                          ▼
┌─────────────────────┐    ┌─────────────────────────┐
│  Backend (Node.js)  │    │  Frontend (Nginx)       │
│  Port: 5000         │    │  Port: 80               │
│  Express + Mongoose │    │  Vite production build  │
└──────────┬──────────┘    └─────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB (Port 27017)                     │
│                Persistent Volume: mongo-data                │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
WebGenix/
├── docker-compose.yml          # Main Docker orchestration
├── docker-compose.prod.yml     # Production overrides
├── nginx.conf                  # Root Nginx reverse proxy config
├── .env.docker                 # Environment template
├── .env                        # Your environment (gitignored)
├── ssl/                        # SSL certificates (create for prod)
│
├── webgenix-backend/
│   ├── Dockerfile              # Backend multi-stage build
│   └── .dockerignore           # Docker exclusions
│
├── webgenix-app/
│   ├── Dockerfile              # Frontend multi-stage build
│   ├── nginx.conf              # Frontend SPA routing config
│   └── .dockerignore           # Docker exclusions
│
└── documents/
    └── DEPLOYMENT_PLAN.md      # Detailed deployment plan
```

---

## Services

| Service | Container | Image | Port | Purpose |
|---------|-----------|-------|------|---------|
| MongoDB | `webgenix-mongo` | `mongo:7` | 27017 | Database |
| Backend | `webgenix-backend` | Custom | 5000 | Node.js API |
| Frontend | `webgenix-frontend` | Custom | 80 | React SPA |
| Nginx | `webgenix-nginx` | `nginx:alpine` | 80/443 | Reverse Proxy |

---

## Common Commands

### Start/Stop

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and start
docker compose up --build -d

# Start specific service
docker compose up -d backend
```

### Logs

```bash
# All services logs
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f mongo
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100 backend
```

### Service Management

```bash
# View running services
docker compose ps

# View resource usage
docker stats

# Restart a service
docker compose restart backend

# Stop a service
docker compose stop backend

# Remove a service
docker compose rm -f backend
```

### Database Operations

```bash
# Access MongoDB shell
docker compose exec mongo mongosh -u webgenix_admin -p webgenix_secure_pass --authenticationDatabase admin webgenix

# Backup database
docker compose exec mongo mongodump --username=webgenix_admin --password=webgenix_secure_pass --authenticationDatabase=admin --out=/data/backup

# Restore database
docker compose exec mongo mongorestore --username=webgenix_admin --password=webgenix_secure_pass --authenticationDatabase=admin /data/backup

# View database size
docker compose exec mongo mongosh -u webgenix_admin -p webgenix_secure_pass --authenticationDatabase=admin --eval "db.stats()"
```

### Application Operations

```bash
# Seed departments
docker compose exec backend npm run seed

# Seed products
docker compose exec backend npm run seed:products

# Check backend health
docker compose exec backend wget -qO- http://localhost:5000/api/health

# View backend logs
docker compose exec backend cat /app/logs/*.log 2>/dev/null || docker compose logs backend
```

---

## Development Workflow

### Local Development with Docker

```bash
# 1. Start services
docker compose up -d

# 2. Make changes to code (backend/frontend)
# Docker will rebuild on next up --build

# 3. Rebuild after changes
docker compose up --build -d

# 4. Watch logs for errors
docker compose logs -f backend
```

### Without Docker (Local Dev)

```bash
# Backend
cd webgenix-backend
npm install
npm run dev

# Frontend (in new terminal)
cd webgenix-app
npm install
npm run dev
```

---

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Docker Compose (usually included)
sudo apt install docker-compose-plugin
```

### 2. Clone and Configure

```bash
# Clone repository
git clone <your-repo-url> webgenix
cd webgenix

# Create production .env
cp .env.docker .env
nano .env  # Update all values for production
```

### 3. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Generate certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
```

#### Option B: Manual SSL

```bash
# Place your SSL certificates in ssl/ directory
mkdir -p ssl
cp your-cert.pem ssl/fullchain.pem
cp your-key.pem ssl/privkey.pem
```

### 4. Update Nginx Config for HTTPS

Edit `nginx.conf` and uncomment the HTTPS server block:

```nginx
# In nginx.conf, uncomment the HTTPS server block
# and update server_name to your domain
```

### 5. Deploy

```bash
# Build and start in production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Seed initial data
docker compose exec backend npm run seed
docker compose exec backend npm run seed:products

# Verify deployment
docker compose ps
curl -f http://localhost/health
```

### 6. Verify

```bash
# Check all services are running
docker compose ps

# Check logs
docker compose logs -f

# Test API
curl http://localhost/api/health

# Test frontend
curl http://localhost/
```

---

## Environment Variables Reference

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | Backend | Yes | `development` or `production` |
| `MONGO_ROOT_USERNAME` | MongoDB | Yes | Database admin username |
| `MONGO_ROOT_PASSWORD` | MongoDB | Yes | Database admin password |
| `JWT_ACCESS_SECRET` | Backend | Yes | JWT access token secret (32+ chars) |
| `JWT_REFRESH_SECRET` | Backend | Yes | JWT refresh token secret (32+ chars) |
| `JWT_ACCESS_EXPIRY` | Backend | No | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRY` | Backend | No | Refresh token expiry (default: 7d) |
| `BCRYPT_ROUNDS` | Backend | No | Password hashing rounds (default: 12) |
| `CLIENT_URL` | Backend | Yes | Frontend URL for CORS |
| `VITE_API_URL` | Frontend | Yes | Backend API URL |
| `VITE_RAZORPAY_KEY_ID` | Frontend | Yes | Razorpay public key |
| `RAZORPAY_KEY_ID` | Backend | Yes | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Backend | Yes | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Yes | Razorpay webhook secret |
| `SMTP_HOST` | Backend | No | SMTP server host |
| `SMTP_PORT` | Backend | No | SMTP server port |
| `SMTP_USER` | Backend | No | SMTP username |
| `SMTP_PASS` | Backend | No | SMTP password |
| `EMAIL_FROM` | Backend | No | From email address |
| `COOKIE_SECURE` | Backend | No | Secure cookies (true for HTTPS) |

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
docker compose logs <service-name>

# Example
docker compose logs backend
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is healthy
docker compose ps mongo

# Check MongoDB logs
docker compose logs mongo

# Test connection from backend
docker compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :27017

# Stop the conflicting service or change port in docker-compose.yml
```

### Rebuild Issues

```bash
# Clear Docker cache and rebuild
docker compose build --no-cache

# Remove all containers and volumes
docker compose down -v
docker compose up --build -d
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
docker compose ps backend

# Check backend logs
docker compose logs backend

# Check nginx logs
docker compose logs nginx

# Restart nginx
docker compose restart nginx
```

### Database Reset

```bash
# WARNING: This will delete all data
docker compose down -v
docker compose up -d
docker compose exec backend npm run seed
docker compose exec backend npm run seed:products
```

---

## Monitoring

### Health Checks

```bash
# Check all services health
docker compose ps

# Individual health checks
curl http://localhost/health
curl http://localhost/api/health

# MongoDB health
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats webgenix-backend webgenix-mongo webgenix-nginx webgenix-frontend
```

### Log Rotation

Add to `docker-compose.yml` to prevent log files from growing too large:

```yaml
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate unique JWT secrets
- [ ] Enable `COOKIE_SECURE=true` for HTTPS
- [ ] Set up SSL/TLS certificates
- [ ] Restrict MongoDB port access (not exposed in prod)
- [ ] Use strong Razorpay webhook secret
- [ ] Enable rate limiting (already configured)
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Backup database regularly

---

## Backup and Restore

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "Starting backup..."

# Backup MongoDB
docker compose exec mongo mongodump \
  --username=webgenix_admin \
  --password=${MONGO_ROOT_PASSWORD} \
  --authenticationDatabase=admin \
  --out=/data/backup

docker cp webgenix-mongo:/data/backup $BACKUP_DIR/mongo

echo "Backup completed: $BACKUP_DIR"
```

Make executable:
```bash
chmod +x backup.sh
```

### Restore from Backup

```bash
# Restore MongoDB
docker cp ./backups/YYYYMMDD_HHMMSS/mongo webgenix-mongo:/data/restore
docker compose exec mongo mongorestore \
  --username=webgenix_admin \
  --password=${MONGO_ROOT_PASSWORD} \
  --authenticationDatabase=admin \
  /data/restore
```

---

## Scaling

### Horizontal Scaling

To scale backend instances:

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3
```

**Note**: Requires load balancer configuration and shared session storage (Redis).

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Docker
        uses: docker/setup-buildx-action@v2
      
      - name: Deploy
        env:
          MONGO_ROOT_PASSWORD: ${{ secrets.MONGO_ROOT_PASSWORD }}
          JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET }}
          JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}
          # ... other secrets
        run: |
          docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
          docker compose exec backend npm run seed
```

---

## Support

For issues or questions:

1. Check logs: `docker compose logs -f`
2. Verify health: `docker compose ps`
3. Check this guide's troubleshooting section
4. Review deployment plan: `documents/DEPLOYMENT_PLAN.md`
