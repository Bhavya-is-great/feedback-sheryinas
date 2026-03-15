"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import styles from "@/css/login/ResetPasswordForm.module.css";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      toast.error("This reset link is invalid or missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/reset-password", {
        token,
        ...form,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      toast.success(data.message);
      router.replace("/");
      router.refresh();
    } catch (submitError) {
      toast.error(submitError.response?.data?.message || submitError.message);
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
      <AuthButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Reset Password"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  );
}
