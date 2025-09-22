# Prico API Documentation

## Authentication

All API endpoints require authentication via Clerk session token in the Authorization header:
```
Authorization: Bearer <clerk_session_token>
```

## Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.prico.dev`

## API Endpoints

### Auth / User

#### `POST /api/auth/clerk-sync`
Sync Clerk user to MongoDB on first login (server-side or webhook)

**Request Body:**
```json
{
  "clerkId": "user_abc123",
  "email": "user@example.com",
  "username": "username",
  "displayName": "Display Name"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "clerkId": "user_abc123",
    "username": "username",
    "displayName": "Display Name",
    "email": "user@example.com",
    "createdAt": "2025-09-22T..."
  }
}
```

#### `GET /api/users/:username`
Get user public profile

**Response:**
```json
{
  "username": "pran",
  "displayName": "Pran Dev",
  "about": "I build cool stuff",
  "badges": ["first-publish", "top-contributor"],
  "publicProjects": [{"id": "...", "name": "coollib"}],
  "publicCommunities": [{"id": "...", "name": "HostMC"}]
}
```

### Communities / Channels

#### `POST /api/communities`
Create community

**Request Body:**
```json
{
  "name": "HostMC",
  "slug": "hostmc",
  "privacy": "public",
  "description": "Minecraft hosting community"
}
```

**Response:**
```json
{
  "success": true,
  "community": {
    "_id": "...",
    "name": "HostMC",
    "slug": "hostmc",
    "privacy": "public",
    "ownerId": "...",
    "createdAt": "..."
  }
}
```

#### `GET /api/communities/:id`
Get community details + channels

**Response:**
```json
{
  "community": {
    "_id": "...",
    "name": "HostMC",
    "channels": [
      {"_id": "...", "name": "general", "type": "text"},
      {"_id": "...", "name": "announcements", "type": "text"}
    ]
  }
}
```

#### `POST /api/communities/:id/join`
Join community (or request if private)

### Messages

#### `GET /api/channels/:id/messages`
Get messages with pagination

**Query Parameters:**
- `before`: Message ID for pagination
- `limit`: Number of messages (default: 50, max: 100)

**Response:**
```json
{
  "messages": [
    {
      "_id": "...",
      "channelId": "...",
      "authorId": "...",
      "content": "Hello @alex!",
      "mentions": ["user_id"],
      "createdAt": "..."
    }
  ],
  "hasMore": true
}
```

#### `POST /api/channels/:id/messages`
Create message (fallback if not using Socket.IO)

**Request Body:**
```json
{
  "content": "Hello @alex!",
  "attachments": ["attachment_id"],
  "mentions": ["user_id"]
}
```

### Projects & Git

#### `POST /api/projects`
Create project (initializes bare git repo via NodeGit)

**Request Body:**
```json
{
  "name": "My Cool Library",
  "description": "A cool library for developers",
  "visibility": "public",
  "initialFiles": {
    "README.md": "# My Cool Library\n\nDescription here..."
  }
}
```

#### `POST /api/projects/:id/fork`
Fork project

#### `POST /api/repos/:id/commits`
Commit changes

**Request Body:**
```json
{
  "message": "Fix bug in authentication",
  "files": {
    "src/auth.js": "// updated content"
  },
  "authorName": "User Name",
  "authorEmail": "user@example.com"
}
```

#### `POST /api/repos/:id/pull-requests`
Create pull request

**Request Body:**
```json
{
  "title": "Fix bug in run",
  "description": "This fixes issue #12",
  "sourceBranch": "fix-run",
  "targetBranch": "main",
  "sourceRepoId": "abc",
  "targetRepoId": "def"
}
```

### Code Execution

#### `POST /api/runs`
Enqueue code execution

**Request Body:**
```json
{
  "projectId": "optional_project_id",
  "code": "print('Hello World')",
  "language": "python",
  "stdin": "optional input",
  "timeout": 5000
}
```

**Response:**
```json
{
  "runId": "run_abc123",
  "status": "queued"
}
```

#### `GET /api/runs/:runId`
Get run result

**Response:**
```json
{
  "runId": "run_abc123",
  "status": "finished",
  "stdout": "Hello World\n",
  "stderr": "",
  "exitCode": 0,
  "createdAt": "...",
  "finishedAt": "..."
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

- **Messages**: 5 messages per second per user
- **API calls**: 100 requests per minute per user
- **File uploads**: 100 MB per day per user

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error