import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const videos = await prisma.video.findMany({
      where: {
        status: 'TRANSCODED'
      },
      include: {
        channel: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { message: 'Error fetching feed' },
      { status: 500 }
    );
  }
} 