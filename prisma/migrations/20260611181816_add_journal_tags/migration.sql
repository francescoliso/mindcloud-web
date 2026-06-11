-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
