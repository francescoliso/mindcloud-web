-- CreateTable
CREATE TABLE "LifeWheel" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "goals" JSONB NOT NULL,
    "current" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeWheel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifeWheel_userId_key" ON "LifeWheel"("userId");

-- AddForeignKey
ALTER TABLE "LifeWheel" ADD CONSTRAINT "LifeWheel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
