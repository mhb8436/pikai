import Image from "next/image";
import styles from "./page.module.css";
import Ranking from "../../components/ranking/Ranking";
import { ChevronsRight } from "lucide-react";
import mainBanner from "../../public/pikai_mainbanner.png";

export default async function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.image}
          src={mainBanner}
          alt="광고 배너 이미지"
          width={1300}
          height={600}
          loading="eager"
        />
        <Ranking />
        <a href="/pikai/product" className={styles.button}>
          전체 상품 보러가기
          <ChevronsRight />
        </a>
      </main>
    </div>
  );
}
