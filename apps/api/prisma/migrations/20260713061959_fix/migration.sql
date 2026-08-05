/*
  Warnings:

  - You are about to drop the `_CartItemToDetailColor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DetailColorToRating` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `detail_color_id` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CartItemToDetailColor" DROP CONSTRAINT "_CartItemToDetailColor_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemToDetailColor" DROP CONSTRAINT "_CartItemToDetailColor_B_fkey";

-- DropForeignKey
ALTER TABLE "_DetailColorToRating" DROP CONSTRAINT "_DetailColorToRating_A_fkey";

-- DropForeignKey
ALTER TABLE "_DetailColorToRating" DROP CONSTRAINT "_DetailColorToRating_B_fkey";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "detail_color_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DetailColor" ADD COLUMN     "rating_id" INTEGER;

-- DropTable
DROP TABLE "_CartItemToDetailColor";

-- DropTable
DROP TABLE "_DetailColorToRating";

-- AddForeignKey
ALTER TABLE "DetailColor" ADD CONSTRAINT "DetailColor_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "Rating"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
