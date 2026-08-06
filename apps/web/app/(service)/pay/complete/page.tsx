import Link from "next/link";
import styles from "./page.module.css";
import { Constants } from "@/common/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface CompletePageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

export default async function Page({ searchParams }: CompletePageProps) {
  const { paymentKey, orderId, amount } = await searchParams;

  if (!orderId || !paymentKey || !amount) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${Constants.back_url}/pay/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount: Number(amount),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>결제 승인 실패</h1>
          <p className={styles.description}>
            {errorData.message || "결제 승인 중 오류가 발생했습니다."}
          </p>
          <div className={styles.buttonBox}>
            <Link className={styles.shopButton} href="/">
              메인으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.check}>✓</div>

        <h1 className={styles.title}>주문이 완료되었습니다.</h1>
        <p className={styles.description}>주문해주셔서 감사합니다.</p>

        <div className={styles.orderBox}>
          <span>주문번호</span>
          <strong>{orderId}</strong>
        </div>

        <div className={styles.buttonBox}>
          <Link className={styles.orderButton} href={`/order/${orderId}`}>
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
