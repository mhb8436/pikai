"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import styles from "./side-bar.module.css";

export default function SideBar() {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.sidebar}>
      <div className={styles.folder} onClick={() => setOpen(!open)}>
        <span>회원 정보 수정</span>

        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>

      {open && (
        <div className={styles.menu}>
          <Link href={`/user/mypage/change-address`} className={styles.link}>
            주소 변경
          </Link>

          <Link href={`/user/mypage/change-password`} className={styles.link}>
            비밀번호 변경
          </Link>
        </div>
      )}
    </div>
  );
}
