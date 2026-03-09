// components/profile/ChangePasswordTab.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

interface ChangePasswordTabProps {
  userId: number;
}

export function ChangePasswordTab({ userId }: ChangePasswordTabProps) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleShow = (key: keyof typeof show) => () =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return setError("All three fields are required.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError("New password and confirm password do not match.");
    }
    if (form.newPassword.length < 8) {
      return setError("New password must be at least 8 characters.");
    }
    if (form.newPassword === form.oldPassword) {
      return setError("New password must be different from the current password.");
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update password");
      setSuccess("Password updated successfully!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const strength =
    form.newPassword.length === 0
      ? null
      : form.newPassword.length < 8
      ? "weak"
      : form.newPassword.length < 12
      ? "moderate"
      : "strong";

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Change Password</h2>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <ShieldCheck className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Current password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Current Password
          </label>
          <div className="relative">
            <input
              className="w-full px-3 py-2 pr-10 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              type={show.old ? "text" : "password"}
              value={form.oldPassword}
              onChange={update("oldPassword")}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={toggleShow("old")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            New Password
          </label>
          <div className="relative">
            <input
              className="w-full px-3 py-2 pr-10 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              type={show.new ? "text" : "password"}
              value={form.newPassword}
              onChange={update("newPassword")}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={toggleShow("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {strength && (
            <div className="space-y-1 pt-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength === "weak"
                      ? "w-1/4 bg-red-400"
                      : strength === "moderate"
                      ? "w-2/3 bg-yellow-400"
                      : "w-full bg-green-400"
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground capitalize">{strength} password</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              className="w-full px-3 py-2 pr-10 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              type={show.confirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={toggleShow("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show.confirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {/* Match indicator */}
          {form.confirmPassword.length > 0 && (
            <p
              className={`text-xs ${
                form.newPassword === form.confirmPassword
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {form.newPassword === form.confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Updating…" : "Update Password"}
      </button>
    </div>
  );
}