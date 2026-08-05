"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setTimeout(() => {
      router.push("/");
      router.refresh();
      setLoading(false);
    }, 500);
  };

  return (
    <button type="button" onClick={handleLogout}>
      로그아웃
    </button>
  );
}
