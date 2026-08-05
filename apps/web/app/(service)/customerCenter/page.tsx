import styles from "./customer-center.module.css";
import customerCenter from "@/public/pikai_customer-_center.png";
import Image from "next/image";

export default async function Page() {
  return (
    <div className={styles.centerContainer}>
      <h3 className={styles.titleMain}>고객 센터</h3>
      <div className={styles.imageWrapper}>
        <Image
          src={customerCenter}
          alt={`pikai_customer_center`}
          width={1100}
          height={600}
          loading="eager"
        />
      </div>
    </div>
  );
}
