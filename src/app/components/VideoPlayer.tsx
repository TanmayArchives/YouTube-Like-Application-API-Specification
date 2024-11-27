import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/app/hooks/useSocket';

interface VideoPlayerProps {
  src: string;
  onTimestampUpdate?: (timestamp: number) => void;
}

export function VideoPlayer({ src, onTimestampUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimestampUpdate = useCallback((data: { timestamp: number }) => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - data.timestamp) > 1) {
      videoRef.current.currentTime = data.timestamp;
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const { updateTimestamp, connected } = useSocket(src, handleTimestampUpdate);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && connected) {
      const currentTime = videoRef.current.currentTime;
      updateTimestamp(currentTime);
      onTimestampUpdate?.(currentTime);
    }
  }, [connected, updateTimestamp, onTimestampUpdate]);

  return (
    <video
      ref={videoRef}
      controls
      onTimeUpdate={handleTimeUpdate}
      className="w-full aspect-video"
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
} 