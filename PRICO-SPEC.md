# PRICO SPEC

Build **Prico** — a cross-platform product-first app (web-first Next.js) that is:

* **Discord-level chat & communities** (channels, DMs, threads, mentions, slash commands, bots, webhooks, pinned/sticky messages, offline sync, pagination)
* **VSCode-level collaborative editor** (Monaco + Yjs CRDT — multi-language, cursors, realtime)
* **GitHub-level publishing** (projects with Git backing: forks, PRs, branches, diffs, merges)
* **User profiles** like GitHub + social features: display name, username, about, badges, public projects, publicly joined communities (toggleable)
* **Friends system** for DMs & social graph
* **Voice/Video + screen share** via WebRTC
* **Remote MongoDB** (Atlas) only — no local DBs for production
* **Clerk** for auth and user management
* **TailwindCSS + shadcn/ui** for UI components
* **Socket.IO** for realtime and WebRTC signaling
* **NodeGit** for server-side Git operations
* **Docker-based runner** for safe cloud code execution

## OVERALL ARCHITECTURE

* **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, Monaco Editor
* **Backend**: Node.js + Express, Socket.IO server, NodeGit service, Docker runner service
* **DB**: MongoDB Atlas (remote) — single cluster for all collections
* **Auth**: Clerk (client + server verification)
* **Realtime**: Socket.IO (rooms per channel, per community, per project doc)
* **Collab**: Yjs with `y-websocket` or custom Socket.IO provider for editor docs

## PROJECT STATUS

### ✅ Completed
1. **Monorepo structure**: Set up with `/web` (Next.js) and `/server` directories
2. **Next.js setup**: App Router, TypeScript, TailwindCSS, shadcn/ui components
3. **Environment template**: Created with all required variables
4. **Package.json**: Root workspace configuration with scripts

### 🔄 In Progress
2. **Next.js monorepo structure**: Basic setup complete, dependencies installed

### ⏳ TODO (Following Incremental Roadmap)
3. **Clerk authentication**: Integrate in Next.js, sync user to Mongo on first login
4. **MongoDB connection**: User model & indexes, TypeScript interfaces
5. **Communities system**: Create/list endpoints + basic UI
6. **Channels system**: Channel create + list and Channel model
7. **Socket.IO chat**: Real-time messaging with persistence
8. **Message pagination**: API & infinite scroll client
9. **DMs & Friends**: DM channel flow + friend system endpoints
10. **File uploads**: S3 integration + attach to messages

## DEVELOPMENT WORKFLOW

Each commit includes:
- Code (TypeScript)
- Minimal tests
- README entries
- API docs with examples
- Socket docs for realtime events
- Dev checklist and test instructions

## NEXT STEPS

1. Complete the monorepo setup
2. Integrate Clerk authentication
3. Set up MongoDB connection and User model
4. Implement communities and channels
5. Add real-time chat with Socket.IO