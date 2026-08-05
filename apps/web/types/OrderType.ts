import { OrderStatus } from "@repo/common";

interface Product {
  id: number;
  name: string;
  color_main_image: string;
}
interface DetailColor {
  color_name: string;
  color_image: string;
  stock: number;
  h: number;
  s: number;
  l: number;
  products: Product;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  detailColor: DetailColor;
}

export interface OrderListType {
  id: number;
  payment: string;
  recipient: string;
  delivery_info: string;
  postal_code: number;
  delivery_inst: string;
  phone_number: string;
  order_status: OrderStatus;
  order_date: string;
  orderItem: OrderItem[];
}
