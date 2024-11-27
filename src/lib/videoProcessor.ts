import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { join } from 'path';
import { PrismaClient, VideoStatus } from '@prisma/client';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const prisma = new PrismaClient();

export async function processVideo(input: string, videoId: string): Promise<void> {
  const outputDir = join(process.cwd(), 'uploads', videoId);
  const qualities = ['720p', '480p', '240p'];

  try {
    await Promise.all(qualities.map(async (quality) => {
      const output = join(outputDir, `${quality}.mp4`);
      await processQuality(input, output, quality);
      
      // Update database with video URL
      await prisma.videoUrl.create({
        data: {
          videoId,
          quality,
          url: `/videos/${videoId}/${quality}.mp4`,
        },
      });
    }));

    await generateThumbnail(input, outputDir);

    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: VideoStatus.TRANSCODED,
        thumbnailUrl: `/videos/${videoId}/thumbnail.jpg`
      },
    });
  } catch (error) {
    console.error('Error processing video:', error);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.FAILED },
    });
    throw error;
  }
}

function processQuality(input: string, output: string, quality: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const height = quality === '720p' ? 720 : quality === '480p' ? 480 : 240;
    
    ffmpeg(input)
      .videoCodec('libx264')
      .size(`?x${height}`)
      .fps(30)
      .videoBitrate('1000k')
      .audioCodec('aac')
      .audioBitrate('128k')
      .save(output)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err));
  });
}

export async function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timeInSeconds: number = 0
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: 'thumbnail.jpg',
        folder: outputPath,
        size: '1280x720'
      })
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err));
  });
} 