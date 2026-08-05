import { Constants } from "@/common/constants";
import React from "react";
import AddressForm from "../../../../../../components/mypage/addressForm";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "주소 변경",
  description: "회원의 주소를 변경할 수 있는 페이지입니다.",
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let user = null;

  if (token) {
    try {
      const response = await fetch(`${Constants.back_url}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(response.statusText);

      if (response.ok) {
        user = await response.json();
      }
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주소 변경</h2>

      <div className={styles.currentBox}>
        <h3 className={styles.subTitle}>현재 주소</h3>

        <div className={styles.info}>
          <div className={styles.row}>
            <span className={styles.label}>우편번호</span>
            <span>{user.postal_code}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>주소</span>
            <span>{user.address}</span>
          </div>
        </div>
      </div>

      <AddressForm />
    </div>
  );
}
