"use client";
import { RatingItemType } from "@/types/ratingType";
import { useState } from "react";
import RatingItem from "./Rating-item";
import { Trash2 } from "lucide-react";
import styles from "./RatingList.module.css";
import { Constants } from "@/common/constants";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

interface RatingItemProps {
  ratingItem: RatingItemType[];
  is_com: boolean;
  totalPageNum?: number;
  currentPageNum?: number;
}
export default function RatingList({
  ratingItem,
  is_com,
  totalPageNum,
  currentPageNum,
}: RatingItemProps) {
  const router = useRouter();
  const [selectDelIds, setSelectDelIds] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const token = Cookies.get("accessToken");

  // 별점 클릭 시 삭제할 별점 id 저장
  const handleDelSelect = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectDelIds((prev) => [...prev, id]);
    } else {
      setSelectDelIds((prev) => prev.filter((rating) => rating !== id));
    }
  };

  const handleNavigateTOAddPage = () => {
    router.push(`/rating/add`);
  };

  const handlePageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNum));

    router.push(`?${params.toString()}`);
  };

  const range: (number | string)[] = [];

  if (totalPageNum && currentPageNum) {
    // 페이지가 5개 이하일 경우 그냥 다 보여주기
    if (totalPageNum <= 5) {
      for (let i = 1; i <= totalPageNum; i++) {
        range.push(i);
      }
    } else {
      range.push(1);

      let start = currentPageNum - 1;
      let end = currentPageNum + 1;

      if (start <= 2) {
        start = 2;
        end = 4;
      }

      if (end >= totalPageNum - 1) {
        start = totalPageNum - 3;
        end = totalPageNum - 1;
      }

      if (start > 2) {
        range.push("...");
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (end < totalPageNum - 1) {
        range.push("...");
      }

      range.push(totalPageNum);
    }
  }
  const handleDelete = async () => {
    if (selectDelIds.length < 0) return alert("선택한 상품의 별점이 없습니다.");

    if (confirm(`선택한 ${selectDelIds.length}개의 별점을 지우시겠습니까??`)) {
      try {
        const response = await fetch(
          `${Constants.back_url}/rating?ids=${selectDelIds.join(",")}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          alert("별점 삭제 중 오류가 발생했습니다.");
          throw new Error(response.statusText);
        }
        setSelectDelIds([]);
        alert("성공적으로 별점이 삭제되었습니다.");
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleComDelete = async (id: number) => {
    if (id === 0) {
      return alert("삭제할 비교상품을 두번 클릭 해 선택해주세요");
    }

    if (confirm(`선택한 비교 상품을 지우시겠습니까?`)) {
      try {
        const response = await fetch(`${Constants.back_url}/rating/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_comp: false,
          }),
        });

        if (!response.ok) {
          alert("비교 상품 삭제 중 오류가 발생했습니다.");
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        alert("비교 상품 삭제가 성공적으로 완료되었습니다.");
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <div>
      <div>
        {is_com ? (
          <div>
            <ul className={styles.cardList}>
              {ratingItem.map((rating) => (
                <li key={rating.id}>
                  <RatingItem ratingItem={rating} setComDel={handleComDelete} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <div className={styles.actionGroup}>
              <button
                className={`${styles.btn} ${styles.btnSave}`}
                onClick={handleNavigateTOAddPage}
              >
                비교 상품 추가
              </button>
              <button
                onClick={handleDelete}
                className={`${styles.btn} ${styles.btnCancel}`}
                disabled={selectDelIds.length === 0}
              >
                <Trash2 className={styles.trash} />
              </button>
            </div>
            <ul className={styles.cardList}>
              {ratingItem.map((rating) => (
                <li key={rating.id}>
                  <RatingItem
                    ratingItem={rating}
                    isSelected={selectDelIds.includes(rating.id)}
                    onSelect={handleDelSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className={styles.pagination}>
        {range.map((page, index) => {
          // '...' 문자인 경우 버튼이 아닌 그냥 일반 글자로 띄우기
          if (page === "...") {
            return <span key={`ellipsis-${index}`}>...</span>;
          }

          // 숫자 페이지 버튼인 경우
          return (
            <button
              key={`page-${index}`}
              onClick={() => handlePageChange(Number(page))}
              /* 현재 페이지와 번호가 일치하면 active 클래스를 줘서 색을 다르게 만듭니다 */
              className={`${styles.pageButton} ${currentPageNum === page ? styles.active : ""}`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
}
