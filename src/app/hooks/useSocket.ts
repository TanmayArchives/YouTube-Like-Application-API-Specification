import { useEffect, useCallback, useRef } from 'react';
import { Socket as IOSocket, connect } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface TimestampUpdate {
  type: 'video:timestamp_updated';
  timestamp: number;
  user_id: string;
}

export function useSocket(videoId: string, onTimestampUpdate?: (data: TimestampUpdate) => void) {
  const socketRef = useRef<IOSocket | null>(null);
  const { token } = useAuth();

  const connectSocket = useCallback(() => {
    if (!token) return;

    const socket = connect('/', {
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('video:subscribe', { video_id: videoId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    if (onTimestampUpdate) {
      socket.on('video:timestamp_updated', onTimestampUpdate);
    }

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('video:unsubscribe', { video_id: videoId });
        if (onTimestampUpdate) {
          socketRef.current.off('video:timestamp_updated', onTimestampUpdate);
        }
        socketRef.current.disconnect();
      }
    };
  }, [token, videoId, onTimestampUpdate]);

  useEffect(() => {
    const cleanup = connectSocket();
    return () => {
      cleanup?.();
    };
  }, [connectSocket]);

  const updateTimestamp = useCallback((timestamp: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('video:timestamp_updated', {
      video_id: videoId,
      timestamp,
    });
  }, [videoId]);

  return {
    updateTimestamp,
    connected: socketRef.current?.connected ?? false,
  };
} 