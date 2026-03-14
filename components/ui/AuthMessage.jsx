import styles from "@/css/ui/AuthMessage.module.css";

export default function AuthMessage({ tone = "error", children }) {
  if (!children) {
    return null;
  }

  const toneClass = tone === "success" ? styles.success : styles.error;
  return <p className={`${styles.message} ${toneClass}`}>{children}</p>;
}
