import type { ReactNode } from "react";

interface CartLayoutProps {
  children: ReactNode;
}

// 장바구니 페이지와 하위 페이지를 보여주는 레이아웃
export default function CartLayout({ children }: CartLayoutProps) {
  return <>{children}</>;
}
