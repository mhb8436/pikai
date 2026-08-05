"use client";
import { OrderListType } from "@/types/OrderType";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "./OrderList.module.css";
import { Constants } from "@/common/constants";
import { formatDateSimple } from "@/common/date";
import { OrderStatusKor } from "@repo/common";

interface OrderProps {
  orderList: OrderListType;
  totalPage: number;
  currentPageNum: number;
  isLast: boolean;
}

export default function OrderList({
  orderList,
  totalPage,
  currentPageNum,
  isLast,
}: OrderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNum));

    router.push(`?${params.toString()}`);
  };

  const handleNavigateToDetail = () => {
    router.push(`/order/${orderList.id.toString()}`);
  };

  const handleNavigateToProduct = () => {
    router.push(`/product/${orderShow?.detailColor.products.id.toString()}`);
  };

  const orderShow = orderList.orderItem[0];
  const imageUrl = `${Constants.image_url}/${orderShow?.detailColor.products.color_main_image}`;
  const totalQuantity = orderList.orderItem.length - 1;
  const range: (number | string)[] = [];
  // total Price  계산
  const totalPrice = orderList.orderItem.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (totalPage && currentPageNum) {
    // 페이지가 5개 이하일 경우 그냥 다 보여주기
    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) {
        range.push(i);
      }
    } else {
      range.push(1);

      let start = currentPageNum - 1;
      let end = currentPageNum + 1;

      if (start <= 2) {
        start = 2;
        end = 4;
      }

      if (end >= totalPage - 1) {
        start = totalPage - 3;
        end = totalPage - 1;
      }

      if (start > 2) {
        range.push("...");
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (end < totalPage - 1) {
        range.push("...");
      }

      range.push(totalPage);
    }
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.headerInfo}>
        <h4>주문 번호: {orderList.id}</h4>
        <h4>
          날짜:
          <time className={styles.dateText} suppressHydrationWarning>
            {formatDateSimple(orderList.order_date)}
          </time>
        </h4>
      </div>

      <div className={styles.cardBox}>
        <button
          className={styles.detailButton}
          onClick={handleNavigateToDetail}
        >
          상세
        </button>

        <div className={styles.imageWrapper}>
          <div className={styles.imageBox}>
            <Image
              className={styles.productImage}
              src={imageUrl}
              fill
              sizes={"(max-width: 768px) 50vw, 20vw"}
              priority={false}
              alt={`${orderShow?.detailColor.products.color_main_image} - ${orderShow?.detailColor.color_name}`}
              loading="eager"
              onClick={handleNavigateToProduct}
            />
          </div>
          {totalQuantity > 0 && (
            <span
              className={styles.extraBadge}
              onClick={handleNavigateToDetail}
            >
              +{totalQuantity}
            </span>
          )}
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span> 주문 상품 명</span>
            <span>수량</span>
            <span>주문 금액</span>
            <span>상태</span>
          </div>

          <div className={styles.itemRow}>
            <span className={styles.productName}>
              {orderShow?.detailColor.products.name}
              {orderShow?.detailColor.color_name}
              {totalQuantity > 0 && ` 외 ${totalQuantity}건`}
            </span>
            <span>{totalQuantity > 0 ? "-" : orderShow?.quantity}</span>
            <span>{totalPrice.toLocaleString("ko-KR")}원</span>
            <span style={{ fontWeight: "bold" }}>
              {OrderStatusKor[orderList.order_status as OrderStatusKor] ??
                orderList.order_status}
            </span>
          </div>
        </div>
      </div>
      <hr className={styles.line} />
      {isLast ? (
        <div className={styles.pagination}>
          {range.map((page, index) => {
            // '...' 문자인 경우 버튼이 아닌 그냥 일반 글자로 띄우기
            if (page === "...") {
              return <span key={`ellipsis-${index}`}>...</span>;
            }
            // 숫자 페이지 버튼인 경우
            return (
              <button
                key={`page-${index}`}
                onClick={() => handlePageChange(Number(page))}
                /* 현재 페이지와 번호가 일치하면 active 클래스를 줘서 색을 다르게 만듭니다 */
                className={`${styles.pageButton} ${currentPageNum === page ? styles.active : ""}`}
              >
                {page}
              </button>
            );
          })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
