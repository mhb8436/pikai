export const personalColorEnum = {
  WARM: "WARM",
  COOL: "COOL",
  SPRINGWARM: "SPRINGWARM",
  SUMMERCOOL: "SUMMERCOOL",
  FALLWARM: "FALLWARM",
  WINTERCOOL: "WINTERCOOL",
  FALLDEEP: "FALLDEEP",
  WINTERDEEP: "WINTERDEEP",
  SUMMERMUTE: "SUMMERMUTE",
  FALLMUTE: "FALLMUTE",
} as const;

export type personalColorEnum =
  (typeof personalColorEnum)[keyof typeof personalColorEnum];

export const OrderStatus = {
  AWAITING: "AWAITING", //결제 대기
  PAYCOMPLETED: "PAYCOMPLETED", // 결제 완료
  TRANSIT: "TRANSIT", // 배송중
  DELCOMPLETED: "DELCOMPLETED", // 배송 완료
  REFUND: "REFUND", // 환불
  RETURNS: "RETURNS", // 반품
  EXCHANGE: "EXCHANGE", //교환
  ConfirmPurchase: "ConfirmPurchase",
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusKor: Record<OrderStatus, string> = {
  [OrderStatus.AWAITING]: "결제 대기",
  [OrderStatus.PAYCOMPLETED]: "결제 완료",
  [OrderStatus.TRANSIT]: "배송중",
  [OrderStatus.DELCOMPLETED]: "배송 완료",
  [OrderStatus.REFUND]: "환불",
  [OrderStatus.RETURNS]: "반품",
  [OrderStatus.EXCHANGE]: "교환",
  [OrderStatus.ConfirmPurchase]: "구매확정",
};

export type OrderStatusKor =
  (typeof OrderStatusKor)[keyof typeof OrderStatusKor];
