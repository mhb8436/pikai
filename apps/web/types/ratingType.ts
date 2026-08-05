interface Product {
  name: string;
  color_main_image: string;
}

interface DetailProduct {
  color_name: string;
  h: number;
  s: number;
  l: number;
  products: Product;
}

export interface RatingItemType {
  id: number;
  is_comp: boolean;
  star_rating: number;
  detail_color: DetailProduct;
}
