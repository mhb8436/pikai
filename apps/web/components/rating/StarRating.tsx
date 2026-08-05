"use client";
import styles from "./StarRating.module.css";
import { useState } from "react";
import { RatingItemType } from "@/types/ratingType";
import { useRouter } from "next/navigation";
import { Constants } from "@/common/constants";
import StarRatingItem from "./StarRating-item";
import Cookies from "js-cookie";

interface StarRatingProps {
  rating?: RatingItemType;
  compRatingNum: number;
  detailColorId?: number;
}

export default function StarRating({
  rating,
  detailColorId,
  compRatingNum,
}: StarRatingProps) {
  const router = useRouter();
  const [score, setScore] = useState<number>(rating?.star_rating || 0);
  const [isComp, setIsComp] = useState<boolean>(rating?.is_comp || false);
  const token = Cookies.get("accessToken");

  const handleRatingChange = async () => {
    if (score < 1) return alert("별을 1개 이상 선택 해주세요");

    try {
      let response;
      if (rating) {
        const requestBody: {
          star_rating: number;
          is_comp?: boolean;
        } = {
          star_rating: score,
        };
        if (isComp !== rating.is_comp) {
          if (compRatingNum >= 10) {
            alert(`비교 상품은 10개까지만 추가 가능합니다`);
            return setIsComp(false);
            //한 개 이상 있을 경우 오류 나는 것 수정! (비교상품 추가 또는 수정 시 )
          } else if (!isComp && compRatingNum - 1 === 0) {
            alert(`비교 상품은 하나 이상 필수입니다!`);
            return setIsComp(true);
          }
          if (rating) requestBody.is_comp = isComp;
        }
        response = await fetch(`${Constants.back_url}/rating/${rating.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        if (isComp) {
          if (compRatingNum >= 10) {
            alert(`비교 상품은 10개까지만 추가 가능합니다`);
            return setIsComp(false);
          }
        } else if (compRatingNum === 0 && (!detailColorId || !isComp)) {
          alert(` * 비교 상품은 이미 있는 상품으로 한 개 이상 추가해주세요!`);
          return setIsComp(true);
        }

        if (!detailColorId) {
          alert(
            "오전 9시에서 오후 6시 사이에 담당자가 해당 상품 컬러를 추가하겠습니다.",
          );
          router.push(`/rating?page=1`);
          return;
        }

        const requestBody = {
          star_rating: score,
          is_comp: isComp,
          detail_color_id: Number(detailColorId),
        };
        response = await fetch(`${Constants.back_url}/rating`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.statusCode === 409) {
          alert(errorData.message);
          alert(errorData.message);
          return router.push(`/rating?page=1`);
        }
        alert("요청 중 문제가 발생했습니다.");
        return;
      }

      alert("저장이 성공적으로 완료되었습니다.");
      router.push(`/rating?page=1`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <p className={styles.questionTitle}>이 상품의 컬러는 만족스러우셨나요?</p>
      <StarRatingItem
        score={score}
        setScore={setScore}
        setIsComp={setIsComp}
        isComp={isComp}
      />
      <div className={styles.actionArea}>
        <button className={styles.okButton} onClick={handleRatingChange}>
          저장
        </button>
      </div>
    </div>
  );
}
