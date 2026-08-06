export const dynamic = "force-dynamic";
import { Constants } from "@/common/constants";
import type { Metadata } from "next";
import styles from "./page.module.css";
import PayContainer from "@/components/pay/PayContainer";
import { PayProps } from "@/types/payType";
import { cookies } from "next/headers";
import { Cart } from "@/types/cartType";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "결제",
  description: "회원의 상품 결제 페이지입니다.",
};

export default async function Page({ searchParams }: PayProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let cartData: Cart | null = null;

  try {
    const response = await fetch(
      `${Constants.back_url}/cart?isCartOrder=${params.isCartOrder ?? true}&selectedOnly=${params.selectedOnly ?? false}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    cartData = data;
  } catch (err) {
    console.error(err);
  }
  if (!cartData) {
    redirect("/");
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주문/결제</h2>
      <PayContainer data={cartData} />
    </div>
  );
}
