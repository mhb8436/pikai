import { RatingItemType } from "@/types/ratingType";
import { Constants } from "@/common/constants";
import styles from "./rating-id.module.css";
import StarRating from "../../../../components/rating/StarRating";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let rating: RatingItemType | null = null;
  let compRatingNum: number = 0;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/user/login");
  }

  try {
    const { id } = await params;
    const response = await fetch(`${Constants.back_url}/rating/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(response.statusText);

    const ratingJson = await response.json();
    if (ratingJson && ratingJson.existRating) {
      rating = ratingJson.existRating;
      compRatingNum = ratingJson.compRatingNum;
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error("별점 가져오는 중 error 내용:", error);
    redirect("/rating");
  }

  if (!rating) {
    return (
      <div>
        <h3> 별점을 불러 올 수 없습니다. 다시 시도해주세요.</h3>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.productInfo}>
        <span className={styles.brandName}>
          {rating.detail_color.products.name}
        </span>
        <span className={styles.productName}>
          {rating.detail_color.color_name}
        </span>
      </div>
      <StarRating rating={rating} compRatingNum={compRatingNum} />
    </div>
  );
}
