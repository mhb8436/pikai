"use client";

import { Constants } from "@/common/constants";
import { personalColorEnum } from "@repo/common";
import { ChangeEvent, useState } from "react";
import styles from "./SignUpform.module.css";
import { Address, useKakaoPostcodePopup } from "react-daum-postcode";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const scriptUrl =
    "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [detailAddressError, setDetailAddressError] = useState("");
  const [tone, setTone] = useState<personalColorEnum | null>(null);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [agreeError, setAgreeError] = useState<string>("");

  const open = useKakaoPostcodePopup(scriptUrl);

  const personalColorList = Object.values(personalColorEnum);

  const handleSetAddress = (data: Address) => {
    setPostcode(data.zonecode);
    setAddress(data.address);
  };

  const handleAddressClick = () => {
    open({
      onComplete: handleSetAddress,
    });
  };
  const validationEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!value) {
      setEmailError("이메일을 입력해주세요");
    } else if (!emailRegex.test(value)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailError("");
    }
  };

  const handleEmailClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setEmail(value);
    validationEmail(value);
  };

  const handlePasswordClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim().length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleNameClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setName(value);
    if (!value.trim()) {
      setNameError("이름을 입력해주세요.");
    } else {
      setNameError("");
    }
  };

  const handlePhoneClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
    setPhone(onlyNumbers);
    if (!onlyNumbers.trim() || onlyNumbers.length < 11) {
      setPhoneError("올바른 전화번호(숫자로)를 입력해주세요.");
    } else {
      setPhoneError("");
    }
  };

  const handleDetailAddressClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setDetailAddress(value);
    if (!value.trim()) {
      setDetailAddressError("상세주소를 입력해주세요.");
    } else {
      setDetailAddressError("");
    }
  };

  const handleAgreeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked);
    if (!e.target.checked) {
      setAgreeError("정보 수집 동의가 필요합니다.");
    } else {
      setAgreeError("");
    }
  };

  const handleSubmit = async () => {
    // 이메일 체크 + error 메세지 체크 하기
    if (email === "" || emailError) {
      alert("이메일을 확인 해주세요.");
      return;
    }
    // 비번도 6자 이상 아님 에러 발생하게
    if (password === "" || passwordError) {
      alert("비밀번호를 확인 해주세요.");
      return;
    }

    if (name === "" || nameError) {
      alert("이름을 확인 해주세요.");
      return;
    }

    if (phone === "" || phoneError) {
      alert("전화번호를 확인 해주세요.");
      return;
    }

    if (
      address === "" ||
      detailAddress === "" ||
      detailAddressError ||
      postcode === ""
    ) {
      alert("주소를 확인 해주세요.");
      return;
    }

    if (tone === null) {
      alert("퍼스널 컬러를 선택해주세요.");
      return;
    }

    if (!isAgreed) {
      alert("정보 수집 동의가 필요합니다.");
      setAgreeError("정보 수집 동의가 필요합니다.");
      return;
    }

    const addressData = `${address} ${detailAddress}`;

    try {
      const response = await fetch(`${Constants.back_url}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          postal_code: postcode,
          address: addressData,
          personal_color: tone,
        }),
      });
      if (!response.ok) {
        alert("회원가입에 실패했습니다.");
        throw new Error(response.statusText);
      }

      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      router.push("/user/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.h3}>회원가입</h3>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="email">
          이메일(아이디) <span className={styles.requiredStar}>*</span>
        </label>
        <input
          className={styles.input}
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="example@email.com"
          onChange={handleEmailClick}
          required
        />
        {emailError && <p className={styles.errorMessage}>{emailError}</p>}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="password">
          비밀번호 <span className={styles.requiredStar}>*</span>
        </label>
        <input
          className={styles.input}
          required
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordClick}
        />
        {passwordError && (
          <p className={styles.errorMessage}>{passwordError}</p>
        )}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="name">
          이름 <span className={styles.requiredStar}>*</span>
        </label>
        <input
          onChange={handleNameClick}
          className={styles.input}
          required
          type="text"
          id="name"
          name="name"
          value={name}
          placeholder="이름을 입력해주세요"
        />
        {nameError && <p className={styles.errorMessage}>{nameError}</p>}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="phone">
          전화번호 <span className={styles.requiredStar}>*</span>
        </label>
        <input
          className={styles.input}
          required
          type="tel"
          id="phone"
          name="phone"
          placeholder="01012345678"
          maxLength={11}
          value={phone}
          onChange={handlePhoneClick}
        />
        {phoneError && <p className={styles.errorMessage}>{phoneError}</p>}
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="address">
          주소 <span className={styles.requiredStar}>*</span>
        </label>
        <div className={styles.addressGroup}>
          <input
            required
            id="address"
            name="address"
            readOnly
            value={address}
            placeholder="주소 찾기를 눌러주세요"
            className={`${styles.input} ${styles.readOnlyInput}`}
          />
          <button
            type="button"
            onClick={handleAddressClick}
            className={styles.addressBtn}
          >
            주소 찾기
          </button>
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="addressDetail">
          상세주소 <span className={styles.requiredStar}>*</span>
        </label>
        <input
          required
          className={styles.input}
          type="text"
          id="addressDetail"
          name="addressDetail"
          value={detailAddress}
          onChange={handleDetailAddressClick}
          placeholder="상세주소를 입력해주세요"
        />
        {detailAddressError && (
          <p className={styles.errorMessage}>{detailAddressError}</p>
        )}
      </div>
      <div className={styles.colorSection}>
        <h3 className={styles.sectionTitle}>
          퍼스널 컬러 <span className={styles.requiredStar}>*</span>
        </h3>
        <div className={styles.colorOptionsGrid}>
          {personalColorList.map((color) => (
            <button
              key={color}
              onClick={() => setTone(color)}
              className={`${styles.colorItemBtn}  ${tone === color ? styles.activeTone : ""}`}
            >
              {color}
            </button>
          ))}
        </div>
        <div className={styles.guideBox}>
          <p className={styles.guideTitle}>
            내 톤을 모르시나요? 아래 설명을 읽고 웜톤/쿨톤을 선택해 주세요.
            (필수)
          </p>
          <p>A4 용지(생화이트)를 턱 밑에 댔을 때, 시선이 어디로 가나요?</p>
          <p
            onClick={() => setTone(personalColorEnum.WARM)}
            className={styles.clickCheckbox}
          >
            <strong>A)</strong> 옷이 너무 하얘서 옷만 보이고, 내 얼굴은
            상대적으로 누렇게 둥둥 뜨거나 기운 없어 보인다. ➡ WARM
          </p>
          <p
            onClick={() => setTone(personalColorEnum.COOL)}
            className={styles.clickCheckbox}
          >
            <strong>B)</strong> 이목구비가 또렷해 보이고, 안색이 맑아지며, 옷과
            얼굴이 자연스럽게 어우러진다. ➡ COOL
          </p>
        </div>
      </div>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="terms"
          checked={isAgreed}
          onChange={handleAgreeChange}
          required
        />
        <label htmlFor="terms" className={styles.clickCheckbox}>
          정보 수집 동의 <span className={styles.requiredStar}>*</span>
        </label>
        {agreeError && <p className={styles.errorMessage}>{agreeError}</p>}
      </div>
      <button
        className={`${styles.btn} ${styles.btnSave}`}
        type="submit"
        onClick={handleSubmit}
      >
        회원가입
      </button>
      <div className={styles.footerText}>
        <p>계정이 이미 있으신가요?? </p>
        <p
          onClick={() => router.push("/user/login")}
          className={styles.loginLink}
        >
          로그인
        </p>
      </div>
    </div>
  );
}
