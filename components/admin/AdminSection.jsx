import styles from "@/css/admin/AdminSection.module.css";

export default function AdminSection({ title, description, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
