'use client';

import { useAuth } from '@/hooks/useAuth';
import { Auth } from '@/components/Auth';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoFeed } from '@/components/VideoFeed';

export default function Home() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Video Platform</h1>
        {token ? (
          <div className="space-y-8">
            <VideoUpload />
            <VideoFeed />
          </div>
        ) : (
          <Auth />
        )}
      </div>
    </main>
  );
}
