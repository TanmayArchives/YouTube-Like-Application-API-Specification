import { AuthenticatedSocket } from '@/middleware/wsAuth';
import { Socket } from 'socket.io';

type SocketEventCallback = (data: Record<string, unknown>) => void;
type SocketEventHandler = (event: string, callback: SocketEventCallback) => void;

interface SocketEvents {
  'video:timestamp_updated': {
    timestamp: number;
    video_id: string;
  };
  'video:subscribe': {
    video_id: string;
  };
  'video:unsubscribe': {
    video_id: string;
  };
  error: {
    message: string;
  };
}

export function createSocketRateLimiter(socket: AuthenticatedSocket) {
  const eventTimestamps: Record<string, number[]> = {};
  const RATE_LIMIT_WINDOW = 60 * 1000; 
  const MAX_EVENTS_PER_WINDOW = 60; // 60 events per minute

  function isRateLimited(event: string): boolean {
    const now = Date.now();
    const timestamps = eventTimestamps[event] || [];

    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );

    eventTimestamps[event] = recentTimestamps;

    return recentTimestamps.length >= MAX_EVENTS_PER_WINDOW;
  }
  return new Proxy(socket, {
    get(target: AuthenticatedSocket, property: string) {
      if (property !== 'on') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[property];
      }

      return function(this: Socket, event: keyof SocketEvents, callback: SocketEventCallback) {
        if (['error', 'disconnect', 'connect'].includes(event)) {
          return target.on(event, callback);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return target.on(event, (...args: [Record<string, unknown>, ...any[]]) => {
          if (isRateLimited(event)) {
            socket.emit('error', {
              message: 'Rate limit exceeded for this event',
            });
            return;
          }

          if (!eventTimestamps[event]) {
            eventTimestamps[event] = [];
          }
          eventTimestamps[event].push(Date.now());
          callback(args[0]);
        });
      } as SocketEventHandler;
    }
  });
} 