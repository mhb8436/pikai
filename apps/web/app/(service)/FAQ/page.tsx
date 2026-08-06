export const dynamic = "force-dynamic";
import styles from "./FAQ.module.css";

export default async function Page() {
  return (
    <div className={styles.QAContainer}>
      <div className={styles.titleMain}>
        <p>작성된 FAQ가 없습니다.</p>
      </div>
    </div>
  );
}
