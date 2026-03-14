"use client";

import { useState } from "react";
import AdminFeedbackPage from "@/components/admin/AdminFeedbackPage";
import AdminUnlockPage from "@/components/admin/AdminUnlockPage";

export default function AdminAccessPage() {
  const [adminPassword, setAdminPassword] = useState("");

  if (!adminPassword) {
    return <AdminUnlockPage onUnlock={setAdminPassword} />;
  }

  return <AdminFeedbackPage adminPassword={adminPassword} />;
}
