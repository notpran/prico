import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let chatSocket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket && socket.connected) return socket;
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
    transports: ['websocket'],
    autoConnect: true,
    auth: { token },
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function connectChatSocket(token: string) {
  if (chatSocket && chatSocket.connected) return chatSocket;
  const base = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  chatSocket = io(`${base}/chat`, {
    transports: ['websocket'],
    autoConnect: true,
    auth: { token },
  });
  return chatSocket;
}

export function getChatSocket() {
  return chatSocket;
}
