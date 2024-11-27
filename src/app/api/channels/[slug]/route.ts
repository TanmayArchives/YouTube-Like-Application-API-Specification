import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const channel = await prisma.channel.findUnique({
      where: { slug: params.slug },
      include: {
        videos: {
          where: { status: 'TRANSCODED' },
          orderBy: { createdAt: 'desc' },
          include: {
            videoUrls: true
          }
        },
        user: {
          select: {
            username: true
          }
        }
      }
    });

    if (!channel) {
      return NextResponse.json(
        { message: 'Channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { message: 'Error fetching channel' },
      { status: 500 }
    );
  }
} 