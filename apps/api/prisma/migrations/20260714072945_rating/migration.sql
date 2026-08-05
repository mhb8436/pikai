/*
  Warnings:

  - You are about to drop the column `rating_id` on the `DetailColor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[detail_color_id,user_id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `detail_color_id` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DetailColor" DROP CONSTRAINT "DetailColor_rating_id_fkey";

-- DropIndex
DROP INDEX "Rating_id_user_id_key";

-- AlterTable
ALTER TABLE "DetailColor" DROP COLUMN "rating_id";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "detail_color_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_detail_color_id_user_id_key" ON "Rating"("detail_color_id", "user_id");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
