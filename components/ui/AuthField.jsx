import styles from "@/css/ui/AuthField.module.css";

export default function AuthField(props) {
  const {
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    disabled,
  } = props;

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required
      />
    </label>
  );
}
