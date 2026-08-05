-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING', 'PAYCOMPLETED', 'TRANSIT', 'DELCOMPLETED', 'REFUND', 'RETURNS', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "PersonalColor" AS ENUM ('WARM', 'COOL', 'SPRINGWARM', 'SUMMERCOOL', 'FALLWARM', 'WINTERCOOL', 'FALLDEEP', 'WINTERDEEP', 'SUMMERMUTE', 'FALLMUTE');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "color_main_image" TEXT NOT NULL,
    "color_detail_image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hash_tag" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "is_sale" BOOLEAN NOT NULL,
    "category_id" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailColor" (
    "id" SERIAL NOT NULL,
    "color_name" TEXT NOT NULL,
    "color_image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "s" INTEGER NOT NULL,
    "l" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "DetailColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "star_rating" INTEGER NOT NULL,
    "is_hsl" BOOLEAN NOT NULL,
    "is_comp" BOOLEAN NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL,
    "payment" TEXT NOT NULL,
    "delivery_info" TEXT NOT NULL,
    "postal_code" INTEGER NOT NULL,
    "delivery_inst" TEXT NOT NULL,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'AWAITING',
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "detail_color_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tone" (
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

    CONSTRAINT "Tone_pkey" PRIMARY KEY ("detail_color_id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'pwd',
    "postal_code" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "personal_color" "PersonalColor" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT true,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DetailColorToRating" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DetailColorToRating_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CartItemToDetailColor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CartItemToDetailColor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_brand_id_category_id_key" ON "Product"("id", "brand_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "DetailColor_color_name_key" ON "DetailColor"("color_name");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_user_id_key" ON "Rating"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_id_user_id_key" ON "Rating"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_user_id_key" ON "Order"("id", "user_id");

-- CreateIndex
CREATE INDEX "_DetailColorToRating_B_index" ON "_DetailColorToRating"("B");

-- CreateIndex
CREATE INDEX "_CartItemToDetailColor_B_index" ON "_CartItemToDetailColor"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailColor" ADD CONSTRAINT "DetailColor_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tone" ADD CONSTRAINT "Tone_detail_color_id_fkey" FOREIGN KEY ("detail_color_id") REFERENCES "DetailColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DetailColorToRating" ADD CONSTRAINT "_DetailColorToRating_A_fkey" FOREIGN KEY ("A") REFERENCES "DetailColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DetailColorToRating" ADD CONSTRAINT "_DetailColorToRating_B_fkey" FOREIGN KEY ("B") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToDetailColor" ADD CONSTRAINT "_CartItemToDetailColor_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToDetailColor" ADD CONSTRAINT "_CartItemToDetailColor_B_fkey" FOREIGN KEY ("B") REFERENCES "DetailColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
