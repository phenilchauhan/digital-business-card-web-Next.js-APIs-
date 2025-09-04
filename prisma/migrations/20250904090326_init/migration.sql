-- DropIndex
DROP INDEX "public"."Card_userId_idx";

-- AlterTable
ALTER TABLE "public"."Card" ALTER COLUMN "profile" SET DEFAULT '{}',
ALTER COLUMN "business" SET DEFAULT '{}',
ALTER COLUMN "social" SET DEFAULT '{}',
ALTER COLUMN "about" SET DEFAULT '{}',
ALTER COLUMN "cta" SET DEFAULT '{}';
