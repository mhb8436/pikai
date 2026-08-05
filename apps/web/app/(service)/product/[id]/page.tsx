import type { ProductDetailType } from "@/types/productDetailType";
import ProductDetailClient from "../../../../components/products/productDetailClient";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // const backUrl = process.env.NEXT_PUBLIC_BACK_URL;

  // if (!backUrl) {
  //   return (
  //     <main>
  //       <h1>백엔드 주소가 설정되지 않았습니다.</h1>
  //     </main>
  //   );
  // }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/products/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return (
      <main>
        <h1>상품 정보를 불러오지 못했습니다.</h1>
        <p>상품 번호: {id}</p>
      </main>
    );
  }

  const product: ProductDetailType = await response.json();

  return <ProductDetailClient product={product} />;
}
