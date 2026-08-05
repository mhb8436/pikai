"use client";

import { RatingItemType } from "@/types/ratingType";
import { Constants } from "@/common/constants";
import Image from "next/image";
import { Star } from "lucide-react";
import styles from "./Rating-item.module.css";
import { useRouter } from "next/navigation";

interface RatingItemProps {
  ratingItem: RatingItemType;
  isSelected?: boolean;
  onSelect?: (id: number, isChecked: boolean) => void;
  setComDel?: (id: number) => void;
}

type CssVariables = React.CSSProperties & {
  "--color": string;
};
export default function RatingItem({
  ratingItem,
  isSelected,
  onSelect,
  setComDel,
}: RatingItemProps) {
  const router = useRouter();
  const color_main_image = ratingItem.detail_color.products.color_main_image;
  const imageURL = `${Constants.image_url}/${color_main_image}`;
  const { color_name, h, s, l } = ratingItem.detail_color;
  const { name } = ratingItem.detail_color.products;
  const { id, star_rating } = ratingItem;

  const handleOneClick = () => {
    if (onSelect) {
      onSelect(id, !isSelected);
    } else if (setComDel) {
      setComDel(id);
    }
  };
  const handleTwoClick = () => {
    if (onSelect) {
      router.push(`/rating/${id.toString()}`);
    }
  };

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      /*  변수 주입해서 css에서 사용*/
      style={
        {
          "--color": `${h} ${s}% ${l}%`,
        } as CssVariables
      }
      onClick={handleOneClick}
      onDoubleClick={handleTwoClick}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageURL}
          fill
          sizes={"(max-width: 768px) 50vw, 20vw"}
          priority={false}
          alt={`${name}-${color_name} 의 사진입니다.`}
          loading="eager"
        />
      </div>
      <div className={styles.infoWrapper}>
        {name}
        <div className={styles.itemName}>{color_name}</div>
      </div>
      <div className={styles.rating}>
        <Star size={16} fill="#ffa39a" color="#ffa39a" />
        <span>{star_rating}</span>
      </div>
    </article>
  );
}
