/*
Warnings:

- A unique constraint covering the columns `[color_name,product_id]` on the table `DetailProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
-- DROP INDEX "DetailProduct_color_name_key";

-- CreateIndex
-- CREATE UNIQUE INDEX "DetailProduct_color_name_product_id_key" ON "DetailProduct"("color_name", "product_id");
