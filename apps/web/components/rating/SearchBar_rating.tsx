"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./SearchBar_Rating.module.css";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Constants } from "@/common/constants";

interface SearchBarRatingProps {
  isProduct: boolean;
  productId?: number;
}

interface SearchResultType {
  id: number;
  name?: string;
  productId?: number;
  color_name?: string;
}

export default function SearchBarRating({
  isProduct,
  productId,
}: SearchBarRatingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResultType[]>([]);
  const isSelectedRef = useRef(false);

  // AbortController는 비동기 작업을 중간에 취소 할 수 있게 해주는 객체
  const controllerRef = useRef<AbortController | null>(null);

  const handleSearch = async (text: string) => {
    isSelectedRef.current = false;
    setKeyword(text);

    if (!text.trim() || (!isProduct && !productId)) {
      return setResults([]);
    }
  };

  const handleClick = (item: {
    id: number;
    name?: string;
    productId?: number;
    color_name?: string;
  }) => {
    isSelectedRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    if (isProduct && item.name) {
      setKeyword(item.name);
      setResults([]); // 리스트 닫기
      params.set("productId", String(item.id));
      params.delete("newProduct");
      // 새로 바꾸면 기존에 골라둔 컬러 id는 유효하지 않으므로 삭제합니다.
      params.delete("id");
    } else {
      setKeyword(item.color_name || "");
      setResults([]); // 리스트 닫기
      params.delete("newColor");
      params.set("id", String(item.id));
    }
    router.push(`?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 두번 되는 문제
    if (e.key !== "Enter") return; // 엔터키가 아니면 무시
    if (!keyword.trim()) return; // 빈 입력창이면 무시
    // 정확히 일치하는 이름이 목록에 있는지 확인
    const exactMatch = results.find((item) =>
      isProduct
        ? item.name?.trim() === keyword.trim()
        : item.color_name?.trim() === keyword.trim(),
    );

    if (exactMatch) {
      handleClick(exactMatch);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (isProduct) {
        params.set("newProduct", keyword.trim());
        params.delete("productId"); // 기존 상품 id 있다면 초기화
      } else {
        params.delete("id");
        params.set("newColor", keyword.trim());
      }

      setResults([]); // 리스트 닫기
      router.push(`?${params.toString()}`);
      alert(`사이트에 등록되지 않은 상품입니다. 새로 추가합니다.`);
    }
  };

  useEffect(() => {
    if (isSelectedRef.current) {
      isSelectedRef.current = false;
      return;
    }
    if (!keyword.trim() || (!isProduct && !productId)) {
      setResults([]);
      return;
    }

    let url = `${Constants.back_url}`;
    if (isProduct) {
      url += `/products?productName=${encodeURIComponent(keyword)}`;
    } else {
      url += `/detailproduct/search?productId=${productId}&colorName=${encodeURIComponent(keyword)}`;
    }
    const timer = setTimeout(async () => {
      // 이전 요청 취소
      controllerRef.current?.abort();
      const controller = new AbortController();
      // 새 요청을 넣어준다.
      controllerRef.current = controller;

      try {
        const response = await fetch(url, {
          // 담당 컨트롤러 연결
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        const data = await response.json();
        if (isProduct) {
          setResults(data.items);
        } else {
          setResults(data);
        }
      } catch (error) {
        console.error(error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, isProduct, productId]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <input
          id={isProduct ? "productSearch" : "detailProductSearch"}
          type="text"
          value={keyword}
          className={styles.searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isProduct ? "브랜드를 선택하세요" : "컬러를 선택하세요"}
          onKeyDown={handleKeyDown}
        />
        <Search className={styles.searchIcon} />
      </div>
      {results.length > 0 && (
        <ul className={styles.resultList}>
          {results.map((item) => (
            <li
              key={item.id}
              className={styles.resultItem}
              onMouseDown={() => {
                handleClick(item);
              }}
            >
              <span className={styles.itemName}>
                {isProduct ? item.name : item.color_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
