# 🚀 Prico Setup & Run Guide

This guide will help you get Prico up and running on your local machine for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Docker & Docker Compose** - [Install Docker](https://docs.docker.com/get-docker/)
- **Git** - [Install Git](https://git-scm.com/downloads)

### Optional (for full functionality)
- **MongoDB Atlas account** - [Sign up at mongodb.com](https://www.mongodb.com/atlas)
- **Clerk account** - [Sign up at clerk.com](https://clerk.com/)
- **AWS S3 account** - [Sign up at aws.amazon.com](https://aws.amazon.com/)

## 🛠️ Quick Start (Development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd prico
```

### 2. Install Dependencies
```bash
# Install all workspace dependencies
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration (see Configuration section below)
nano .env
```

### 4. Start Development Environment
```bash
# Start all services (MongoDB, Redis, etc.)
npm run dev
```

### 6. Verify Setup
```bash
# Run the verification script
./verify-setup.sh
```

This script will check:
- Node.js and Docker installation
- Environment configuration
- Dependencies installation
- Service availability
- API endpoints responsiveness

## ⚙️ Detailed Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables. **Required** variables must be filled for basic functionality.

#### 🔴 **Required - Database & Cache**
```bash
# MongoDB Connection String
# For local development: mongodb://admin:password@localhost:27017/prico
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/prico
MONGODB_URI=mongodb://admin:password@localhost:27017/prico

# Redis Connection (for caching, sessions, queues)
REDIS_URL=redis://localhost:6379
```

#### 🔴 **Required - Authentication (Clerk)**
```bash
# Get these from https://clerk.com (create account → project → API keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
```

#### 🟡 **Optional - File Storage (AWS S3)**
```bash
# Required for file uploads. Get from AWS Console → S3 → Create bucket
S3_BUCKET_URL=https://your-bucket-name.s3.amazonaws.com
S3_ACCESS_KEY=your_aws_access_key_id
S3_SECRET_KEY=your_aws_secret_access_key
```

#### 🟡 **Optional - Real-time Services**
```bash
# Usually don't need to change these for local development
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_Y_WEBSOCKET_URL=ws://localhost:1234
```

#### 🟡 **Optional - Security & API**
```bash
# Generate a random string for API authentication
API_KEY=your_random_api_key_here

# Generate a random string for session encryption
SESSION_SECRET=your_random_session_secret

# Generate a random string for data encryption
ENCRYPTION_KEY=your_random_encryption_key

# Allowed origins for CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### 🟡 **Optional - Logging & Monitoring**
```bash
# Log level: error, warn, info, debug
LOG_LEVEL=info

# Health check interval in milliseconds
HEALTH_CHECK_INTERVAL=30000

# How long to keep metrics data (days)
METRICS_RETENTION_DAYS=30
```

#### 🟡 **Optional - Enterprise Features**
```bash
# Enable enterprise features
SSO_ENABLED=false
GDPR_ENABLED=false
HIPAA_ENABLED=false
SOC2_ENABLED=false

# SSO Configuration (if SSO_ENABLED=true)
SSO_PROVIDER=clerk  # clerk, auth0, okta
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Data retention policies (days)
MESSAGE_RETENTION_DAYS=365
AUDIT_RETENTION_DAYS=2555
USER_DATA_RETENTION_DAYS=2555

# Encryption at rest (requires additional setup)
ENCRYPTION_AT_REST=false
```

#### 🟡 **Optional - Scaling & Clustering**
```bash
# Redis clustering (for production scaling)
REDIS_CLUSTER=false
REDIS_CLUSTER_NODES=[]
REDIS_SENTINELS=[]
REDIS_MASTER_NAME=mymaster
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Monitoring (for production)
PROMETHEUS_ENABLED=false
GRAFANA_PASSWORD=admin
```

### Quick Setup Examples

#### **Minimal Setup** (Just for testing)
```bash
MONGODB_URI=mongodb://admin:password@localhost:27017/prico
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### **Full Development Setup**
```bash
MONGODB_URI=mongodb://admin:password@localhost:27017/prico
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
S3_BUCKET_URL=https://my-prico-bucket.s3.amazonaws.com
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=your_secret_key
API_KEY=super_secret_api_key_123
SESSION_SECRET=another_secret_456
ENCRYPTION_KEY=encryption_key_789
LOG_LEVEL=debug
```

### Getting API Keys

#### **Clerk (Required)**
1. Go to [clerk.com](https://clerk.com)
2. Sign up/Sign in
3. Create a new application
4. Go to API Keys section
5. Copy `Publishable key` and `Secret key`

#### **AWS S3 (Optional)**
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Sign in to AWS Console
3. Go to S3 service
4. Create a new bucket (make it public for uploads)
5. Go to IAM → Users → Create user
6. Attach `AmazonS3FullAccess` policy
7. Copy Access Key ID and Secret Access Key

#### **MongoDB Atlas (Alternative to local)**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create account → Create cluster
3. Go to Network Access → Add IP (0.0.0.0/0 for development)
4. Go to Database Access → Create user
5. Go to Clusters → Connect → Connect your application
6. Copy the connection string

### Environment File Template

```bash
# Copy this to .env and fill in your values

# REQUIRED - Database
MONGODB_URI=mongodb://admin:password@localhost:27017/prico
REDIS_URL=redis://localhost:6379

# REQUIRED - Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# OPTIONAL - File uploads
S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# OPTIONAL - Security
API_KEY=your_api_key_here
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key

# OPTIONAL - Everything else can stay as defaults
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_Y_WEBSOCKET_URL=ws://localhost:1234
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=30000
METRICS_RETENTION_DAYS=30
```
```bash
SSO_ENABLED=false
GDPR_ENABLED=false
LOG_LEVEL=info
```

## 🏃‍♂️ Running Individual Services

### Development Mode (All Services)
```bash
npm run dev
```
This starts:
- Next.js frontend (port 3000)
- Socket.IO server (port 3001)
- Y-WebSocket server (port 1234)
- Git service (port 3002)
- Code runner (port 3003)

### Production Mode
```bash
# Build all services
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Individual Services

#### Frontend Only
```bash
npm run dev:web
```

#### Socket Server Only
```bash
npm run dev:socket
```

#### With External Services
```bash
# Start MongoDB and Redis
docker-compose up -d

# Then start the app
npm run dev
```

## 🐳 Docker Development

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Custom Docker Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build web
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker-compose logs mongo

# Reset MongoDB
docker-compose down
docker volume rm prico_mongo-data
docker-compose up -d mongo
```

#### Redis Connection Issues
```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Reset Redis
docker-compose down
docker volume rm prico_redis-data
docker-compose up -d redis
```

#### Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Service Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health

# Check metrics
curl http://localhost:3000/api/metrics

# Check database connection
curl http://localhost:3000/api/health
```

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Tests
```bash
# Frontend tests
npm run test --workspace=web

# Backend tests
npm run test --workspace=server/socket-server
```

### Manual Testing

1. **Authentication**: Sign up/login at http://localhost:3000
2. **Communities**: Create a community and channel
3. **Chat**: Send messages in channels
4. **Files**: Upload files to messages
5. **Editor**: Open http://localhost:3000/editor for collaborative editing
6. **Projects**: Create a project at http://localhost:3000/projects

## 📊 Monitoring & Logs

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web

# Follow logs
docker-compose logs -f --tail=100
```

### Application Logs
- Logs are written to `logs/` directory in production
- Console logs in development mode
- Audit logs available at `/api/logs`

### Health Monitoring
- Health endpoint: `/api/health`
- Metrics endpoint: `/api/metrics`
- Dashboard: `/api/dashboard`

## 🚀 Deployment

### Production Deployment

1. **Configure production environment**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy (nginx)**
   ```bash
   # Copy nginx config
   cp infra/nginx.conf /etc/nginx/sites-available/prico
   ln -s /etc/nginx/sites-available/prico /etc/nginx/sites-enabled/
   systemctl reload nginx
   ```

### Scaling

For high-traffic deployments:

```bash
# Scale web services
docker-compose up -d --scale web=3

# Use scaling compose file
docker-compose -f docker-compose.scale.yml up -d
```

## 🔐 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Configure backup strategies
- [ ] Review environment variables
- [ ] Enable audit logging

## 📞 Support

### Getting Help

1. **Check the logs**: `docker-compose logs`
2. **Health checks**: Visit `/api/health`
3. **Common issues**: See Troubleshooting section
4. **Documentation**: Check `/docs/` directory

### Useful Commands

```bash
# View all running containers
docker ps

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a

# View disk usage
docker system df
```

## 🎯 Next Steps

After setup, explore:

- **Create communities** and invite friends
- **Set up projects** with Git integration
- **Try collaborative editing** in the Monaco editor
- **Run code** in the integrated runner
- **Configure voice/video** calls

## 📋 Quick Reference

### Essential Commands

```bash
# Start development
npm run dev

# Start only frontend
npm run dev:web

# Start Docker services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset database
docker-compose down
docker volume rm prico_mongo-data prico_redis-data
docker-compose up -d
```

### Useful Scripts

```bash
# Verify setup
./verify-setup.sh

# Run tests
npm run test

# Build for production
npm run build

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Socket.IO | 3001 | http://localhost:3001 |
| Y-WebSocket | 1234 | ws://localhost:1234 |
| Git Service | 3002 | http://localhost:3002 |
| Code Runner | 3003 | http://localhost:3003 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |</content>
<parameter name="filePath">/workspaces/prico/SETUP.md