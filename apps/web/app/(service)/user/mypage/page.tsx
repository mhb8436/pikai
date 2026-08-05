import styles from "./page.module.css";
import { Constants } from "@/common/constants";
import { MirrorRound, ClipboardList, UserRoundCog } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../../../../components/mypage/deleteButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description:
    "회원의 주문 정보와 화장대, 정보를 수정할 수 있는 마이페이지입니다.",
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let user = null;

  if (!token) {
    redirect("/user/login");
  }

  if (token) {
    try {
      const response = await fetch(`${Constants.back_url}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      user = await response.json();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>마이페이지</h2>

      <div className={styles.myPageBox}>
        <div className={styles.profile}>
          <p className={styles.userName}>
            <strong>{user.name}</strong> 님
          </p>
          <DeleteButton id={user.id} />
        </div>

        <div className={styles.divider}></div>

        <div className={styles.menuBox}>
          <Link href={`/order`} className={styles.menu}>
            <ClipboardList size={60} strokeWidth={1.8} />
            <span>주문 내역</span>
          </Link>

          <Link href={`/rating`} className={styles.menu}>
            <MirrorRound size={60} strokeWidth={1.8} />
            <span>나만의 온라인 화장대</span>
          </Link>

          <Link href={`/user/mypage/change-address`} className={styles.menu}>
            <UserRoundCog size={60} strokeWidth={1.8} />
            <span>회원 정보 수정</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
