"use client";

import { useEffect, useState } from "react";
import { ProductItemType } from "@/types/productItemType";
import { ProductSortType } from "@/types/productSortTyps";
import Pagination from "../../../components/products/Pagination";
import ProductList from "../../../components/products/ProductList";
import SortMenu from "../../../components/products/SortMenu";
import { useSearchParams } from "next/navigation";

interface ProductResponseType {
  items: ProductItemType[];
  total: number;
  page: number;
  limit: number;
}

export default function Page() {
  const [products, setProducts] = useState<ProductItemType[]>([]);
  const [selectedSort, setSelectedSort] = useState<ProductSortType>("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const limit = 10;

  const totalPage = Math.max(1, Math.ceil(total / limit));

  const handleSortChange = (sort: ProductSortType) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPage) {
      return;
    }

    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        let url = `${process.env.NEXT_PUBLIC_BACK_URL}/products?page=${currentPage}&limit=${limit}&sort=${selectedSort}`;
        if (q) {
          url += `&productName=${encodeURIComponent(q)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("상품 목록을 가져오지 못했습니다.");
        }

        const data: ProductResponseType = await response.json();

        setProducts(data.items);
        setTotal(data.total);
      } catch (error) {
        console.error(error);
        setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedSort, currentPage, q]);

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 40px",
        boxSizing: "border-box",
      }}
    >
      {q ? (
        <h2 style={{ marginBottom: "3rem" }}>{q}에 대한 검색결과 입니다.</h2>
      ) : (
        ""
      )}

      <h1
        style={{
          fontSize: "25px",
        }}
      >
        전체 상품
      </h1>

      <SortMenu selectedSort={selectedSort} onSortChange={handleSortChange} />

      {loading && <p>상품을 불러오는 중입니다.</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <ProductList products={products} />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
