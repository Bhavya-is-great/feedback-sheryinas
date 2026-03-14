import styles from "@/css/ui/AuthShell.module.css";

export default function AuthShell({ badge, title, description, children }) {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.copy}>
          <span className={styles.badge}>{badge}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.card}>{children}</div>
      </section>
    </main>
  );
}
