-- CreateTable
CREATE TABLE "UserRelationship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relatedUserId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRelationship_relatedUserId_idx" ON "UserRelationship"("relatedUserId");

-- CreateIndex
CREATE INDEX "UserRelationship_userId_idx" ON "UserRelationship"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRelationship_userId_relatedUserId_relationshipType_key" ON "UserRelationship"("userId", "relatedUserId", "relationshipType");

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD CONSTRAINT "UserRelationship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD CONSTRAINT "UserRelationship_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
