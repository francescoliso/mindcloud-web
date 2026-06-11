-- CreateTable
CREATE TABLE "AccountDeletion" (
    "id" UUID NOT NULL,
    "accountCreatedAt" TIMESTAMP(3) NOT NULL,
    "wasOnboarded" BOOLEAN NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDeletion_pkey" PRIMARY KEY ("id")
);
