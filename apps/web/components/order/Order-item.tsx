"use client";

import { type OrderItem } from "@/types/OrderType";
import { OrderStatus, OrderStatusKor } from "@repo/common";
import Image from "next/image";
import { Constants } from "@/common/constants";
import styles from "./Order-item.module.css";
import { useRouter } from "next/navigation";

interface OrderItemListProps {
  orderItem: OrderItem;
  orderStatus: OrderStatus;
}

export default function OrderItem({
  orderItem,
  orderStatus,
}: OrderItemListProps) {
  const router = useRouter();

  const handleNavigateToProduct = () => {
    router.push(`/product/${orderItem.detailColor.products.id.toString()}`);
  };

  const imageURL = `${Constants.image_url}/${orderItem.detailColor.products.color_main_image}`;

  return (
    <div className={styles.itemContainer}>
      <div className={styles.imageBox}>
        <Image
          onClick={handleNavigateToProduct}
          className={styles.productImage}
          src={imageURL}
          width={200}
          height={200}
          alt={`${orderItem.detailColor.products.color_main_image} - ${orderItem.detailColor.color_name}`}
          loading="eager"
        />
      </div>
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h4>상품명</h4>
          <h4>구매가</h4>
          <h4>수량</h4>
          <h4>진행현황</h4>
        </div>
        <div className={styles.itemRow}>
          <span>
            {orderItem.detailColor.products.name}{" "}
            {orderItem.detailColor.color_name}
          </span>
          <span>{orderItem.price}</span>
          <span>{orderItem.quantity}</span>
          <span>
            {OrderStatusKor[orderStatus as OrderStatusKor] ?? orderStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
