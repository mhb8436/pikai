import Image from "next/image";
import styles from "./Ranking-item.module.css";
import { Trophy } from "lucide-react";
import { RankingItemProps } from "@/types/rankingType";
import { Constants } from "@/common/constants";

export default function RankingItem({ tone, rank }: RankingItemProps) {
  const imageUrl = `${Constants.image_url}/${tone.detailColor.products.color_main_image}`;
  return (
    <div className={styles.card}>
      <div className={styles.rank}>
        {rank === 1 && <Trophy color="#FFD700" size={27} />}
        {rank === 2 && <Trophy color="#C0C0C0" size={27} />}
        {rank === 3 && <Trophy color="#CD7F32" size={27} />}
        {rank > 3 && <span>{rank}</span>}
      </div>
      <Image
        className={styles.image}
        src={imageUrl}
        alt={tone.detailColor.color_name}
        width={70}
        height={70}
      />

      <div className={styles.info}>
        <p className={styles.productName}>{tone.detailColor.products.name}</p>

        <p className={styles.colorName}>{tone.detailColor.color_name}</p>
      </div>
    </div>
  );
}
