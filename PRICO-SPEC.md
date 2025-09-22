# MASTER COPILOT PROMPT — PRICO (Absolute Ultra-Detailed Spec)

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
* Modular, testable, TypeScript-first codebase with a clear incremental delivery plan

---

## OVERALL ARCHITECTURE (concise)

* **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, Monaco Editor
* **Backend**: Node.js + Express (or Next.js API routes), Socket.IO server, NodeGit service, Docker runner service
* **DB**: MongoDB Atlas (remote) — single cluster for all collections
* **Auth**: Clerk (client + server verification)
* **Realtime**: Socket.IO (rooms per channel, per community, per project doc)
* **Collab**: Yjs with `y-websocket` or custom Socket.IO provider for editor docs
* **Storage**: S3-compatible (attachments, repo artifacts) — store metadata in Mongo
* **CI/CD**: GitHub Actions (lint, typecheck, unit tests, integration tests), Docker build & deploy
* **Monitoring**: Sentry for errors, Prometheus/Grafana or hosted alternatives for metrics, Log aggregation (LogDNA / Datadog)
* **Scaling**: Redis adapter for Socket.IO, job queue (BullMQ) for heavy tasks (NodeGit ops, runner)

---

## NEXT.JS PROJECT LAYOUT (recommended)

```
/repo-root
  /web                  # Next.js app (App Router)
    /app
      /(auth)
      /communities
      /projects
      /profile
      /editor
    /components
    /lib
      api/
      auth/
      socket/
      editor/
  /server               # standalone backend microservices
    /socket-server      # Socket.IO + auth middleware
    /git-service        # NodeGit worker service
    /runner             # Docker runner queue + worker
    /uploads            # file upload helper or proxy
  /infra                # Terraform / Kubernetes manifests / docker-compose for dev
  /scripts
  package.json
  docker-compose.yml
```

---

## ENVIRONMENT & SECRETS (essential .env vars)

```
MONGODB_URI=<mongodb+srv://...>
CLERK_SECRET_KEY=<clerk_secret_key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable>
S3_BUCKET_URL=<s3_base_url>
S3_ACCESS_KEY=<...>
S3_SECRET_KEY=<...>
JWT_SECRET=<app_jwt_secret>         # optional for internal tokens
SOCKET_SECRET=<socket_secret>
DOCKER_RUNNER_URL=<runner_service_url>
REDIS_URL=<redis://...>
NODE_ENV=production
```

---

# DATABASE SCHEMA (Mongo — collection schemas + indexes)

Use TypeScript interfaces as canonical models and create indexes for queries.

### Users

```ts
User {
  _id: ObjectId;
  clerkId: string;            // Clerk user id
  username: string;          // unique
  displayName: string;
  email: string;
  about?: string;
  badges: string[];          // e.g., ['first-publish', 'top-contributor']
  avatarUrl?: string;
  age?: number;
  createdAt: Date;
  lastActiveAt?: Date;
  friends: ObjectId[];       // user _id list
  friendRequestsSent: ObjectId[];     // optional
  friendRequestsReceived: ObjectId[]; // optional
  communityIds: ObjectId[];  // communities user joined
  projectIds: ObjectId[];    // projects owned
  settings: {
    showPublicCommunities: boolean; // togglable on profile
    notifications: { email: boolean; push: boolean; }
  }
}
Indexes: { username: 1 } unique, { clerkId: 1 } unique
```

### Communities

```ts
Community {
  _id: ObjectId;
  name: string;
  slug: string; // unique or scoped
  description?: string;
  iconUrl?: string;
  ownerId: ObjectId;
  adminIds: ObjectId[];
  memberIds: ObjectId[];
  privacy: 'public'|'private'|'invite';
  createdAt: Date;
  channels: ObjectId[]; // channel ids
}
Indexes: { slug: 1 } unique
```

### Channels

```ts
Channel {
  _id: ObjectId;
  communityId?: ObjectId; // null for DMs
  name: string; // 'general' etc
  type: 'text'|'voice'|'thread'|'dm';
  participantIds?: ObjectId[]; // for DMs or group DMs
  slowModeSeconds?: number;
  pinnedMessageIds: ObjectId[];
  createdAt: Date;
}
Indexes: { communityId: 1, type: 1 }
```

### Messages

```ts
Message {
  _id: ObjectId;
  channelId: ObjectId;
  communityId?: ObjectId;    // optional for DMs
  authorId: ObjectId;
  content: string;           // markdown raw
  renderedHtml?: string;     // sanitized HTML for quick render
  attachments?: ObjectId[];  // Attachment ids
  mentions?: ObjectId[];     // user ids
  reactions?: { [emoji: string]: ObjectId[] };
  threadParent?: ObjectId;   // link to parent message for threads
  pinned?: boolean;
  editedAt?: Date;
  deletedAt?: Date | null;
  ephemeralUntil?: Date | null;
  createdAt: Date;
}
Indexes: { channelId: 1, createdAt: -1 } // for pagination
```

### Attachments

```ts
Attachment {
  _id: ObjectId;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploaderId: ObjectId;
  projectId?: ObjectId; // optional
  createdAt: Date;
}
```

### Projects

```ts
Project {
  _id: ObjectId;
  name: string;
  slug: string;            // <owner>/<name> or unique
  description?: string;
  ownerId: ObjectId;
  visibility: 'public'|'private';
  repoPath: string;       // server path / s3 pointer to bare repo
  defaultBranch: string;  // e.g., 'main'
  forkedFrom?: ObjectId;  // project _id if fork
  stars: ObjectId[];      // user ids
  collaborators: ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}
Indexes: { ownerId: 1, name: 1 } unique composite per owner
```

### Commits (optional)

```ts
Commit {
  _id: ObjectId;
  projectId: ObjectId;
  commitHash: string;
  message: string;
  authorId: ObjectId;
  createdAt: Date;
}
```

### PullRequests

```ts
PullRequest {
  _id: ObjectId;
  projectId: ObjectId;
  sourceRepoId: ObjectId;
  sourceBranch: string;
  targetRepoId: ObjectId;
  targetBranch: string;
  authorId: ObjectId;
  title: string;
  description?: string;
  status: 'open'|'merged'|'closed'|'conflict';
  reviewers: ObjectId[];
  comments: { authorId: ObjectId, body: string, createdAt: Date }[];
  createdAt: Date;
  mergedAt?: Date;
}
```

### Runs (code execution)

```ts
Run {
  _id: ObjectId;
  userId: ObjectId;
  projectId?: ObjectId;
  code: string; 
  language: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  status: 'queued'|'running'|'finished'|'error';
  createdAt: Date;
  finishedAt?: Date;
}
```

---

# API DESIGN (REST + Socket) — important endpoints & example payloads

Use Next.js API routes (or express microservice) for REST; use Socket.IO for instant events.

## Auth / User

* `POST /api/auth/clerk-sync` — sync clerk user to Mongo on first login (server side or webhook)
* `GET  /api/users/:username` → user public profile (displayName, about, badges, public projects, public communities toggle respected)
  **Response example**

  ```json
  {
    "username":"pran",
    "displayName":"Pran Dev",
    "about":"I build cool stuff",
    "badges":["first-publish","top-contributor"],
    "publicProjects":[{"id":"...","name":"coollib"}],
    "publicCommunities":[{"id":"...","name":"HostMC"}]
  }
  ```

## Communities / Channels

* `POST /api/communities` — create community
  **Body**

  ```json
  { "name":"HostMC", "slug":"hostmc", "privacy":"public", "description":"..." }
  ```
* `GET /api/communities/:id` — get community details + channels
* `POST /api/communities/:id/join` — join (or request if private)
* `POST /api/channels` — create a channel (owner/admin only)

## Messages

* `GET /api/channels/:id/messages?before=<messageId>&limit=50` — pagination
* `POST /api/channels/:id/messages` — create message (fallback if not using socket)
* `PATCH /api/messages/:id` — edit
* `DELETE /api/messages/:id` — delete

**Send message (socket preferred)**

* Client: `socket.emit('send_message', { channelId, tempId, content, attachments })`
* Server verifies -> inserts -> emits `message_created` with server id

**message\_created payload**

```json
{ "message": { "_id":"...", "channelId":"...", "content":"hi @alex", "authorId":"...", "createdAt":"..."}, "tempId":"temp-abc" }
```

## Projects & Git

* `POST /api/projects` — create project (initializes bare git repo via NodeGit)

  * body: `{ name, description, visibility, initialFiles }`
* `POST /api/projects/:id/fork` — fork (NodeGit clone + new Project record)
* `POST /api/repos/:id/commits` — commit changes (server applies patch or working tree changes and commits with author info)
* `GET  /api/repos/:id/commits`
* `POST /api/repos/:id/pull-requests` — create PR
* `POST /api/repos/:id/pull-requests/:prId/merge` — merge PR (server performs `git merge`; if conflicts, set PR.status=conflict)

**PR payload example**

```json
{
  "title":"Fix bug in run",
  "description":"This fixes issue #12",
  "sourceBranch":"fix-run",
  "targetBranch":"main",
  "sourceRepoId":"abc",
  "targetRepoId":"def",
  "authorId":"..."
}
```

## Runs (code execution)

* `POST /api/runs` — enqueue run

  * body: `{ projectId, code, language, stdin, timeout }`
  * response: `{ runId }`
* `GET /api/runs/:runId` — get run result

---

# Socket.IO EVENT CONTRACT (client ↔ server)

**On connect**

* Client sends Clerk session token for verification
* Server validates and attaches `socket.userId`

**Client ➜ Server events**

* `join_channel` `{ channelId }` -> server joins socket room: `channel:<id>`
* `leave_channel` `{ channelId }`
* `send_message` `{ channelId, tempId, content, attachments }`
* `edit_message` `{ messageId, content }`
* `delete_message` `{ messageId }`
* `react_message` `{ messageId, emoji }`
* `typing_start` `{ channelId }` / `typing_stop`
* `create_thread` `{ parentMessageId, title }`
* `join_voice` `{ channelId }` / `leave_voice`
* `webrtc_offer` / `answer` / `ice_candidate` -> payloads for signaling
* `doc_subscribe` `{ docId }` -> hook up Yjs provider
* `friend_request_send` `{ toUserId }`
* `friend_request_accept` `{ requestId }`

**Server ➜ Client events**

* `message_created` `{ message, tempId? }`
* `message_updated` `{ message }`
* `message_deleted` `{ messageId }`
* `reaction_update` `{ messageId, reactions }`
* `typing_started` `{ channelId, userId }`
* `presence_update` `{ userId, status }`
* `call_offer/answer/ice` -> WebRTC
* `doc_update` -> Yjs updates (if using Socket.IO provider)
* `friend_request_received` `{ request }`
* `repo_event` `{ type, payload }` (fork/pr/merge)

---

# COLLABORATIVE EDITOR DESIGN (Monaco + Yjs)

* Use **Monaco** for the editing UI in Next.js.
* Use **Yjs** CRDT for collaborative text sync (`y-monaco` adapter).
* Provider options:

  * Quick start: run `y-websocket` server inside `/server/y-websocket` service
  * Alternative: implement a Socket.IO Yjs provider (forward updates via rooms). Provide both options; begin with `y-websocket`.
* Document model: store document snapshots optionally in Git as commits or in Mongo for quick retrieval.
* Cursor presence: broadcast simple presence states via Socket.IO room `doc:<docId>:presence`
* Save flow:

  * Auto-save: persist to Git working tree and call `git commit` via NodeGit with author=user
  * Manual "Publish" button that creates commit + optional release tag

---

# GIT INTEGRATION (NodeGit) — server-side details

* Create a `/server/git-service` worker responsible for NodeGit operations. Protect heavy ops via a queue (BullMQ with Redis).
* Repo layout:

  * Bare repos stored on server FS or object storage. Use a secure path per project (e.g., `/data/repos/<projectId>.git`)
* Commit flow:

  * Client frontend applies edits -> sends patch or full file content to server -> server writes files in workdir -> `git add .`, `git commit -m "message" --author=<user>` -> push to bare repo
* Fork:

  * NodeGit clone from repo path to new repo path; create Project doc referencing forkedFrom
* PR merge:

  * Checkout target branch, `git merge sourceBranch` (fast-forward if possible). If merge conflict detected, set PR.status = `conflict` and return diff details to UI
* Security:

  * Run NodeGit operations in worker process, with limited permissions. Validate repo paths (prevent path traversal).

---

# VOICE / VIDEO (WebRTC)

* Use Socket.IO for signaling (offers/answers/ice).
* Start with a P2P mesh for small groups; plan to add SFU (mediasoup) for scale.
* Provide features:

  * join/leave call
  * mute/unmute, camera on/off
  * screen sharing (getDisplayMedia)
  * secure SRTP streams (browser-managed)
* UI shows participants, active speaker, mute indicators

---

# PROFILES (Detailed — EXACT FIELDS & UX)

Each user profile page must show (respecting user privacy toggles):

* Display name (prominent)
* Username (handle) — unique
* Avatar
* About / bio (rich text / markdown permitted)
* Badges (small icons + tooltip; from user.badges array)
* Public Projects (list; if project.visibility == public)

  * each project card: name, description, stars, forks, primary language
* Publicly Joined Communities (toggleable — user can hide/show)
* Followers / Following counts? (optional; we have friends instead)
* Contribution graph? (optional future)
* Buttons:

  * Follow / Add Friend / Message / Sponsor (future)
* Profile editing:

  * Edit displayName, about, avatar, badges (badges automated by backend on achievements), privacy toggles (show/hide communities, show/hide projects)

**Profile privacy behavior**:

* `settings.showPublicCommunities` toggles whether communities list is shown to others
* Projects marked private are not shown
* API respects these toggles; server-side filtering enforced

---

# FRIENDS SYSTEM (detailed)

* Collections or arrays in User model for friends + friend requests
* Flow:

  1. `POST /api/friends/request` `{ toUserId }` -> create FriendRequest doc; send socket event to recipient
  2. `POST /api/friends/accept` `{ requestId }` -> add both user ids to each others' `friends` lists; emit `friend_request_accepted`
  3. `DELETE /api/friends/:id` -> unfriend
* Friend-only DMs: create DM Channel (type\:dm) when accepted (if not exists)
* UI: show online presence and quick DM

---

# BADGES & ACHIEVEMENTS (rules)

* Implement a simple achievements engine that grants badges on events:

  * `first-publish` — publish first public project
  * `first-pr` — create first PR
  * `merged-pr` — have a PR merged
  * `committer-10` — 10 commits
* Create `/server/badges-service` triggered by domain events (project created, PR merged, commit added) to award badges and notify user via Socket

---

# SECURITY, VALIDATION & SANITIZATION (must-have)

* All REST + sockets verify Clerk session token server-side
* Rate limit messages and uploads per user (e.g., 5 msgs/sec per user, 100 MB/day upload)
* Sanitize markdown -> HTML using a library with whitelist (DOMPurify-like) before saving `renderedHtml`
* Limit attachment size and file types; store virus scan if possible
* Runner containers: no network, limited CPU & memory, timeout (e.g., 5s default), run as unprivileged user
* NodeGit paths must be sanitized
* Escape any user-provided data in templates

---

# TESTS, CI & LINTING

* Use TypeScript + ESLint + Prettier
* Unit tests: Jest for backend logic (auth middleware, message parsing, PR merge logic)
* Integration/E2E: Playwright for flows (signup -> create community -> send message -> create project -> fork -> PR)
* GitHub Actions pipeline:

  * On PR: run lint, typecheck, tests
  * On merge: build docker images & deploy to staging
* Add security scans (npm audit, dependabot)

---

# DEPLOYMENT & INFRA (recommended)

* Dockerize services
* Use Kubernetes or a PaaS (Heroku, Fly.io, Vercel for Next.js frontend)
* Socket server and worker services hosted on Node
* Redis for Socket.IO adapter and BullMQ
* S3 for attachments and repo artifacts
* CI/CD: GitHub Actions -> Docker image pushed -> k8s deployment or platform deploy

---

# SCALING & OBSERVABILITY

* Socket.IO: Redis adapter for multi-instance, sticky sessions or session affinity
* Yjs: use a dedicated websocket cluster or Yjs persistence to DB
* For voice/video, move from P2P to SFU (mediasoup) when >4 participants
* Prometheus metrics for run queue length, socket connection counts, NodeGit job latency
* Error logging to Sentry, trace critical flows

---

# PRIVACY & DATA RETENTION

* Allow users to delete account and request data export (GDPR)
* Retain logs per policy; add admin tool to wipe user content if requested
* Store minimal PII (avoid storing raw password — Clerk handles auth)

---

# EXAMPLE DEVELOPER WORK PLAN (commit-by-commit incremental roadmap)

Make small commits. For each step include README, tests, and examples.

1. `chore(init): monorepo with web and server skeletons, env template`
2. `feat(auth): integrate Clerk in Next.js, sync user to Mongo on first login`

   * deliver: sign-up/login pages, `POST /api/auth/clerk-sync`
3. `feat(db): connect to Mongo Atlas, create user model & indexes`
4. `feat(communities): community create/list endpoints + simple UI page`
5. `feat(channels): channel create + list and Channel model`
6. `feat(socket): basic Socket.IO server + join_channel, send_message, message_created persistence`

   * deliver: real time chat with optimistic UI
7. `feat(messages): message pagination API & infinite scroll client`
8. `feat(dms): DM channel flow + friend system basic endpoints`
9. `feat(files): file upload endpoint to S3 + attach to messages`
10. `feat(editor): Monaco editor page + y-websocket integration`
11. `feat(git): NodeGit service - init repo + commit from editor`
12. `feat(projects): project CRUD + publish to public feed`
13. `feat(pr): fork & PR flow + diff UI`
14. `feat(runner): docker runner + /api/runs`
15. `feat(webrtc): basic signaling + audio/video UI`
16. `chore(prod): CI/CD + monitoring + load test plan`

Each commit must have a small README snippet on how to test the delivered feature (e.g., "To test socket chat: run server, open two browsers, login, join channel X...").

---

# SAMPLE CODE SNIPPETS (auth middleware example — server)

```ts
// server/middleware/auth.ts
import { verifySession } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function requireAuth(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const session = await verifySession(token); // Clerk Node SDK
    // find or create mongo user with session.userId (clerkId)
    req['user'] = { clerkId: session.userId, ...session };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

# SAMPLE SOCKET AUTH (server side)

```ts
// server/socket-server/index.ts
import { Server } from 'socket.io';
import http from 'http';
import { verifySession } from '@clerk/clerk-sdk-node';

const httpServer = http.createServer(app);
const io = new Server(httpServer, { /* cors etc */ });

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const session = await verifySession(token);
    socket.data.user = { clerkId: session.userId };
    return next();
  } catch (err) { return next(new Error('Unauthorized')); }
});

io.on('connection', (socket) => {
  // socket handlers: join_channel, send_message, etc
});
```

---

# DOCUMENTATION & DEV NOTES (deliverable expectations)

* `PRICO-SPEC.md` at repo root — include this entire spec
* `/docs/api.md` — list endpoints, request/response examples
* `/docs/socket.md` — socket events & payloads
* `/docs/deployment.md` — env variables, deploy steps
* Unit & integration tests for each step with clear commands

---

# FINAL COPILOT INSTRUCTIONS (paste this whole block to Copilot)

> Build **Prico** incrementally. Always output:
>
> 1. The code (TypeScript), minimal tests, and README entries for the step.
> 2. API docs: endpoint & example request/response.
> 3. Socket docs for any realtime events added.
> 4. A short dev checklist and how to test the feature locally.
>
> Follow the incremental commit roadmap above exactly (one small step at a time). Prioritize:
>
> * Next.js + Clerk auth + remote Mongo connection + User model
> * Real-time Discord-quality chat (channels, DMs, threads, mentions, reactions, typing, pagination)
> * Projects + NodeGit + forks & PRs (publish/private)
> * Monaco + Yjs collaborative editor + Git commit on save
> * Docker runner for cloud execution
> * WebRTC voice/video (signaling via Socket.IO)
> * Profiles with displayName, username, about, badges, public projects, toggleable public communities
> * Friends system
> * Security, rate-limiting, sanitization, CI, monitoring and scaling plans
>
> Use TailwindCSS + shadcn/ui for all UI components and expose adapter modules:
>
> * `lib/api/*` (REST wrapper)
> * `lib/socket/*` (SocketManager)
> * `lib/editor/*` (Monaco + Yjs adapter)
>
> Deliver meaningful commit messages as specified. Provide code + tests + README for each step.