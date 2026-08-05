import type { ReactNode } from "react";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
