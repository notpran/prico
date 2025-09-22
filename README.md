# Prico# Prico



A full-stack collaborative coding platform with real-time chat, community management, project collaboration, and GitHub integration.A full-stack collaborative coding platform with real-time chat, community management, project collaboration, and GitHub integration.



## Technology Stack## Technology Stack



- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS, shadcn/ui- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS, shadcn/ui

- **Backend**: Node.js with Express.js, Socket.IO for real-time communication, NodeGit for Git operations- **Backend**: Node.js with Express.js, Socket.IO for real-time communication, NodeGit for Git operations

- **Database**: MongoDB Atlas- **Database**: MongoDB Atlas

- **Authentication**: Clerk for user management- **Authentication**: Clerk for user management

- **Realtime**: Socket.IO, Yjs for collaborative editing- **Realtime**: Socket.IO, Yjs for collaborative editing

- **Execution**: Docker-based code runner- **Execution**: Docker-based code runner

- **UI Components**: shadcn/ui with Tailwind CSS- **UI Components**: shadcn/ui with Tailwind CSS



## Features## Features



- **Real-time Chat**: Community channels with typing indicators, reactions, threads, mentions- **Real-time Chat**: Community channels with typing indicators, reactions, threads, mentions

- **Community Management**: Create and join communities with role-based permissions- **Community Management**: Create and join communities with role-based permissions

- **Project Collaboration**: Manage projects with Git backing, forks, PRs, diffs, merges- **Project Collaboration**: Manage projects with Git backing, forks, PRs, diffs, merges

- **Collaborative Editor**: Monaco Editor with Yjs CRDT for real-time multi-user editing- **Collaborative Editor**: Monaco Editor with Yjs CRDT for real-time multi-user editing

- **Friend System**: Send friend requests and manage social connections- **Friend System**: Send friend requests and manage social connections

- **Voice/Video**: WebRTC calls with screen sharing- **Voice/Video**: WebRTC calls with screen sharing

- **Code Execution**: Safe cloud code execution via Docker- **Code Execution**: Safe cloud code execution via Docker

- **User Profiles**: GitHub-like profiles with badges, public projects, communities- **User Profiles**: GitHub-like profiles with badges, public projects, communities



## Project Structure## Project Structure



This is a monorepo using npm workspaces.This is a monorepo using npm workspaces.



``````

/repo-root/repo-root

  /web                  # Next.js app (App Router)  /web                  # Next.js app (App Router)

  /server               # Standalone backend microservices  /server               # Standalone backend microservices

    /socket-server      # Socket.IO server    /socket-server      # Socket.IO server

    /git-service        # NodeGit worker    /git-service        # NodeGit worker

    /runner             # Docker code runner    /runner             # Docker code runner

    /uploads            # File upload service    /uploads            # File upload service

  /infra                # Infrastructure configs  /infra                # Infrastructure configs

  /scripts              # Utility scripts  /scripts              # Utility scripts

  package.json          # Root package.json with workspaces  package.json          # Root package.json with workspaces

  docker-compose.yml    # Dev environment  docker-compose.yml    # Dev environment

  .env.example          # Environment variables template  .env.example          # Environment variables template

  PRICO-SPEC.md         # Detailed specification  PRICO-SPEC.md         # Detailed specification

``````



## Quick Start

> 📖 **Detailed Setup Guide**: See [SETUP.md](./SETUP.md) for comprehensive installation and running instructions.

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Setup
```bash
git clone <repository-url>
cd prico
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Visit http://localhost:3000 to get started!



## Development## Development



- `npm run dev` - Start all services in development mode- `npm run dev` - Start all services in development mode

- `npm run build` - Build all workspaces- `npm run build` - Build all workspaces

- `npm run test` - Run tests across workspaces- `npm run test` - Run tests across workspaces



## Deployment## Deployment



See `/docs/deployment.md` for detailed deployment instructions.See `/docs/deployment.md` for detailed deployment instructions.



## Contributing## Contributing



See `PRICO-SPEC.md` for the full specification and development roadmap.See `PRICO-SPEC.md` for the full specification and development roadmap.
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   └── package.json
├── backend/                # Express.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Database and config
│   └── server.js          # Main server file
├── .env                    # Environment variables (shared)
└── package.json           # Root package.json with scripts
```

## API Documentation

The backend provides RESTful APIs for:

- **Authentication**: User registration and JWT token management
- **Users**: Profile management and user search
- **Communities**: Community creation, membership, and channel management
- **Projects**: Project collaboration with GitHub integration
- **Friends**: Social features and relationship management
- **Messages**: Real-time messaging with WebSocket support

See `backend/README.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

4. The React app will be available at:
   - http://localhost:5173

## Features

- **User Authentication**: JWT-based authentication
- **Chat Systems**: Real-time messaging using Socket.IO (to be implemented)
- **Project Management**: (to be implemented)
- **File Management**: (to be implemented)
- **Pull Requests**: (to be implemented)

## Security

Prico implements several security measures:

- **Rate Limiting**: API endpoints are protected with configurable rate limits
- **Input Validation**: All user inputs are validated and sanitized
- **Authentication**: Clerk-based authentication with middleware protection
- **Security Headers**: Helmet.js for security headers (CSP, HSTS, etc.)
- **CORS**: Configured CORS policies for cross-origin requests
- **Audit Logging**: All critical actions are logged for compliance
- **API Keys**: Optional API key authentication for service-to-service calls

### Environment Variables

```bash
# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
API_KEY=your_api_key_here
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_RETENTION_DAYS=30
```

### Health Checks

- `/api/health` - Basic health check endpoint
- `/api/metrics` - System metrics and statistics

## Deployment

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment variables:**
   Copy `.env.example` to `.env` and configure your production values.

### CI/CD

The project includes GitHub Actions workflows for:
- **CI**: Automated testing, linting, and security scanning
- **CD**: Automated deployment to production on main branch pushes

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Monitor health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## Enterprise Features

Prico supports enterprise-grade features for compliance and security:

### SSO Integration
- **Clerk**: Default authentication provider
- **Auth0**: Enterprise SSO support
- **Okta**: SAML-based authentication
- **Custom**: Extensible provider system

### Compliance
- **GDPR**: Data portability and right to be forgotten
- **HIPAA**: Healthcare data protection
- **SOC 2**: Security, availability, and confidentiality
- **Data Retention**: Configurable retention policies
- **Encryption**: At-rest and in-transit encryption

### RBAC (Role-Based Access Control)
- **User Roles**: User, Moderator, Admin, Owner
- **Permissions**: Granular permission system
- **Audit Logs**: Comprehensive activity logging

### Enterprise Configuration

```bash
# SSO
SSO_ENABLED=true
SSO_PROVIDER=auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Compliance
GDPR_ENABLED=true
HIPAA_ENABLED=false
SOC2_ENABLED=true
ENCRYPTION_AT_REST=true
```

### API Endpoints

- `POST /api/compliance` - GDPR compliance operations (data export/deletion)
