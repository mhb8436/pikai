import { Constants } from "@/common/constants";
import PasswordForm from "../../../../../../components/mypage/passwordForm";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "비밀번호 변경",
  description: "회원의 비밀번호를 변경할 수 있는 페이지입니다.",
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
      <h2 className={styles.title}>비밀번호 변경</h2>

      <p className={styles.description}>
        현재 비밀번호를 입력한 후 새 비밀번호로 변경해주세요.
      </p>

      <PasswordForm />
    </div>
  );
}
