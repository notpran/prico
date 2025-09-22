import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;

  async connect() {
    if (this.socket) return;

    try {
      // Get auth token from cookie (this will be handled server-side)
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const userData = await response.json();

      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { token: 'custom-jwt-token' }, // We'll handle auth differently
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
    }
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

  sendMessage(channelId: string, tempId: string, content: string, attachments?: string[]) {
    this.socket?.emit('send_message', { channelId, tempId, content, attachments });
  }

  onMessageCreated(callback: (data: any) => void) {
    this.socket?.on('message_created', callback);
  }

  offMessageCreated() {
    this.socket?.off('message_created');
  }
}

export const socketManager = new SocketManager();