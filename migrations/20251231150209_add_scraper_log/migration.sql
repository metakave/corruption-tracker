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
    "violenceDetected" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScraperLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScraperLog_runId_key" ON "ScraperLog"("runId");
