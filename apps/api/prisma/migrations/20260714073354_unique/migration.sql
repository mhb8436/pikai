/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand_id,category_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_id_user_id_key";

-- DropIndex
DROP INDEX "Product_id_brand_id_category_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Order_user_id_key" ON "Order"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_brand_id_category_id_key" ON "Product"("brand_id", "category_id");
