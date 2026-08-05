"use client";

import { Constants } from "@/common/constants";
import styles from "./deleteButton.module.css";
import { UserInfoType } from "@/types/userType";

export default function DeleteButton({ id }: UserInfoType) {
  const handleDelete = async () => {
    const userCancel = window.confirm(
      "정말 회원을 탈퇴하시겠습니까?\n(회원은 탈퇴 후 계정을 사용할 수 없으며 한 달 간 재가입이 불가능합니다.)",
    );

    if (!userCancel) return;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (token) {
      try {
        const response = await fetch(`${Constants.back_url}/user`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: false,
          }),
        });

        if (!response.ok) {
          alert("회원 탈퇴가 실패했습니다.");
          return;
        }

        alert("회원 탈퇴가 완료되었습니다.");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/pikai";
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <button
      type="button"
      className={styles.deleteButton}
      onClick={handleDelete}
    >
      회원 탈퇴
    </button>
  );
}
