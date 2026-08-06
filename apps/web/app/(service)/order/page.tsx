export const dynamic = "force-dynamic";
import { Constants } from "@/common/constants";
import { OrderListType } from "@/types/OrderType";
import styles from "./order.module.css";
import OrderList from "@/components/order/OrderList";
import { cookies } from "next/headers";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await searchParams;
  let totalPage = 1;
  const currentPage = Number(page) || 1;
  let orderList: OrderListType[] = [];
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const response = await fetch(
      `${Constants.back_url}/order?page=${currentPage}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(response.statusText);
    const orderJson = await response.json();
    orderList = orderJson?.orders;
    totalPage = orderJson?.totalPage;
  } catch (error) {
    console.error(error);
  }

  if (orderList.length < 1) {
    return (
      <div>
        <h3 className={styles.titleMain}>주문 내역</h3>
        <p
          style={{
            marginLeft: "2rem",
            textAlign: "center",
            marginTop: "6rem",
            marginBottom: "6rem",
          }}
        >
          주문 내역이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h3 className={styles.titleMain}>주문 내역</h3>

        <div>
          {orderList.map((orders, index) => (
            <OrderList
              key={orders.id}
              orderList={orders}
              totalPage={totalPage}
              currentPageNum={currentPage}
              isLast={index === orderList.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
