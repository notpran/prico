import { io, Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
  };
  communityId: string;
  fileAttachment?: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
  timestamp: string;
}

export interface PresenceUser {
  userId: string;
  username: string;
  displayName: string;
  status: 'online' | 'offline';
}

export interface WebRTCSignal {
  from: string;
  to: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;
      
      this.socket = io((window as any).env?.REACT_APP_SERVER_URL || 'http://localhost:3001', {
        auth: { token }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Community operations
  joinCommunity(communityId: string): void {
    if (this.socket) {
      this.socket.emit('join-community', communityId);
    }
  }

  leaveCommunity(communityId: string): void {
    if (this.socket) {
      this.socket.emit('leave-community', communityId);
    }
  }

  // Messaging
  sendMessage(communityId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('send-message', { communityId, content });
    }
  }

  onMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  // Presence
  onPresenceUpdate(callback: (users: PresenceUser[]) => void): void {
    if (this.socket) {
      this.socket.on('presence-update', callback);
    }
  }

  offPresenceUpdate(callback: (users: PresenceUser[]) => void): void {
    if (this.socket) {
      this.socket.off('presence-update', callback);
    }
  }

  // WebRTC Signaling
  sendWebRTCSignal(signal: Omit<WebRTCSignal, 'from'>): void {
    if (this.socket) {
      this.socket.emit('webrtc-signal', signal);
    }
  }

  onWebRTCSignal(callback: (signal: WebRTCSignal) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-signal', callback);
    }
  }

  offWebRTCSignal(callback: (signal: WebRTCSignal) => void): void {
    if (this.socket) {
      this.socket.off('webrtc-signal', callback);
    }
  }

  // Voice call events
  initiateCall(communityId: string, participantIds: string[]): void {
    if (this.socket) {
      this.socket.emit('initiate-call', { communityId, participantIds });
    }
  }

  joinCall(callId: string): void {
    if (this.socket) {
      this.socket.emit('join-call', callId);
    }
  }

  leaveCall(callId: string): void {
    if (this.socket) {
      this.socket.emit('leave-call', callId);
    }
  }

  onCallInvite(callback: (data: { callId: string; initiator: string; communityId: string }) => void): void {
    if (this.socket) {
      this.socket.on('call-invite', callback);
    }
  }

  onCallUpdate(callback: (data: { callId: string; participants: string[] }) => void): void {
    if (this.socket) {
      this.socket.on('call-update', callback);
    }
  }

  onCallEnded(callback: (data: { callId: string }) => void): void {
    if (this.socket) {
      this.socket.on('call-ended', callback);
    }
  }

  // Collaborative editing
  joinDocument(documentId: string): void {
    if (this.socket) {
      this.socket.emit('join-document', documentId);
    }
  }

  leaveDocument(documentId: string): void {
    if (this.socket) {
      this.socket.emit('leave-document', documentId);
    }
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();