# Prico - Full-Stack Collaborative Coding Platform

Prico aims to merge the core experiences of Discord (communities, chat, voice/video), VS Code (collaborative real‑time coding + execution), and GitHub (projects, forks, pull requests, publishing) into a single cohesive developer collaboration hub.

## Features

- **User Accounts & Authentication**: Sign up, log in, verify email, and reset passwords using Clerk
- **Communities**: Create and join communities with text, voice, and video channels
- **Chat System**: Real-time messaging with WebSockets, including typing indicators, reactions, and file uploads
- **Voice & Video Chat**: Real-time communication using WebRTC
- **Projects**: Create, fork, and collaborate on coding projects
- **Collaborative Code Editor**: Real-time collaborative editing with Monaco Editor and Yjs
- **Code Execution**: Execute code in a secure Docker sandbox
- **Git Integration**: Pull requests, forks, and project publishing
- **Notifications**: Real-time notifications for friend requests, mentions, PR updates, and more

## Tech Stack

### Frontend
- Next.js
- React
- TailwindCSS
- Shadcn UI
- Monaco Editor
- Yjs/CRDT for collaborative editing
- WebRTC for voice/video
- WebSockets for real-time features

### Backend
- Node.js (TypeScript)
- Express (REST API)
- Socket.IO (real-time + signaling)
- MongoDB Atlas (Mongoose ODM)
- Clerk (authentication + session validation)
- Docker sandbox (isolated code execution)
- Yjs (CRDT) integration layer for collaborative editing
- WebRTC signaling via Socket.IO

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (workspace manager) `npm i -g pnpm`
- Docker (for sandbox & optional local Mongo)
- A MongoDB Atlas cluster (or local MongoDB)
- Clerk application (Frontend + Backend keys)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/prico.git
   cd prico
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Copy `.env.example` to `.env.local` in the frontend directory
   - Fill in the required values

3. Install dependencies (monorepo root):
   ```bash
   pnpm install
   ```

4. Environment variables:
   - Copy `apps/backend/.env.example` to `apps/backend/.env`
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env.local`
   - Fill in Clerk keys, Mongo URI, JWT secret, etc.

5. Development (runs backend + frontend concurrently):
   ```bash
   pnpm dev
   ```

6. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Socket.IO path: `/socket.io`

## Project Structure

```
prico/
├── package.json                # Workspace root (pnpm workspaces)
├── apps/
│   ├── backend/                # Express + Socket.IO (TypeScript)
│   │   ├── src/
│   │   │   ├── config/         # Env, logging, security
│   │   │   ├── db/             # Mongoose connection & models
│   │   │   ├── routes/         # REST endpoints
│   │   │   ├── sockets/        # Socket.IO namespaces & handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth, rate limit, errors
│   │   │   └── index.ts        # Bootstrap
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── frontend/               # Next.js (App Router) + Tailwind + Shadcn UI
│       ├── app/                # Routes
│       ├── components/
│       ├── lib/
│       ├── styles/
│       ├── package.json
│       └── tailwind.config.ts
├── packages/
│   └── shared/                 # Shared types, validation schemas
└── docker-compose.yml (planned)
```

## Development

### API Documentation

The API documentation is available at http://localhost:8000/docs when the backend is running.

### Realtime (Socket.IO Namespaces / Events)

Planned high-level organization (subject to iteration):

| Domain | Namespace | Example Events |
|--------|-----------|----------------|
| Chat | `/chat` | `message:new`, `message:edit`, `message:delete`, `typing` |
| Editor | `/editor` | `doc:init`, `doc:update`, `cursor:update`, `presence` |
| RTC | `/rtc` | `webrtc:offer`, `webrtc:answer`, `webrtc:candidate`, `webrtc:leave` |
| Notifications | `/notify` | `notification:new`, `notification:read` |
| Friends | `/social` | `friend:request`, `friend:accept`, `presence:update` |

All events pass through auth middleware validating Clerk session + internal JWT.

## Roadmap (Incremental Delivery)

1. Core scaffold (monorepo, backend health, frontend shell) ✅ (in progress)
2. Auth integration (Clerk + backend session handoff JWT)
### Auth & Session Handoff (Current Implementation Snapshot)

1. Frontend authenticates with Clerk (Next.js `@clerk/nextjs`).
2. Frontend posts to `POST /api/users/me` with Clerk session (Bearer automatically via Clerk middleware) including minimal profile (username, email, age, optional displayName).
3. Backend upserts user record and returns an `internalJwt` (short‑lived) used for Socket.IO connection: 
   ```js
   const socket = io('http://localhost:4000', { auth: { token: internalJwt } });
   socket.on('auth:ack', console.log);
   ```
4. Protected data retrieval via `GET /api/users/me`.

Endpoints (so far):
- `GET /api/health`
- `POST /api/users/me` (create/upsert + internal token)
- `GET /api/users/me`

3. Users & profiles CRUD + presence
4. Communities & channels (text first)
5. Realtime chat (Socket.IO) + persistence
6. Collaborative editor (Yjs + persistence) baseline
7. Projects model + file storage + basic CRUD
8. Code execution sandbox (Docker) MVP
9. Pull requests / forks / diff model
10. WebRTC voice/video signaling
11. Notifications system
12. Hardening (RBAC, rate limiting, audit logs)
13. Production Docker & Deployment scripts

## License

Planned: MIT (to be added).

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Yjs](https://yjs.dev/)
- [WebRTC](https://webrtc.org/)
- [Docker](https://www.docker.com/)