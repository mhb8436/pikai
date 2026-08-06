export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import PersonalColor from "../../../components/rating/PersonalColor";
import { Constants } from "@/common/constants";
import { redirect } from "next/navigation";
import styles from "./rating.module.css";
import { RatingItemType } from "@/types/ratingType";
import RatingList from "../../../components/rating/RatingList";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "나만의 온라인 화장대",
  description:
    "가지고 있는 상품을 온라인에서 바로 확인할 수 있는 단 하나 뿐인 화장대입니다.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  let compRating: RatingItemType[] = [];
  let ratings: RatingItemType[] = [];
  let totalPage = 1;

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const { page } = await searchParams;

  if (!token) {
    redirect("/user/login");
  }

  const currentPage = Number(page) || 1;

  // 비교 상품 과 전체 상품 가져오기
  try {
    const response = await fetch(`${Constants.back_url}/rating/comp`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(response.statusText);

    const compData = await response.json();
    // 비교 상품 가져오기
    if (compData) {
      compRating = compData;
    }
  } catch (error) {
    console.error(error);
  }

  if (compRating.length < 1) {
    redirect("/rating/add?error=noComp");
  }
  // 전체 별 점 매긴 화장품 가져오기
  try {
    const response = await fetch(
      `${Constants.back_url}/rating?page=${Number(currentPage)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error(response.statusText);
    const ratingJson = await response.json();
    const ratingData = ratingJson?.rating;
    totalPage = ratingJson?.totalPage;
    if (ratingData) {
      ratings = ratingData;
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <h3 className={styles.titleMain}>나만의 온라인 화장대</h3>
      <PersonalColor />
      <hr className={styles.line} />
      <h3 className={styles.titleMain}>비교 상품</h3>
      <div
        className={styles.helpTextContainer}
        style={{ marginBottom: "4rem" }}
      >
        <p className={styles.helpText}>
          비교 상품에 마우스를 올리면 비교 상품의 컬러를 확인하실 수 있습니다.
        </p>
        <p className={styles.helpText}>
          비교 상품 삭제를 원하시면 해당 상품을 두번 클릭 해주세요
        </p>
        <p className={styles.helpText}>
          ※ 비교 상품에서만 삭제 되고 밑의 전체 상품에서는 삭제가 안됩니다.
        </p>
        <p className={styles.helpText}>
          비교 상품 별점 수정은 밑의 전체 상품 별점에서 가능합니다.
        </p>
      </div>
      <RatingList ratingItem={compRating} is_com={true} />
      <hr className={styles.line} />
      <h3 className={styles.titleMain}>전체 상품</h3>
      <div className={styles.helpTextContainer}>
        <p className={styles.helpText}>
          상품에 마우스를 올리면 비교 상품의 컬러를 확인하실 수 있습니다.
        </p>
        <p className={styles.helpText}>
          상품의 별점 수정을 원하시면 해당 상품을 두번 클릭 해주세요
        </p>
        <p className={styles.helpText}>
          상품 별점 삭제를 원하시면 한번 클릭 후 삭제 버튼을 눌러주세요 (여러
          상품 가능)
        </p>
      </div>
      {ratings ? (
        <RatingList
          ratingItem={ratings}
          is_com={false}
          totalPageNum={totalPage}
          currentPageNum={currentPage}
        />
      ) : (
        <p>상품의 별점을 매겨주세요.</p>
      )}
    </div>
  );
}
