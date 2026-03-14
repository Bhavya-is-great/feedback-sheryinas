import styles from "@/css/admin/AdminMetrics.module.css";

export default function AdminMetrics({ items }) {
  return (
    <section className={styles.metrics}>
      {items.map((item) => (
        <article key={item.label} className={styles.card}>
          <span className={styles.label}>{item.label}</span>
          <strong className={styles.value}>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}
