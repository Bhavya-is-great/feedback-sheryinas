"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import styles from "@/css/login/LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/login", form);

      if (!data.success) {
        throw new Error(data.message || "Unable to log in.");
      }

      toast.success(data.message || "Logged in successfully.");
      router.replace("/");
      router.refresh();
    } catch (submitError) {
      const responseData = submitError.response?.data;
      const message = responseData?.message || submitError.message;

      if (responseData?.data?.requiresOtpVerification) {
        toast.info(message);
        router.replace("/verify-otp");
        router.refresh();
        return;
      }

      toast.error(message);
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
        enablePasswordToggle
      />
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
