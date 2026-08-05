"use client";
import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    // 상품 목록 검색 페이지가 아니라 다른 페이지로 이동 시 검색창 비우기
    if (!pathname.startsWith("/product")) {
      setSearch("");
    } else if (!q) {
      setSearch("");
    }
  }, [pathname, q]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (search.trim() !== "") {
      router.push(`/product?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={search}
        placeholder="상품명 또는 컬러명을 검색해보세요."
        className={styles.input}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className={styles.button}
        aria-label="검색"
        onClick={handleSubmit}
      >
        <Search />
      </button>
    </div>
  );
}
