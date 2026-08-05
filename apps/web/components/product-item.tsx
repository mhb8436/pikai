import type { ProductItemType } from "@/types/productItemType";

interface ProductItemProps {
  product: ProductItemType;
}

export default function ProductItem({ product }: ProductItemProps) {
  return (
    <div>
      <div>
        <img src={product.color_main_image} alt={product.name} />
      </div>

      <div>
        <div>{product.name}</div>

        <div>{product.price.toLocaleString()}원</div>
      </div>
    </div>
  );
}
