"use client";

import { useEffect, useState } from "react";
import { personalColorEnum } from "@repo/common";
import { Constants } from "@/common/constants";
import styles from "./PersonalColor.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { jwtPayloadType } from "@repo/common";

export default function PersonalColor() {
  const router = useRouter();
  const [decodePayload, setDecodePayload] = useState<jwtPayloadType | null>(
    null,
  );
  const [userTone, SetUserTone] = useState<personalColorEnum | null>(null);

  const [changeTone, setChangeTone] = useState<personalColorEnum | null>(null);

  const [isEditing, SetIsEditing] = useState(false);

  const personalColorList = Object.values(personalColorEnum);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      router.push("/user/login");
      return;
    }

    if (token) {
      try {
        const decodedPayload = jwtDecode<jwtPayloadType>(token);
        setDecodePayload(decodedPayload);
        SetUserTone(decodedPayload.tone);
      } catch (err) {
        console.error("잘못된 토큰입니다.", err);
        router.push("/user/login");
      }
    }
  }, [router]);

  const handleColorUpdate = async (
    personalColor: personalColorEnum | null,
    id: number,
  ) => {
    if (!personalColor || personalColor === userTone) {
      alert("바꿀 퍼스널 컬러를 선택해주세요");
      return;
    }

    const token = Cookies.get("accessToken");

    try {
      const response = await fetch(`${Constants.back_url}/auth/personalColor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personalColor: personalColor,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      if (!data.access_token) {
        alert("퍼스널 컬러 변경 중 오류 발생");
        return;
      }
      Cookies.set("accessToken", data.access_token, { path: "/" });
      SetUserTone(personalColor);
      SetIsEditing(false);
      alert("저장이 성공적으로 완료되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeTone = (personalColor: personalColorEnum) => {
    setChangeTone(personalColor);
  };

  const handleChangeEditing = () => {
    if (isEditing) {
      setChangeTone(userTone);
    }
    SetIsEditing(!isEditing);
  };

  return (
    <div className={styles.personalColorContainer}>
      <div className={styles.personalColorHeader}>
        <h5 className={styles.title}>나의 퍼스널 컬러</h5>
        <h5 className={styles.selectedTone}>본인이 고른 톤 : {userTone}</h5>
        <div className={styles.actionButtons}>
          {isEditing ? (
            <>
              <button
                className={`${styles.btn} ${styles.btnSave}`}
                onClick={() => handleColorUpdate(changeTone, decodePayload!.id)}
              >
                저장
              </button>
              <button
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={handleChangeEditing}
              >
                취소
              </button>
            </>
          ) : (
            <button
              className={`${styles.btn} ${styles.btnEdit}`}
              onClick={handleChangeEditing}
            >
              퍼스널 컬러 수정
            </button>
          )}
        </div>
      </div>
      {/* 퍼스널 컬러 선택 영역 */}
      {isEditing && (
        <div className={styles.colorOptionsGrid}>
          {personalColorList.map((color) => (
            <button
              key={color}
              onClick={() => handleChangeTone(color)}
              className={`${styles.colorItemBtn}  ${changeTone ? (changeTone === color ? styles.activeTone : "") : userTone === color ? styles.activeTone : ""}`}
            >
              {color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
