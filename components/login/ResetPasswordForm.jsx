"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import AuthMessage from "@/components/ui/AuthMessage";
import styles from "@/css/login/ResetPasswordForm.module.css";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is invalid or missing.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/reset-password", {
        token,
        ...form,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setSuccess(data.message);
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
        label="New Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Create a strong password"
        autoComplete="new-password"
        disabled={isSubmitting}
      />
      <AuthField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Repeat your password"
        autoComplete="new-password"
        disabled={isSubmitting}
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthMessage tone="success">{success}</AuthMessage>
      <AuthButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Reset Password"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  );
}
