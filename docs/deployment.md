# Deployment Guide

## Environment Variables

Create `.env` file in the root directory with the following variables:

### Required Variables

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prico?retryWrites=true&w=majority

# Clerk Authentication
CLERK_FRONTEND_API=clerk_frontend_api_key
CLERK_SECRET_KEY=clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_publishable_key

# AWS S3 Configuration  
S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Application Secrets
JWT_SECRET=your_jwt_secret_here
SOCKET_SECRET=your_socket_secret_here

# External Services
DOCKER_RUNNER_URL=http://localhost:8080
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
```

### Optional Variables

```bash
# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# Performance
REDIS_CLUSTER_NODES=redis://node1:6379,redis://node2:6379
```

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd prico
   npm install
   ```

2. **Start services:**
   ```bash
   # Start Redis and MongoDB
   docker-compose up -d redis mongodb
   
   # Start development servers
   npm run dev
   ```

3. **Verify setup:**
   - Web app: http://localhost:3000
   - Socket server: http://localhost:3001
   - Redis: localhost:6379
   - MongoDB: localhost:27017

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:web
npm run test:server

# Run with coverage
npm run test:coverage
```

## Production Deployment

### Docker Deployment

1. **Build images:**
   ```bash
   docker build -t prico-web ./web
   docker build -t prico-socket ./server/socket-server
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Kubernetes Deployment

1. **Apply configurations:**
   ```bash
   kubectl apply -f infra/k8s/namespace.yaml
   kubectl apply -f infra/k8s/secrets.yaml
   kubectl apply -f infra/k8s/deployments.yaml
   kubectl apply -f infra/k8s/services.yaml
   kubectl apply -f infra/k8s/ingress.yaml
   ```

2. **Verify deployment:**
   ```bash
   kubectl get pods -n prico
   kubectl get services -n prico
   ```

### Vercel Deployment (Web Only)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd web
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

### AWS Deployment

#### ECS with Fargate

1. **Build and push images:**
   ```bash
   # Build and tag
   docker build -t prico-web ./web
   docker tag prico-web:latest <account>.dkr.ecr.<region>.amazonaws.com/prico-web:latest
   
   # Push to ECR
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker push <account>.dkr.ecr.<region>.amazonaws.com/prico-web:latest
   ```

2. **Deploy using Terraform:**
   ```bash
   cd infra/terraform
   terraform init
   terraform plan
   terraform apply
   ```

## Database Setup

### MongoDB Atlas

1. **Create cluster:**
   - Go to MongoDB Atlas dashboard
   - Create new cluster
   - Configure security (IP whitelist, user credentials)

2. **Get connection string:**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prico?retryWrites=true&w=majority
   ```

3. **Create indexes:**
   ```bash
   cd scripts
   node create-indexes.js
   ```

## Monitoring & Logging

### Sentry Setup

1. **Create Sentry project**
2. **Add DSN to environment variables**
3. **Verify error tracking:**
   ```bash
   curl -X POST http://localhost:3000/api/test-error
   ```

### Logs

- **Development**: Console output
- **Production**: JSON format to stdout (compatible with CloudWatch, etc.)

## Scaling Considerations

### Socket.IO Scaling

```bash
# Redis adapter for multiple Socket.IO instances
REDIS_URL=redis://cluster-endpoint:6379
```

### Database Scaling

- Use MongoDB Atlas auto-scaling
- Implement read replicas for heavy read workloads
- Consider sharding for very large datasets

### CDN Setup

Configure S3 + CloudFront for static assets:

```bash
# Upload build assets
aws s3 sync ./web/.next/static s3://your-bucket/static --cache-control max-age=31536000
```

## Security Checklist

- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Security headers set (Helmet.js)
- [ ] Dependencies updated (npm audit)
- [ ] Secrets rotation policy

## Backup Strategy

### Database Backups

```bash
# MongoDB Atlas automatic backups enabled
# Custom backup script for additional safety
node scripts/backup-db.js
```

### Code Repository Backups

```bash
# Git repositories stored in S3
aws s3 sync /data/repos s3://backup-bucket/repos --delete
```

## Troubleshooting

### Common Issues

1. **Socket.IO connection fails:**
   ```bash
   # Check CORS configuration
   # Verify auth token
   # Check network/firewall
   ```

2. **MongoDB connection timeout:**
   ```bash
   # Verify connection string
   # Check IP whitelist
   # Test network connectivity
   ```

3. **High memory usage:**
   ```bash
   # Monitor with htop
   # Check for memory leaks
   # Scale horizontally
   ```

### Debug Commands

```bash
# Check service health
curl http://localhost:3000/api/health
curl http://localhost:3001/health

# View logs
docker logs prico-web
docker logs prico-socket

# Monitor resources
docker stats
```

## CI/CD Pipeline

GitHub Actions workflow automatically:

1. **On PR:**
   - Runs linting
   - Type checking
   - Unit tests
   - Integration tests

2. **On merge to main:**
   - Builds Docker images
   - Pushes to registry
   - Deploys to staging
   - Runs E2E tests
   - Deploys to production (if staging passes)

### Manual Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```