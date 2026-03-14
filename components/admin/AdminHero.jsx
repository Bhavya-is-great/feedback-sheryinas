import styles from "@/css/admin/AdminHero.module.css";

export default function AdminHero({ eyebrow, title, description }) {
  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
