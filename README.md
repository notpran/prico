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



## Quick Start## Quick Start



### Prerequisites### Prerequisites



- Node.js 18+- Node.js 18+

- Docker & Docker Compose- Docker & Docker Compose

- MongoDB Atlas account (or local Mongo)- MongoDB Atlas account (or local Mongo)

- Clerk account for auth- Clerk account for auth



### Setup### Setup



1. **Clone and install dependencies:**1. **Clone and install dependencies:**

   ```bash   ```bash

   git clone <repository-url>   git clone <repository-url>

   cd prico   cd prico

   npm install   npm install

   ```   ```



2. **Start development environment:**2. **Start development environment:**

   ```bash   ```bash

   docker-compose up -d  # Starts MongoDB and Redis   docker-compose up -d  # Starts MongoDB and Redis

   npm run dev           # Starts all services   npm run dev           # Starts all services

   ```   ```



3. **Configure environment variables:**3. **Configure environment variables:**

   Copy `.env.example` to `.env` and fill in your values:   Copy `.env.example` to `.env` and fill in your values:

   ```env   ```env

   MONGODB_URI=mongodb+srv://...   MONGODB_URI=mongodb+srv://...

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

   CLERK_SECRET_KEY=...   CLERK_SECRET_KEY=...

   # etc.   # etc.

   ```   ```



4. **Open in browser:**4. **Open in browser:**

   - Frontend: http://localhost:3000   - Frontend: http://localhost:3000

   - Socket server: http://localhost:3001 (if separate)   - Socket server: http://localhost:3001 (if separate)



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
