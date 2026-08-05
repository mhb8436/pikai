import { Constants } from "@/common/constants";
import { formatDateSimple } from "@/common/date";
import { OrderListType } from "@/types/OrderType";
import styles from "./order-id.module.css";
import OrderItemList from "@/components/order/Order-itemList";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let orderList: OrderListType | null = null;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/user/login");
  }

  try {
    const { id } = await params;
    const response = await fetch(`${Constants.back_url}/order/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const order = await response.json();
    if (order && order.id) {
      orderList = order;
    }
  } catch (error) {
    console.error(`orderItem 가져오는 중 에러 내용: `, error);
  }

  if (!orderList) {
    return (
      <div>
        <h3> 주문 상품 상세를 가져올 수 없습니다. 다시 시도해주세요.</h3>
      </div>
    );
  }

  // total Price  계산
  const totalPrice = orderList.orderItem.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className={styles.cardContainer}>
      <div>
        <div className={styles.headerInfo}>
          <h3 className={styles.titleMain}>주문 상세</h3>
          <h4>주문 번호: {orderList.id}</h4>
          <h4>
            구매 날짜:{" "}
            <time suppressHydrationWarning>
              {formatDateSimple(orderList.order_date)}
            </time>
          </h4>
        </div>
        <div className={styles.cardBox}>
          <h3>주소</h3>
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
              <span>받는 분</span>
              <span>전화번호</span>
              <span>주소</span>
              <span>배송메시지</span>
            </div>
            <div className={styles.itemRow}>
              <span>{orderList.recipient}</span>
              <span>{orderList.phone_number}</span>
              <span>
                [{orderList.postal_code}] {orderList.delivery_info}
              </span>
              <span>{orderList.delivery_inst}</span>
            </div>
          </div>
        </div>
        <div className={styles.cardBox}>
          <h3>주문 상품</h3>
          <div className={styles.tableWrapper}>
            <div>{<OrderItemList orderList={orderList} />}</div>
          </div>
        </div>
        <div className={styles.cardBox}>
          <h3>결제 정보</h3>
          <div className={styles.tableWrapper}>
            <div className={styles.paymentHeader}>
              <span>결제 수단</span>
              <span>총 금액</span>
            </div>
            <div className={styles.paymentRow}>
              <h4>{orderList.payment}로 진행</h4>
              <h4>총 {totalPrice.toLocaleString("ko-KR")}원</h4>
            </div>
          </div>
        </div>
        <div>
          <Link href="/order" className={styles.backButton}>
            주문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
