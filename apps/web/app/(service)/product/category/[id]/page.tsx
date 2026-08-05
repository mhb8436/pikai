"use client";

import { use, useEffect, useState } from "react";

import ProductList from "../../../../../components/products/ProductList";
import SortMenu from "../../../../../components/products/SortMenu";
import Pagination from "../../../../../components/products/Pagination";
import { useSearchParams } from "next/navigation";

import type { ProductItemType } from "@/types/productItemType";
import type { ProductSortType } from "@/types/productSortTyps";

interface CategoryProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryProductPage({
  params,
}: CategoryProductPageProps) {
  const { id } = use(params);

  const [products, setProducts] = useState<ProductItemType[]>([]);

  const [selectedSort, setSelectedSort] = useState<ProductSortType>("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  // 카테고리 상품 전체 개수
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const limit = 10;
  // 현재 카테고리의 전체 페이지 수
  const totalPage = Math.max(1, Math.ceil(total / limit));

  const handleSortChange = (sort: ProductSortType) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const backUrl = process.env.NEXT_PUBLIC_BACK_URL;

        let url = `${backUrl}/products?page=${currentPage}&limit=10&sort=${selectedSort}&categoryId=${id}`;
        if (q) {
          url += `&productName=${encodeURIComponent(q)}`;
        }
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("카테고리 상품을 불러오지 못했습니다.");
        }

        const data = await response.json();

        // API가 배열을 반환하는 경우와
        // { items: [...] } 형태를 반환하는 경우 모두 처리
        //setProducts(data.items ?? data);
        setProducts(data.items ?? []);
        setTotal(data.total ?? 0);

        /**
         * 2. 전체 카테고리 목록 가져오기
         *
         * 응답 예시:
         * [
         *   { id: 1, name: "lip" },
         *   { id: 2, name: "cheek" }
         * ]
         */
        const categoryResponse = await fetch(`${backUrl}/category`);

        if (!categoryResponse.ok) {
          throw new Error("카테고리 정보를 불러오지 못했습니다.");
        }

        const categoryData: {
          id: number;
          name: string;
        }[] = await categoryResponse.json();

        /**
         * 현재 주소의 id와 같은 카테고리 찾기
         *
         * /product/category/1 → lip
         * /product/category/2 → cheek
         */
        const currentCategory = categoryData.find(
          (category) => category.id === Number(id),
        );

        setCategoryName(currentCategory?.name ?? "카테고리");
      } catch (error) {
        console.error(error);

        setError("카테고리 상품을 불러오는 중 오류가 발생했습니다.");

        setCategoryName("카테고리");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id, currentPage, selectedSort, q]);

  if (loading) {
    return <p>상품을 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 40px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "25px",
        }}
      >
        {categoryName} 상품{" "}
      </h1>

      <SortMenu selectedSort={selectedSort} onSortChange={handleSortChange} />

      {products.length === 0 ? (
        <p>해당 카테고리의 상품이 없습니다.</p>
      ) : (
        <ProductList products={products} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPage={totalPage}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
