"use client";
import Link from "next/link";
import styles from "./category-nav.module.css";
import { CategoryType } from "@/types/productDetailType";
import { useSearchParams } from "next/navigation";

interface CategoryNavProps {
  categories: CategoryType[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  return (
    <div>
      <nav className={styles.nav}>
        <Link className={styles.link} href={`/product`}>
          전체 상품
        </Link>
        {categories?.map((category) =>
          q ? (
            <Link
              key={category.id}
              href={`/product/category/${category.id}?q=${encodeURIComponent(q)}`}
              className={styles.link}
            >
              {category.name}
            </Link>
          ) : (
            <Link
              key={category.id}
              href={`/product/category/${category.id}`}
              className={styles.link}
            >
              {category.name}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
