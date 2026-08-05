"use client";

import { Constants } from "@/common/constants";
import { useState } from "react";
import { Address, useKakaoPostcodePopup } from "react-daum-postcode";
import styles from "./addressForm.module.css";

export default function AddressForm() {
  const scriptUrl =
    "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

  const [newPostalCode, setNewPostalCode] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const open = useKakaoPostcodePopup(scriptUrl);

  const handleComplete = (data: Address) => {
    setNewPostalCode(data.zonecode);
    setNewAddress(data.address);
  };

  const handleClick = () => {
    open({
      onComplete: handleComplete,
    });
  };

  const handleSave = async () => {
    const address = `${newAddress} ${detailAddress}`;

    if (!newPostalCode.trim()) {
      alert("주소를 선택해주세요.");
      return;
    }

    if (!newAddress.trim()) {
      alert("주소를 선택해주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      alert("상세주소를 입력해주세요.");
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

    if (token) {
      try {
        const response = await fetch(`${Constants.back_url}/user`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postal_code: newPostalCode,
            address: address,
          }),
        });

        if (response.ok) {
          alert("주소가 수정되었습니다.");
          window.location.reload();
        } else {
          alert("주소 수정에 실패했습니다.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.subTitle}>변경할 주소</h3>

      <div className={styles.postBox}>
        <input
          className={styles.postInput}
          value={newPostalCode}
          readOnly
          placeholder="우편번호"
        />

        <button
          type="button"
          className={styles.searchButton}
          onClick={handleClick}
        >
          주소 찾기
        </button>
      </div>

      <input
        className={styles.input}
        value={newAddress}
        readOnly
        placeholder="주소"
      />

      <input
        className={styles.input}
        value={detailAddress}
        onChange={(e) => setDetailAddress(e.target.value)}
        placeholder="상세주소를 입력해주세요."
      />

      <button type="button" className={styles.saveButton} onClick={handleSave}>
        저장
      </button>
    </div>
  );
}
