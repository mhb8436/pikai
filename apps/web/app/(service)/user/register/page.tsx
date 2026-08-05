import SignUpForm from "@/components/register/SignUpform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description:
    "pikai 회원가입 페이지입니다. pikai에 가입하고 나만의 화장대를 만들어보세요.",
};

export default async function Page() {
  return (
    <div>
      <SignUpForm />
    </div>
  );
}
