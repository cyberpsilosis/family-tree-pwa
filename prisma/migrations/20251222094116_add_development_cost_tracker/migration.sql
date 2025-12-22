-- CreateTable
CREATE TABLE "DevelopmentCost" (
    "id" TEXT NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalAmount" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevelopmentCost_pkey" PRIMARY KEY ("id")
);
