import { useMemo, useState } from "react";
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
    enablePasswordToggle = false,
  } = props;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password" && enablePasswordToggle;
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;
  const toggleLabel = useMemo(
    () => (isPasswordVisible ? "Hide password" : "Show password"),
    [isPasswordVisible]
  );

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={isPasswordField ? styles.inputWrap : undefined}>
        <input
          className={styles.input}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        {isPasswordField ? (
          <button
            className={styles.toggle}
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={toggleLabel}
            aria-pressed={isPasswordVisible}
            disabled={disabled}
          >
            {isPasswordVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        ) : null}
      </span>
    </label>
  );
}

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A11.5 11.5 0 0 1 12 6c6.7 0 10.5 6 10.5 6a18.6 18.6 0 0 1-4 4.4" />
      <path d="M6.7 6.7A18.6 18.6 0 0 0 1.5 12s3.8 6 10.5 6c1.4 0 2.7-.3 3.9-.7" />
      <path d="M9.9 9.9A3.2 3.2 0 0 0 9 12a3.25 3.25 0 0 0 5.1 2.7" />
    </svg>
  );
}
