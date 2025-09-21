import { useEffect, useRef, useState } from 'react';
import { socketManager } from '../api/socket';

interface UseWebRTCProps {
  onCallInvite?: (data: { callId: string; initiator: string; communityId: string }) => void;
  onCallUpdate?: (data: { callId: string; participants: string[] }) => void;
  onCallEnded?: (data: { callId: string }) => void;
}

export const useWebRTC = ({ onCallInvite, onCallUpdate, onCallEnded }: UseWebRTCProps = {}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    // Set up Socket.IO event listeners
    if (onCallInvite) {
      socketManager.onCallInvite(onCallInvite);
    }
    if (onCallUpdate) {
      socketManager.onCallUpdate(onCallUpdate);
    }
    if (onCallEnded) {
      socketManager.onCallEnded(onCallEnded);
    }

    // WebRTC signaling
    const handleWebRTCSignal = async (signal: any) => {
      const { from, to, signal: signalData, type } = signal;
      
      if (!peerConnections.current.has(from)) {
        await createPeerConnection(from);
      }

      const pc = peerConnections.current.get(from);
      if (!pc) return;

      try {
        if (type === 'offer') {
          await pc.setRemoteDescription(signalData);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketManager.sendWebRTCSignal({
            to: from,
            signal: answer,
            type: 'answer'
          });
        } else if (type === 'answer') {
          await pc.setRemoteDescription(signalData);
        } else if (type === 'ice-candidate') {
          await pc.addIceCandidate(signalData);
        }
      } catch (error) {
        console.error('WebRTC signaling error:', error);
      }
    };

    socketManager.onWebRTCSignal(handleWebRTCSignal);

    return () => {
      socketManager.offWebRTCSignal(handleWebRTCSignal);
      endCall();
    };
  }, [onCallInvite, onCallUpdate, onCallEnded]);

  const createPeerConnection = async (peerId: string): Promise<RTCPeerConnection> => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(peerId, remoteStream)));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketManager.sendWebRTCSignal({
          to: peerId,
          signal: event.candidate,
          type: 'ice-candidate'
        });
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  };

  const startCall = async (communityId: string, participantIds: string[], video = true) => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true
      });
      
      setLocalStream(stream);
      setIsInCall(true);
      setIsVideoEnabled(video);

      // Set local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initiate call via Socket.IO
      socketManager.initiateCall(communityId, participantIds);

      // Create peer connections and send offers to all participants
      for (const participantId of participantIds) {
        const pc = await createPeerConnection(participantId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socketManager.sendWebRTCSignal({
          to: participantId,
          signal: offer,
          type: 'offer'
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  };

  const joinCall = async (callId: string, video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true
      });
      
      setLocalStream(stream);
      setIsInCall(true);
      setCurrentCallId(callId);
      setIsVideoEnabled(video);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socketManager.joinCall(callId);
    } catch (error) {
      console.error('Failed to join call:', error);
      throw error;
    }
  };

  const endCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Clear remote streams
    setRemoteStreams(new Map());

    // Leave call via Socket.IO
    if (currentCallId) {
      socketManager.leaveCall(currentCallId);
    }

    setIsInCall(false);
    setCurrentCallId(null);
    setIsMuted(false);
    setIsVideoEnabled(true);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return {
    localStream,
    remoteStreams,
    isInCall,
    currentCallId,
    isMuted,
    isVideoEnabled,
    localVideoRef,
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo
  };
};