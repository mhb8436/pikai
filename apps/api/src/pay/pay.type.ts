export interface PayItemType {
  detail_color_id: number;
  name: string;
  colorName: string;
  image: string;
  quantity: number;
  price: number;
  sale_price: number;
}

export interface BuyItem {
  detailColorId: number;
  quantity: number;
}
