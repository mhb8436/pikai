import Link from "next/link";
import styles from "./page.module.css";

interface CompletePageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function Page({ searchParams }: CompletePageProps) {
  const params = await searchParams;
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.check}>✓</div>

        <h1 className={styles.title}>주문이 완료되었습니다.</h1>

        <p className={styles.description}>주문해주셔서 감사합니다.</p>

        <div className={styles.orderBox}>
          <span>주문번호</span>
          <strong>{params.orderId}</strong>
        </div>

        <div className={styles.buttonBox}>
          <Link
            className={styles.orderButton}
            href={`/order/${params.orderId}`}
          >
            주문내역 보기
          </Link>

          <Link className={styles.shopButton} href="/">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
