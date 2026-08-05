interface Product {
  id: number;
  color_main_image: string;
  name: string;
  // 장바구니 화면에서 원래 상품가격을 표시할 때 사용
  price: number;
}

interface DetailProduct {
  id: number;
  color_name: string;
  stock: number;
  products: Product;
}

interface CartItem {
  id: number;
  cart_id: number;
  quantity: number;
  is_selected: boolean;
  is_now: boolean;
  price: number;
  detailColor: DetailProduct;
}

interface User {
  name: string;
  postal_code: string;
  address: string;
  phone: string;
}

export interface Cart {
  id: number;
  cartItems: CartItem[];
  user: User;
}
