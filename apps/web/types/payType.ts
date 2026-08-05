export interface PayItemType {
  detail_color_id: number;
  name: string;
  colorName: string;
  image: string;
  quantity: number;
  price: number;
  sale_price: number;
}

export interface DeliveryData {
  recipient: string;
  phone_number: string;
  postal_code: string;
  delivery_info: string;
  delivery_inst?: string;
}

export interface DeliveryInfoProps extends DeliveryData {
  onChange: (data: DeliveryData) => void;
}

export interface PayContainerProps {
  params: {
    isCartOrder?: string;
    detailColorId?: string;
    quantity?: string;
  };
}

export interface PayProps {
  searchParams: Promise<{
    isCartOrder: boolean;
    selectedOnly?: boolean;
  }>;
}
