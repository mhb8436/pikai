import Link from "next/link";
import styles from "./UserMenu.module.css";
import { Constants } from "@/common/constants";
import { cookies } from "next/headers";
import { UserInfoType } from "@/types/userType";
import LogoutButton from "./LogoutButton";

export default async function UserMenu() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let user: UserInfoType | null = null;

  if (token) {
    try {
      const response = await fetch(`${Constants.back_url}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(response.statusText);

      if (response.ok) {
        user = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <Link href={`/user/login`}>로그인</Link>
        <Link href={`/user/register`}>회원가입</Link>
      </div>
    );
  }
  if (user.is_admin) {
    return (
      <div className={styles.container}>
        <Link href={`/admin`}>관리자 페이지</Link>
        <LogoutButton />
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <Link href={`/cart`}>장바구니</Link>
      <Link href={`/order`}>주문 내역</Link>
      <Link href={`/user/mypage`}>마이페이지</Link>
      <Link href={`/rating`}>나만의 화장대</Link>
      <p style={{ fontSize: "14px" }}>
        <strong>{user.name}</strong> 님
      </p>
      <LogoutButton />
    </div>
  );
}
