import SideBar from "@/components/mypage/side-bar";
import styles from "./layout.module.css";
import { cookies } from "next/headers";
import { Constants } from "@/common/constants";
import { redirect } from "next/navigation";

export default async function ChangeUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let user = null;

  if (!token) {
    redirect("/user/login");
  }

  if (token) {
    try {
      const response = await fetch(`${Constants.back_url}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(response.statusText);

      if (response.ok) {
        user = await response.json();
      }
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <SideBar />
      </aside>

      <section className={styles.content}>{children}</section>
    </div>
  );
}
