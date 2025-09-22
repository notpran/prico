'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button } from '../../components/ui/button';

export default function VoicePage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connected, setConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [stream, peer]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
      });

      newPeer.on('signal', (data) => {
        console.log('Signal data:', JSON.stringify(data));
        // In real app, send this to the other peer via signaling server
      });

      newPeer.on('connect', () => {
        setConnected(true);
        console.log('Connected to peer');
      });

      newPeer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const joinCall = async (signalData: string) => {
    try {
      const mediaStream = stream || await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const newPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
      });

      newPeer.signal(JSON.parse(signalData));

      newPeer.on('connect', () => {
        setConnected(true);
        console.log('Connected to peer');
      });

      newPeer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      console.error('Error joining call:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (peer) {
        peer.replaceTrack(stream!.getVideoTracks()[0], mediaStream.getVideoTracks()[0], stream!);
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setStream(screenStream);
        if (peer) {
          peer.replaceTrack(stream!.getVideoTracks()[0], screenStream.getVideoTracks()[0], stream!);
        }
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    setConnected(false);
    setIsScreenSharing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Voice & Video</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Local</h2>
          <video ref={localVideoRef} autoPlay muted className="w-full border" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Remote</h2>
          <video ref={remoteVideoRef} autoPlay className="w-full border" />
        </div>
      </div>

      <div className="space-x-2">
        {!stream ? (
          <Button onClick={startCall}>Start Call</Button>
        ) : (
          <>
            <Button onClick={toggleScreenShare}>
              {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            </Button>
            <Button onClick={endCall} variant="destructive">End Call</Button>
          </>
        )}
      </div>

      {connected && (
        <p className="mt-4 text-green-600">Connected to peer</p>
      )}
    </div>
  );
}