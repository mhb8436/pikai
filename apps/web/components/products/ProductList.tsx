import Link from "next/link";
import { ProductItemType } from "@/types/productItemType";
import Image from "next/image";
import { Constants } from "@/common/constants";

interface ProductListProps {
  products: ProductItemType[];
}

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return <p>등록된 상품이 없습니다.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "30px",
      }}
    >
      {products.map((product) => {
        const originalPrice = product.price;
        const salePrice = Math.floor(originalPrice * 0.9);

        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            style={{
              display: "block",
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div>
              <Image
                src={`${Constants.image_url}/${product.color_main_image}`}
                alt={product.name}
                width={250}
                height={250}
                style={{
                  display: "block",
                  objectFit: "cover",
                }}
              />

              <h4
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                {product.name}
              </h4>

              {/* 가격 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                {/* 정가 */}
                <span
                  style={{
                    color: "#999",
                    fontSize: "18px",
                    textDecoration: "line-through",
                  }}
                >
                  {originalPrice.toLocaleString()}원
                </span>

                {/* 할인 가격 */}
                <strong
                  style={{
                    color: "#E02020",
                    fontSize: "23px",
                    fontWeight: 700,
                  }}
                >
                  {salePrice.toLocaleString()}원
                </strong>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
