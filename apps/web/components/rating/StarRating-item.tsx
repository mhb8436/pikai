import { Star } from "lucide-react";
import styles from "./StarRating-item.module.css";

interface StartRatingItemProps {
  score: number;
  setScore: (score: number) => void;
  isComp: boolean;
  setIsComp: (isComp: boolean) => void;
}

export default function StarRatingItem({
  score,
  setScore,
  isComp,
  setIsComp,
}: StartRatingItemProps) {
  const handleToggle = () => {
    setIsComp(!isComp);
  };

  return (
    <div>
      <div className={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((num) => {
          const isFilled = num <= score;

          return (
            <button
              key={num}
              onClick={() => setScore(num)}
              className={styles.starButton}
            >
              {isFilled ? (
                <Star size={80} fill="#ffa39a" color="#ffa39a" />
              ) : (
                <Star size={80} />
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.container}>
        <span onClick={handleToggle} className={styles.label}>
          비교 상품 별점
        </span>
        <button
          onClick={handleToggle}
          className={`${styles.switch} ${isComp ? styles.active : ""}`}
        >
          <span className={`${styles.handle} ${isComp ? styles.moved : ""}`} />
        </button>
      </div>
    </div>
  );
}
