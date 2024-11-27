import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function uploadToStorage(
  filepath: string,
  videoId: string,
  quality: string
): Promise<string> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${videoId}_${quality}.mp4`;
    const destination = path.join(UPLOAD_DIR, filename);

    await fs.copyFile(filepath, destination);

    //  development, return a local URL
    // production, this would be a CDN URL
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
} 