-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'TRANSCODED', 'FAILED');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'PROCESSING';

-- CreateTable
CREATE TABLE "video_urls" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "video_urls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "video_urls" ADD CONSTRAINT "video_urls_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
