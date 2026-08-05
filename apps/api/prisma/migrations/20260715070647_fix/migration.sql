/*
  Warnings:

  - You are about to drop the `DetailColor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tone` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,brand_id,category_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_detail_color_id_fkey";

-- DropForeignKey
ALTER TABLE "DetailColor" DROP CONSTRAINT "DetailColor_product_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_detail_color_id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_detail_color_id_fkey";

-- DropForeignKey
ALTER TABLE "Tone" DROP CONSTRAINT "Tone_detail_color_id_fkey";

-- DropIndex
DROP INDEX "Product_brand_id_category_id_key";

-- DropTable
DROP TABLE "DetailColor";

-- DropTable
DROP TABLE "Tone";

-- CreateTable
CREATE TABLE "DetailProduct" (
    "id" SERIAL NOT NULL,
    "color_name" TEXT NOT NULL,
    "color_image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "s" INTEGER NOT NULL,
    "l" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "DetailProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "detail_color_id" INTEGER NOT NULL,
    "sale_count" INTEGER NOT NULL,
    "WARM" INTEGER NOT NULL,
    "COOL" INTEGER NOT NULL,
    "SPRINGWARM" INTEGER NOT NULL,
    "SUMMERCOOL" INTEGER NOT NULL,
    "FALLWARM" INTEGER NOT NULL,
    "WINTERCOOL" INTEGER NOT NULL,
    "FALLDEEP" INTEGER NOT NULL,
    "WINTERDEEP" INTEGER NOT NULL,
    "SUMMERMUTE" INTEGER NOT NULL,
    "FALLMUTE" INTEGER NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("detail_color_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetailProduct_color_name_key" ON "DetailProduct"("color_name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_brand_id_category_id_key" ON "Product"("name", "brand_id", "category_id");

-- AddForeignKey
ALTER TABLE "DetailProduct" ADD CONSTRAINT "DetailProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
