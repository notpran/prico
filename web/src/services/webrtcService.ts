import { io, Socket } from 'socket.io-client';

class WebRTCService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io('ws://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    this.socket.on('webrtc:offer', this.handleOffer.bind(this));
    this.socket.on('webrtc:answer', this.handleAnswer.bind(this));
    this.socket.on('webrtc:ice-candidate', this.handleIceCandidate.bind(this));
    this.socket.on('webrtc:user-joined', this.handleUserJoined.bind(this));
    this.socket.on('webrtc:user-left', this.handleUserLeft.bind(this));
  }

  async joinCall(communityId: string) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket?.emit('webrtc:ice-candidate', {
            candidate: event.candidate,
            communityId
          });
        }
      };

      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        // Handle remote stream (e.g., display in video element)
        console.log('Received remote stream');
      };

      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      this.socket?.emit('webrtc:join-call', { communityId });

      return this.localStream;
    } catch (error) {
      console.error('Error joining call:', error);
      throw error;
    }
  }

  leaveCall(communityId: string) {
    this.socket?.emit('webrtc:leave-call', { communityId });
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  private async handleOffer(data: { from: string, offer: RTCSessionDescriptionInit }) {
    if (!this.peerConnection) return;

    await this.peerConnection.setRemoteDescription(data.offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.socket?.emit('webrtc:answer', {
      to: data.from,
      answer: answer
    });
  }

  private async handleAnswer(data: { from: string, answer: RTCSessionDescriptionInit }) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(data.answer);
  }

  private async handleIceCandidate(data: { from: string, candidate: RTCIceCandidateInit }) {
    if (!this.peerConnection) return;
    await this.peerConnection.addIceCandidate(data.candidate);
  }

  private async handleUserJoined(data: { userId: string }) {
    if (!this.peerConnection) return;
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket?.emit('webrtc:offer', {
      to: data.userId,
      offer: offer
    });
  }

  private handleUserLeft(data: { userId: string }) {
    console.log(`User ${data.userId} left the call`);
    // Handle user leaving
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

export default new WebRTCService();