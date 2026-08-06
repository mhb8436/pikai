"use client";

import { useEffect, useRef } from "react";
import {
  loadPaymentWidget,
  PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

interface PaymentProps {
  userId: number | string;
  price: number;
  onWidgetLoad?: (widget: PaymentWidgetInstance) => void;
}

export default function Payment({ userId, price, onWidgetLoad }: PaymentProps) {
  console.log(userId);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey || !userId || !price || price <= 0) return;

    const customerKey = `USER_${String(userId).trim()}`;
    let isMounted = true;

    (async () => {
      try {
        if (paymentWidgetRef.current) {
          if (paymentMethodsWidgetRef.current) {
            paymentMethodsWidgetRef.current.updateAmount(price);
          }
          return;
        }

        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

        if (!isMounted) return;

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          "#payment-widget",
          { value: price },
          { variantKey: "DEFAULT" },
        );

        paymentWidget.renderAgreement("#agreement", {
          variantKey: "DEFAULT",
        });

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        if (onWidgetLoad) {
          onWidgetLoad(paymentWidget);
        }
      } catch (error) {
        console.error("토스 결제 위젯 에러:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId, price, onWidgetLoad]);

  return (
    <div style={{ width: "100%" }}>
      <div id="payment-widget" style={{ width: "100%", minHeight: "400px" }} />
      <div id="agreement" style={{ width: "100%" }} />
    </div>
  );
}
