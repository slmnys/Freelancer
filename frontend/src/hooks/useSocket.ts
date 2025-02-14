import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    const socket = io('http://localhost:3000', {
      query: { userId }
    });

    socket.on('connect', () => {
      console.log('Socket bağlandı, User ID:', userId);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef;
} 