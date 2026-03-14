"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import AuthMessage from "@/components/ui/AuthMessage";
import styles from "@/css/login/LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/login", form);

      if (!data.success) {
        throw new Error(data.message || "Unable to log in.");
      }

      router.replace("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AuthField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Enter your password"
        autoComplete="current-password"
        disabled={isSubmitting}
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log In"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </form>
  );
}
