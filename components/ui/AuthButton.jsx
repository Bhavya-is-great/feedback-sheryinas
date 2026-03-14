import styles from "@/css/ui/AuthButton.module.css";

export default function AuthButton({ children, ...props }) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}
