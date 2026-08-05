import { Constants } from "@/common/constants";
import Image from "next/image";
import styles from "./PayItem.module.css";
import { Cart } from "@/types/cartType";

interface PayItemProps {
  items: Cart;
}

export default function PayItem({ items }: PayItemProps) {
  const imageUrl = `${Constants.image_url}/`;

  if (!items || items.cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>주문 상품</h2>
        <p className={styles.empty}>주문할 상품이 없습니다.</p>
      </div>
    );
  }

  const totalPrice = items.cartItems.reduce(
    (sum, item) => sum + Math.floor(item.price * 0.9) * item.quantity,
    0,
  );
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주문 상품</h2>

      {items.cartItems.map((item) => (
        <div className={styles.card} key={item.detailColor.id}>
          <Image
            src={`${imageUrl}${item.detailColor.products.color_main_image}`}
            alt={item.detailColor.products.name}
            width={110}
            height={110}
            className={styles.image}
            loading="eager"
          />

          <div className={styles.productName}>
            <h3>{item.detailColor.products.name}</h3>
            <p>[{item.detailColor.color_name}]</p>
          </div>

          <div className={styles.info}>
            <div className={styles.row}>
              <span>수량</span>
              <span>{item.quantity}개</span>
            </div>

            <div className={styles.row}>
              <span>구매가</span>
              <span>
                {(
                  Math.floor(item.price * 0.9) * item.quantity
                ).toLocaleString()}
                원
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className={styles.totalBox}>
        <span>총 결제 금액</span>
        <strong>{totalPrice.toLocaleString()}원</strong>
      </div>
    </div>
  );
}
