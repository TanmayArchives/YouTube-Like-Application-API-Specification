'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  creator: {
    id: string;
    username: string;
  };
  view_count: number;
  created_at: string;
}

interface FeedResponse {
  videos: Video[];
  total_pages: number;
  current_page: number;
}

export function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/videos/feed');
        if (!response.ok) throw new Error('Failed to fetch videos');
        
        const data: FeedResponse = await response.json();
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="text-center">Loading videos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (videos.length === 0) {
    return <div className="text-center">No videos found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link href={`/videos/${video.id}`} key={video.id}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No thumbnail</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              <div className="text-sm text-gray-600">
                <p>{video.creator.username}</p>
                <p>{video.view_count} views • {new Date(video.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 