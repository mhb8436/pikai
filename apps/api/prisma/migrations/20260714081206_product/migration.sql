/*
  Warnings:

  - The `hash_tag` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "hash_tag",
ADD COLUMN     "hash_tag" TEXT[];
