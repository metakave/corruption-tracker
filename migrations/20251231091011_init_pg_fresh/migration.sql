-- CreateTable
CREATE TABLE "PoliticalEvent" (
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
    "politicalParties" TEXT,
    "actors" TEXT,
    "injured" INTEGER,
    "killed" INTEGER,
    "affectedInfrastructure" TEXT,
    "summary" TEXT,
    "severityScore" INTEGER,
    "confidence" DOUBLE PRECISION,
    "tags" TEXT,
    "images" TEXT,
    "rawText" TEXT,
    "isBangladesh" BOOLEAN NOT NULL DEFAULT true,
    "isPoliticalViolence" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoliticalEvent_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalEvent_url_key" ON "PoliticalEvent"("url");

-- CreateIndex
CREATE UNIQUE INDEX "RawNewsArticle_url_key" ON "RawNewsArticle"("url");
