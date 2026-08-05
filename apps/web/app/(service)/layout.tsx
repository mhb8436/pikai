import type { Metadata } from "next";
import "./globals.css";
import Header from "../../components/main/header/Header";
import Footer from "../../components/main/Footer";

export const metadata: Metadata = {
  title: {
    default: "Pikai",
    template: "%s | Pikai",
  },
  description: "Your Perfect Color",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
