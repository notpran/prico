# Prico

A full-stack collaborative coding platform with real-time chat, community management, project collaboration, and GitHub integration.

**Discord-level chat + VSCode-level collaborative editor + GitHub-level publishing**

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd prico
npm install

# Start development services
docker-compose up -d redis mongodb
npm run dev
```

- **Web app**: http://localhost:3000
- **Socket server**: http://localhost:3001
- **API docs**: [docs/api.md](docs/api.md)
- **Socket events**: [docs/socket.md](docs/socket.md)

## 🏗️ Architecture

### Frontend: Next.js App Router
- **Framework**: Next.js 15 with React 18, TypeScript
- **Styling**: TailwindCSS + shadcn/ui components  
- **Editor**: Monaco Editor with Yjs CRDT
- **Auth**: Clerk integration
- **Real-time**: Socket.IO client

### Backend: Microservices
- **Socket Server**: Express + Socket.IO for real-time communication
- **Git Service**: NodeGit for repository operations
- **Runner Service**: Docker-based code execution
- **Upload Service**: S3 file management

### Database & Storage
- **Database**: MongoDB Atlas (remote clusters)
- **Cache**: Redis for Socket.IO adapter and job queues
- **Storage**: S3-compatible for attachments and repos
- **Real-time**: Yjs WebSocket provider for collaborative editing

## 🎯 Features

### 💬 Discord-Level Chat
- **Communities & Channels**: Public/private with role permissions
- **Real-time Messaging**: Typing indicators, reactions, threads, mentions
- **Direct Messages**: Friend system with private conversations
- **Voice & Video**: WebRTC calls with screen sharing
- **File Attachments**: S3 upload with inline previews

### 👨‍💻 VSCode-Level Editor  
- **Collaborative Editing**: Monaco + Yjs CRDT with live cursors
- **Multi-language Support**: Syntax highlighting, IntelliSense
- **Git Integration**: Auto-commit on save, branch management
- **Live Preview**: Instant code execution and output

### 📂 GitHub-Level Publishing
- **Project Management**: Public/private repositories with Git backing
- **Fork & PR Workflow**: Branch management, merge conflict resolution
- **Code Review**: Inline comments, approval workflow
- **Release Management**: Semantic versioning, change logs

### 👤 User Profiles & Social
- **GitHub-style Profiles**: Display name, bio, badges, public projects
- **Achievement System**: Automated badges for contributions
- **Friends & Following**: Social connections and activity feeds
- **Privacy Controls**: Toggleable visibility for projects and communities

## 📋 Development Status

### ✅ Completed (Commit 1)
- [x] **Monorepo Structure**: `/web` (Next.js) + `/server` microservices
- [x] **Next.js Setup**: App Router, TypeScript, TailwindCSS, shadcn/ui
- [x] **Environment Template**: All required variables documented
- [x] **Documentation**: API, Socket events, deployment guides
- [x] **Docker Compose**: Redis + MongoDB for local development

### 🔄 In Progress  
- [ ] **Clerk Authentication**: Sign-up/login pages + MongoDB user sync

### ⏳ Next Steps (Incremental Roadmap)
1. **Auth Integration**: Clerk → MongoDB user sync
2. **Database Models**: User, Community, Channel, Message schemas
3. **Communities API**: Create/list/join endpoints + basic UI
4. **Real-time Chat**: Socket.IO messaging with persistence 
5. **File Uploads**: S3 integration for attachments
6. **Collaborative Editor**: Monaco + Yjs integration
7. **Git Operations**: NodeGit service for repositories
8. **Code Execution**: Docker runner with safe sandboxing
9. **Voice/Video**: WebRTC signaling via Socket.IO
10. **Testing & CI**: Jest tests + GitHub Actions pipeline

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 15 + React 18 | App Router, SSR, TypeScript |
| **Styling** | TailwindCSS + shadcn/ui | Component system, responsive design |
| **Auth** | Clerk | User management, session handling |
| **Database** | MongoDB Atlas | Document storage, indexes |
| **Cache** | Redis | Socket.IO adapter, job queues |
| **Real-time** | Socket.IO | Chat, presence, WebRTC signaling |
| **Editor** | Monaco + Yjs | Collaborative editing with CRDT |
| **Git** | NodeGit | Server-side repository operations |
| **Execution** | Docker | Safe code sandboxing |
| **Storage** | S3 Compatible | File uploads, repository artifacts |
| **Monitoring** | Sentry | Error tracking and performance |

## 📁 Project Structure

```
/workspaces/prico/
├── web/                    # Next.js frontend application
│   ├── app/               # App Router pages
│   │   ├── (auth)/        # Authentication pages
│   │   ├── communities/   # Community management
│   │   ├── projects/      # Project pages
│   │   ├── profile/       # User profiles
│   │   └── editor/        # Collaborative editor
│   ├── components/        # Reusable UI components
│   ├── lib/              # Client-side utilities
│   │   ├── api/          # REST API wrappers
│   │   ├── auth/         # Clerk integration
│   │   ├── socket/       # Socket.IO client
│   │   └── editor/       # Monaco + Yjs adapters
│   └── package.json
├── server/                # Backend microservices
│   ├── socket-server/     # Socket.IO + Express server
│   ├── git-service/       # NodeGit worker service
│   ├── runner/           # Docker code execution
│   └── uploads/          # File upload service
├── docs/                 # API and deployment documentation
├── infra/                # Terraform, Kubernetes manifests
├── scripts/              # Database setup, utilities
├── docker-compose.yml    # Local development services
└── package.json          # Monorepo workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose
- **Git** for version control

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Configure required services:**
   - **MongoDB Atlas**: Create cluster and get connection string
   - **Clerk**: Create application and get API keys
   - **S3 Compatible Storage**: Configure bucket and credentials

3. **Install dependencies:**
   ```bash
   npm install
   ```

### Development Workflow

1. **Start infrastructure services:**
   ```bash
   docker-compose up -d redis mongodb
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   # Starts both web (3000) and socket server (3001)
   ```

3. **Access applications:**
   - **Web App**: http://localhost:3000
   - **Socket Server**: http://localhost:3001
   - **Redis**: localhost:6379
   - **MongoDB**: localhost:27017

### Testing

```bash
# Run all tests
npm test

# Run specific test suites  
npm run test:web      # Frontend tests
npm run test:server   # Backend tests

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📖 Documentation

- **[API Reference](docs/api.md)**: REST endpoints with examples
- **[Socket Events](docs/socket.md)**: Real-time event documentation  
- **[Deployment Guide](docs/deployment.md)**: Production setup instructions
- **[Architecture Spec](PRICO-SPEC.md)**: Complete technical specification

## 🔐 Security

- **Authentication**: Clerk-managed with server-side verification
- **Rate Limiting**: 5 messages/sec, 100 API calls/min per user
- **Input Sanitization**: XSS protection for markdown content
- **Container Security**: Unprivileged Docker execution
- **Path Validation**: Git operations with sanitized paths

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow TypeScript + ESLint conventions
4. **Add tests**: Unit tests for new functionality
5. **Submit PR**: Include description and test instructions

### Commit Message Format

Follow the incremental roadmap with meaningful commits:

```
feat(auth): integrate Clerk with MongoDB user sync
feat(chat): add real-time messaging with Socket.IO  
feat(editor): implement Monaco + Yjs collaborative editing
feat(git): add NodeGit service for repository operations
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- [x] Monorepo setup and documentation
- [ ] Clerk authentication integration
- [ ] MongoDB models and connection
- [ ] Basic communities and channels

### Phase 2: Real-time Features  
- [ ] Socket.IO chat system
- [ ] File upload and attachments
- [ ] Typing indicators and presence
- [ ] Voice/video calling

### Phase 3: Collaborative Features
- [ ] Monaco editor integration
- [ ] Yjs collaborative editing
- [ ] Git repository management
- [ ] Fork and pull request workflow

### Phase 4: Advanced Features
- [ ] Docker code execution
- [ ] Achievement and badge system
- [ ] Advanced search and discovery
- [ ] Mobile responsive design

### Phase 5: Scale & Polish
- [ ] Performance optimization
- [ ] Advanced monitoring
- [ ] Mobile app (React Native)
- [ ] Enterprise features

---

**Built with ❤️ using Next.js, Socket.IO, and MongoDB**
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
