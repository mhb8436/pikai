"use client";
import { useRouter } from "next/navigation";
import styles from "./Loginform.module.css";
import { ChangeEvent, useState } from "react";
import { Constants } from "@/common/constants";
import Cookies from "js-cookie";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const handleSubmit = async () => {
    // 이메일 체크 + error 메세지 체크 하기
    if (email === "" || emailError) {
      alert("이메일을 확인 해주세요.");
      return;
    }
    // 비번도 6자 이상 체크
    if (password === "" || passwordError) {
      alert("비밀번호를 확인 해주세요.");
      return;
    }

    try {
      const response = await fetch(`${Constants.back_url}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const data = await response.json();
      Cookies.set("accessToken", data.access_token, { expires: 14 });
      const ratingCountResponse = await fetch(
        `${Constants.back_url}/rating/comp/count`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        },
      );

      if (!ratingCountResponse.ok) {
        throw new Error("비교 제품 수 가져오기 실패");
      }

      const ratingCountData = await ratingCountResponse.json();
      const compRatingCount = ratingCountData.ratingCount;

      if (compRatingCount >= 1) {
        router.push(`/`);
        router.refresh();
      } else {
        router.push(`/rating/add`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>로그인</h2>
      <div className={styles.inputGroup}>
        <label className={styles.sectionTitle} htmlFor="email">
          이메일 (아이디)
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
          비밀번호
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
      <button
        className={`${styles.btn} ${styles.btnSave}`}
        type="submit"
        onClick={handleSubmit}
      >
        로그인
      </button>
      <div className={styles.footerText}>
        <p
          onClick={() => router.push("/user/register")}
          className={styles.loginLink}
        >
          회원가입
        </p>
      </div>
    </div>
  );
}
