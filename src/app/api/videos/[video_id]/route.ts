import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { video_id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.video_id },
      include: {
        channel: true,
        videoUrls: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.video.update({
      where: { id: params.video_id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { message: 'Error fetching video' },
      { status: 500 }
    );
  }
} 