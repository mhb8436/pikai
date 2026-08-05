import Link from "next/link";
import RankingItem from "./Ranking-item";
import styles from "./Ranking.module.css";
import { Constants } from "../../common/constants";
import { ToneResponse } from "@/types/rankingType";
import { cookies } from "next/headers";

export default async function Ranking() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const url = token
    ? `${Constants.back_url}/tone/me`
    : `${Constants.back_url}/tone`;

  let tones: ToneResponse;

  try {
    const res = await fetch(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("정보를 불러오지 못했습니다.");
    }

    tones = await res.json();
  } catch (err) {
    console.error(err);
    return <div>상품 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{tones.title}</h2>
      <div className={styles.list}>
        {tones.products.map((tone, index) => (
          <Link
            key={tone.detail_color_id}
            href={`/product/${tone.detailColor.products.id}`}
          >
            <RankingItem
              key={tone.detail_color_id}
              tone={tone}
              rank={index + 1}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
