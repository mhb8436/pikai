"use client";

import { OrderListType } from "@/types/OrderType";
import { OrderStatus, OrderStatusKor } from "@repo/common";
import OrderItem from "@/components/order/Order-item";
import { Constants } from "@/common/constants";
import { useState } from "react";
import styles from "./Order-itemList.module.css";
import Cookies from "js-cookie";

interface OrderItemListProps {
  orderList: OrderListType;
}
export default function OrderItemList({ orderList }: OrderItemListProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    orderList.order_status,
  );
  const token = Cookies.get("accessToken");

  const handleOrderStatusChange = async (orderState: OrderStatus) => {
    if (!orderState) {
      alert("바꿀 상태를 선택해주세요");
      return;
    }

    if (
      confirm(
        `주문의 ${OrderStatusKor[orderList.order_status as OrderStatusKor]} 상태를 ${OrderStatusKor[orderState as OrderStatusKor]}로 변경하시겠습니까??`,
      )
    ) {
      try {
        const response = await fetch(
          `${Constants.back_url}/order/${orderList.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              order_status: orderState,
            }),
          },
        );
        if (!response.ok) {
          alert("배송 상태를 수정하는데 실패하였습니다. 다시 시도해주세요.");
          throw new Error(response.statusText);
        }

        alert("저장이 성공적으로 완료되었습니다.");
        setOrderStatus(orderState);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.orderContainer}>
      <div className={styles.topHeader}>
        {["AWAITING", "PAYCOMPLETED"].includes(orderStatus) ? (
          <button
            className={styles.OrderButton}
            onClick={() => handleOrderStatusChange(OrderStatus.REFUND)}
          >
            주문 취소
          </button>
        ) : ["REFUND", "RETURNS", "EXCHANGE", "ConfirmPurchase"].includes(
            orderStatus,
          ) ? (
          <span>
            {OrderStatusKor[orderStatus as OrderStatusKor] ?? orderStatus}
          </span>
        ) : (
          <div className={styles.OrderButtonList}>
            <button
              onClick={() => handleOrderStatusChange(OrderStatus.EXCHANGE)}
            >
              교환
            </button>
            <button
              onClick={() => handleOrderStatusChange(OrderStatus.RETURNS)}
            >
              반품
            </button>
            <button
              onClick={() =>
                handleOrderStatusChange(OrderStatus.ConfirmPurchase)
              }
            >
              구매확정
            </button>
          </div>
        )}
      </div>
      {orderList.orderItem.map((item) => (
        <div key={item.id}>
          <OrderItem orderItem={item} orderStatus={orderStatus} />
          <hr className={styles.line} />
        </div>
      ))}
    </div>
  );
}
