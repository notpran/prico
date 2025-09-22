const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = process.env.Y_WEBSOCKET_PORT || 1234;

const wss = new WebSocket.Server({ port });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

console.log(`Y-WebSocket server running on port ${port}`);