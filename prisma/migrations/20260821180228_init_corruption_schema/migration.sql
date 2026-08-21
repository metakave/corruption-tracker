-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'POSTED', 'FAILED', 'SCHEDULED');

-- CreateTable
CREATE TABLE "CorruptionEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Prothom Alo',
    "additionalSources" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "dateOfIncident" TIMESTAMP(3),
    "locationText" TEXT,
    "district" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accusedEntities" TEXT,
    "sectorOrMinistry" TEXT,
    "amountInvolved" DOUBLE PRECISION,
    "amountFormatted" TEXT,
    "investigatingAgency" TEXT,
    "legalStatus" TEXT DEFAULT 'allegation',
    "summary" TEXT,
    "severityScore" INTEGER,
    "confidence" DOUBLE PRECISION,
    "tags" TEXT,
    "category" TEXT DEFAULT 'other',
    "images" TEXT,
    "rawText" TEXT,
    "isBangladesh" BOOLEAN NOT NULL DEFAULT true,
    "isCorruption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorruptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawNewsArticle" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'Unknown',

    CONSTRAINT "RawNewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperLog" (
    "id" SERIAL NOT NULL,
    "runId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "sourcesScraped" TEXT,
    "totalArticles" INTEGER NOT NULL DEFAULT 0,
    "newArticles" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "corruptionDetected" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScraperLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaPost" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "photocardUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'classic',
    "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "facebookPostId" TEXT,
    "facebookUrl" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SocialMediaPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorruptionEvent_url_key" ON "CorruptionEvent"("url");

-- CreateIndex
CREATE UNIQUE INDEX "RawNewsArticle_url_key" ON "RawNewsArticle"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ScraperLog_runId_key" ON "ScraperLog"("runId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_eventId_idx" ON "SocialMediaPost"("eventId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_status_idx" ON "SocialMediaPost"("status");

-- CreateIndex
CREATE INDEX "SocialMediaPost_createdAt_idx" ON "SocialMediaPost"("createdAt");

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CorruptionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
