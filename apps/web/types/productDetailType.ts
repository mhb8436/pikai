export interface CategoryType {
  id: number;
  name: string;
}

export interface BrandType {
  id: number;
  name: string;
}

export interface DetailColorType {
  id: number;
  color_name: string;
  color_image: string;
  stock: number;
  h: number;
  s: number;
  l: number;
  product_id: number;
}

export interface ProductDetailType {
  id: number;
  color_main_image: string;
  color_detail_image: string;
  name: string;
  hash_tag: string[];
  price: number;
  is_sale: boolean;
  category_id: number;
  brand_id: number;

  category: CategoryType;
  brand: BrandType;

  detail_color: DetailColorType[];
}
