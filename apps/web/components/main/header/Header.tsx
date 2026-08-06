export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Image from "next/image";
import CategoryNav from "./category-nav";
import UserMenu from "./UserMenu";
import styles from "./Header.module.css";
import SearchBar from "./SearchBar";
import logo from "../../../public/pikai_logo.png";
import { CategoryType } from "@/types/productDetailType";
import { Constants } from "@/common/constants";

export default async function Header() {
  let categories: CategoryType[] = [];

  try {
    const res = await fetch(`${Constants.back_url}/category`);
    if (!res.ok) throw new Error(res.statusText);

    const categoryList: CategoryType[] = await res.json();
    if (!categoryList) {
      alert("카테고리를 가져오는데 실패하였습니다. 다시 시도해주세요");
      throw new Error("카테고리를 가져오는데 실패");
    }
    categories = categoryList;
  } catch (error) {
    console.log(error);
  }

  return (
    <div>
      <div className={styles.userMenu}>
        <UserMenu />
      </div>
      <div className={styles.logo}>
        <a href="/pikai">
          <Image
            src={logo}
            alt={`pikai_logo`}
            width={250}
            height={90}
            loading="eager"
          />
        </a>
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
      <div className={styles.category}>
        <Suspense fallback={null}>
          <CategoryNav categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
