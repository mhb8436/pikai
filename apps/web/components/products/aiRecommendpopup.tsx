"use client";

import styles from "./aiRecommend-popup.module.css";

// ===========================================
// 부모(ProductDetailClient)로부터 받을 데이터 타입
// ===========================================
interface AIRecommendPopupProps {
  isAiLoading: boolean;
  open: boolean; // 팝업 열림 여부
  title: string; // AI 추천 제목
  message: string; // AI 추천 내용
  score: number; // AI 추천 점수
  aiError: string | null;
  onClose: () => void; // 닫기 버튼 클릭
}

// ===========================================
// AI 추천 팝업
// ===========================================
export default function AIRecommendPopup({
  open,
  title,
  message,
  score,
  isAiLoading,
  aiError,
  onClose,
}: AIRecommendPopupProps) {
  // open이 false면 아무것도 그리지 않는다.
  if (!open) return null;
  if (isAiLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.popup}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingTitle}>AI 색상 추천 분석 중입니다.</p>

            <p className={styles.loadingDesc}>
              선택하신 상품 색상이 회원님께 <br />잘 어울리는지 분석하고
              있습니다.
              <br />
              <br />
            </p>

            <p className={styles.loadingDesc}>
              약 10~15초 정도 소요될 수 있습니다.
              <br />
              <br /> 잠시만 기다려 주세요.
              <br />
              <br />
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (aiError) {
    return (
      <div className={styles.overlay}>
        <div className={styles.popup}>
          <h2>AI 추천 실패</h2>

          <p>{aiError}</p>

          <button onClick={onClose}>확인</button>
        </div>
      </div>
    );
  }

  // 기존 추천 AI 결과 JSX
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* 제목 */}
        <h2>{title}</h2>

        {/* 점수 */}
        <p className={styles.score}>추천 점수 : {score}점</p>

        {/* 추천 내용 */}
        <p className={styles.message}>{message}</p>

        {/* 확인 버튼 */}
        <button className={styles.button} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
