"use client";
import { useEffect, useRef, useState } from "react";
import DeliveryInfo from "@/components/pay/DeliveryInfo";
import PayItem from "@/components/pay/PayItem";
import { DeliveryData } from "@/types/payType";
import { Constants } from "@/common/constants";
import styles from "./PayContainer.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Cart } from "@/types/cartType";
import { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import Payment from "./payment";

interface Props {
  data: Cart;
}

export default function PayContainer({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isCartOrder = searchParams.get("isCartOrder") ?? true;
  const selectedOnly = searchParams.get("selectedOnly") ?? false;

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    if (errorCode) {
      alert(`결제에 실패했습니다: ${errorMessage || "알 수 없는 오류"}`);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  const [delivery, setDelivery] = useState<DeliveryData>({
    recipient: data.user.name,
    phone_number: data.user.phone,
    postal_code: data.user.postal_code,
    delivery_info: data.user.address,
    delivery_inst: "",
  });

  const totalPrice = data.cartItems.reduce(
    (acc, item) =>
      acc + item.quantity * (item.detailColor.products.price * 0.9),
    0,
  );

  const [payment, setPayment] = useState("카드");

  const handlePay = async () => {
    if (!delivery.recipient.trim()) {
      alert("받는 분을 입력해주세요.");
      return;
    }

    if (!delivery.phone_number.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }

    if (delivery.phone_number.length !== 11) {
      alert("전화번호 11자리를 정확히 입력해주세요.");
      return;
    }

    if (!delivery.postal_code.trim()) {
      alert("주소를 선택해주세요.");
      return;
    }

    if (!delivery.delivery_info.trim()) {
      alert("배송지를 입력해주세요.");
      return;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget) {
      alert("결제 위젯 로딩 중입니다. 잠시만 기다려주세요.");
      return;
    }

    const cartItem = data.cartItems.map((item) => ({
      detail_color_id: item.detailColor.id,
      quantity: item.quantity,
    }));

    if (token) {
      try {
        const response = await fetch(`${Constants.back_url}/pay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment,
            ...delivery,
            isCartOrder: isCartOrder === "true",
            selectedOnly: selectedOnly === "true",
            items: cartItem,
          }),
        });

        if (!response.ok) {
          alert("결제에 실패했습니다.");
          return;
        }

        const order = await response.json();

        const firstProductName =
          data.cartItems[0]?.detailColor.products.name || "상품";
        const orderName =
          data.cartItems.length > 1
            ? `${firstProductName} 외 ${data.cartItems.length - 1}건`
            : firstProductName;

        await paymentWidget.requestPayment({
          orderId: `${order.id}`,
          orderName: orderName,
          successUrl: `${window.location.origin}/pikai/pay/complete`,
          failUrl: `${window.location.origin}${pathname}`,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <DeliveryInfo
        recipient={delivery.recipient}
        phone_number={delivery.phone_number}
        postal_code={delivery.postal_code}
        delivery_info={delivery.delivery_info}
        onChange={setDelivery}
      />

      <PayItem items={data} />

      <div className={styles.paymentBox}>
        <h3 className={styles.title}>결제 수단</h3>
        <Payment
          userId={data.id}
          price={totalPrice}
          onWidgetLoad={(widget) => (paymentWidgetRef.current = widget)}
        />

        <button className={styles.payButton} onClick={handlePay}>
          결제하기
        </button>
      </div>
    </div>
  );
}
