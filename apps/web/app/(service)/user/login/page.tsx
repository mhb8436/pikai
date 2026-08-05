import LoginForm from "@/components/login/Loginform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "pikai 로그인 페이지입니다. pikai에 로그인하고 나만의 화장대를 만들어보고 자신에게 맞는 상품을 구매해보세요!",
};

export default async function Page() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
