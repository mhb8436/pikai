"use client";

import { DeliveryInfoProps } from "@/types/payType";
import { ChangeEvent, useEffect, useState } from "react";
import { Address, useKakaoPostcodePopup } from "react-daum-postcode";
import styles from "./DeliveryInfo.module.css";

export default function DeliveryInfo({
  recipient,
  phone_number,
  postal_code,
  delivery_info,
  onChange,
}: DeliveryInfoProps) {
  const scriptUrl =
    "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

  const [newRecipient, setNewRecipient] = useState(recipient ?? "");
  const [newPhone, setNewPhone] = useState(phone_number ?? "");
  const [newPostalCode, setNewPostalCode] = useState(postal_code ?? "");
  const [newAddress, setNewAddress] = useState(delivery_info ?? "");
  const [isAddressChanged, setIsAddressChanged] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");
  const [deliveryInst, setDeliveryInst] = useState("");

  const open = useKakaoPostcodePopup(scriptUrl);

  const handleComplete = (data: Address) => {
    setNewPostalCode(data.zonecode);
    setNewAddress(data.address);

    setDetailAddress("");
    setIsAddressChanged(true);
  };

  const deliveryInfo = isAddressChanged
    ? `${newAddress} ${detailAddress}`.trim()
    : newAddress;

  useEffect(() => {
    onChange({
      recipient: newRecipient,
      phone_number: newPhone,
      postal_code: newPostalCode,
      delivery_info: deliveryInfo,
      delivery_inst: deliveryInst,
    });
  }, [
    newRecipient,
    newPhone,
    newPostalCode,
    deliveryInfo,
    deliveryInst,
    onChange,
  ]);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
    setNewPhone(onlyNumbers);
  };

  const isDetailAddressEmpty = isAddressChanged && detailAddress.trim() === "";

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h3 className={styles.subTitle}>배송 정보</h3>
        <p>
          <label>받는 분</label>
          <input
            className={styles.postInput}
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="받는 사람"
          />
        </p>
        <p>
          <label>연락처</label>

          <input
            className={styles.postInput}
            type="tel"
            value={newPhone}
            maxLength={11}
            onChange={handlePhoneChange}
            placeholder="연락처"
          />
        </p>
        <label>주소</label>
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
            onClick={() =>
              open({
                onComplete: handleComplete,
              })
            }
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

        {isAddressChanged && (
          <div>
            <input
              className={styles.input}
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세주소를 입력해주세요."
            />
            {isDetailAddressEmpty && (
              <p
                style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}
              >
                상세주소를 입력해주세요.
              </p>
            )}
          </div>
        )}
        <label>배송 요청 사항</label>
        <input
          className={styles.input}
          type="text"
          value={deliveryInst}
          onChange={(e) => setDeliveryInst(e.target.value)}
          placeholder="배송 요청 사항이 있을 경우 입력해주세요."
        />
      </div>
    </div>
  );
}
