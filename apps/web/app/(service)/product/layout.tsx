import { Suspense } from "react";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <div>{children}</div>
    </Suspense>
  );
}
