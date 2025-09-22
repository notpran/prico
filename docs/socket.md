# Socket.IO Events Documentation

## Connection

Client connects with Clerk session token for authentication:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: clerkSessionToken
  }
});
```

Server validates token and attaches `socket.userId` for authorization.

## Room Structure

- **Channels**: `channel:<channelId>`
- **Communities**: `community:<communityId>`
- **Documents**: `doc:<docId>`
- **Presence**: `doc:<docId>:presence`
- **Voice calls**: `voice:<channelId>`

## Client → Server Events

### Chat & Messaging

#### `join_channel`
Join a channel room to receive messages
```javascript
socket.emit('join_channel', { channelId: 'channel_123' });
```

#### `leave_channel`
Leave a channel room
```javascript
socket.emit('leave_channel', { channelId: 'channel_123' });
```

#### `send_message`
Send a message to a channel
```javascript
socket.emit('send_message', {
  channelId: 'channel_123',
  tempId: 'temp_abc', // Client-generated temporary ID
  content: 'Hello @alex!',
  attachments: ['attachment_id'],
  mentions: ['user_id']
});
```

#### `edit_message`
Edit an existing message
```javascript
socket.emit('edit_message', {
  messageId: 'msg_123',
  content: 'Updated message content'
});
```

#### `delete_message`
Delete a message
```javascript
socket.emit('delete_message', {
  messageId: 'msg_123'
});
```

#### `react_message`
Add/remove reaction to a message
```javascript
socket.emit('react_message', {
  messageId: 'msg_123',
  emoji: '👍'
});
```

### Typing Indicators

#### `typing_start`
Start typing indicator
```javascript
socket.emit('typing_start', { channelId: 'channel_123' });
```

#### `typing_stop`
Stop typing indicator
```javascript
socket.emit('typing_stop', { channelId: 'channel_123' });
```

### Threads

#### `create_thread`
Create a thread from a message
```javascript
socket.emit('create_thread', {
  parentMessageId: 'msg_123',
  title: 'Discussion about feature X'
});
```

### Voice & Video

#### `join_voice`
Join voice channel
```javascript
socket.emit('join_voice', { channelId: 'voice_channel_123' });
```

#### `leave_voice`
Leave voice channel
```javascript
socket.emit('leave_voice', { channelId: 'voice_channel_123' });
```

#### WebRTC Signaling
```javascript
// Offer
socket.emit('webrtc_offer', {
  to: 'user_id',
  offer: rtcOffer
});

// Answer
socket.emit('webrtc_answer', {
  to: 'user_id',
  answer: rtcAnswer
});

// ICE Candidate
socket.emit('webrtc_ice_candidate', {
  to: 'user_id',
  candidate: iceCandidate
});
```

### Collaborative Editing

#### `doc_subscribe`
Subscribe to document updates (Yjs provider)
```javascript
socket.emit('doc_subscribe', { docId: 'doc_123' });
```

### Friends System

#### `friend_request_send`
Send friend request
```javascript
socket.emit('friend_request_send', { toUserId: 'user_456' });
```

#### `friend_request_accept`
Accept friend request
```javascript
socket.emit('friend_request_accept', { requestId: 'req_123' });
```

## Server → Client Events

### Messaging

#### `message_created`
New message in subscribed channel
```javascript
socket.on('message_created', (data) => {
  console.log('New message:', data);
  // data: { message: {...}, tempId?: 'temp_abc' }
});
```

#### `message_updated`
Message was edited
```javascript
socket.on('message_updated', (data) => {
  // data: { message: {...} }
});
```

#### `message_deleted`
Message was deleted
```javascript
socket.on('message_deleted', (data) => {
  // data: { messageId: 'msg_123' }
});
```

#### `reaction_update`
Reactions on message changed
```javascript
socket.on('reaction_update', (data) => {
  // data: { messageId: 'msg_123', reactions: { '👍': ['user1', 'user2'] } }
});
```

### Typing & Presence

#### `typing_started`
User started typing
```javascript
socket.on('typing_started', (data) => {
  // data: { channelId: 'channel_123', userId: 'user_456' }
});
```

#### `typing_stopped`
User stopped typing
```javascript
socket.on('typing_stopped', (data) => {
  // data: { channelId: 'channel_123', userId: 'user_456' }
});
```

#### `presence_update`
User presence changed (online/offline/away)
```javascript
socket.on('presence_update', (data) => {
  // data: { userId: 'user_456', status: 'online' }
});
```

### Voice & Video

#### WebRTC Signaling Events
```javascript
socket.on('webrtc_offer', (data) => {
  // data: { from: 'user_id', offer: rtcOffer }
});

socket.on('webrtc_answer', (data) => {
  // data: { from: 'user_id', answer: rtcAnswer }
});

socket.on('webrtc_ice_candidate', (data) => {
  // data: { from: 'user_id', candidate: iceCandidate }
});
```

### Collaborative Editing

#### `doc_update`
Yjs document update
```javascript
socket.on('doc_update', (data) => {
  // data: { docId: 'doc_123', update: yUpdate }
});
```

### Friends & Social

#### `friend_request_received`
Received a friend request
```javascript
socket.on('friend_request_received', (data) => {
  // data: { request: { _id: '...', fromUserId: '...', ... } }
});
```

#### `friend_request_accepted`
Friend request was accepted
```javascript
socket.on('friend_request_accepted', (data) => {
  // data: { friendId: 'user_456' }
});
```

### Repository Events

#### `repo_event`
Repository activity (fork, PR, merge)
```javascript
socket.on('repo_event', (data) => {
  // data: { type: 'fork', payload: { ... } }
  // data: { type: 'pull_request', payload: { ... } }
  // data: { type: 'merge', payload: { ... } }
});
```

## Error Events

#### `error`
General error occurred
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

#### `unauthorized`
Authentication failed
```javascript
socket.on('unauthorized', () => {
  // Redirect to login
});
```

## Example Usage

### Basic Chat Setup
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: clerkToken }
});

// Join a channel
socket.emit('join_channel', { channelId: 'general' });

// Listen for messages
socket.on('message_created', (data) => {
  displayMessage(data.message);
});

// Send a message
socket.emit('send_message', {
  channelId: 'general',
  tempId: generateTempId(),
  content: 'Hello everyone!'
});
```

### WebRTC Voice Call
```javascript
// Join voice channel
socket.emit('join_voice', { channelId: 'voice_1' });

// Handle incoming call
socket.on('webrtc_offer', async (data) => {
  const answer = await peerConnection.createAnswer(data.offer);
  socket.emit('webrtc_answer', { to: data.from, answer });
});
```

## Rate Limiting

- **Messages**: 5 per second per user
- **Typing events**: 1 per second per user
- **Voice events**: No limit (real-time requirement)
- **Friend requests**: 10 per hour per user