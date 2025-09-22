import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';

class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    const { getToken } = useAuth();
    const token = getToken();

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChannel(channelId: string) {
    this.socket?.emit('join_channel', channelId);
  }

  leaveChannel(channelId: string) {
    this.socket?.emit('leave_channel', channelId);
  }

  sendMessage(channelId: string, tempId: string, content: string) {
    this.socket?.emit('send_message', { channelId, tempId, content });
  }

  onMessageCreated(callback: (data: any) => void) {
    this.socket?.on('message_created', callback);
  }

  offMessageCreated() {
    this.socket?.off('message_created');
  }
}

export const socketManager = new SocketManager();