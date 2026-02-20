"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Mail, Shield, Save, KeyRound, Eye, EyeOff } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function ProfileSheet({ isOpen, onClose, userId }: ProfileSheetProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setForm({ name: data.name, email: data.email });
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load profile" }));
  }, [isOpen, userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUser(updated);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.newPassword }),
      });
      if (!res.ok) throw new Error("Failed to update password");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
      setMessage({ type: "success", text: "Password updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setIsSaving(false);
    }
  };

  const roleColor =
    user?.role === "INSTRUCTOR"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Avatar + role badge */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold select-none">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColor}`}>
              {user?.role ?? "—"}
            </span>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profile fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              {isEditing ? (
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              ) : (
                <p className="text-sm px-3 py-2 bg-muted rounded-lg">{user?.name ?? "—"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              {isEditing ? (
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm px-3 py-2 bg-muted rounded-lg">{user?.email ?? "—"}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Role
              </label>
              <p className="text-sm px-3 py-2 bg-muted rounded-lg">{user?.role ?? "—"}</p>
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setForm({ name: user?.name ?? "", email: user?.email ?? "" });
                  }}
                  className="px-4 py-2 border text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsEditing(true); setMessage(null); }}
                className="flex-1 px-4 py-2 border text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Password section */}
          <div className="space-y-3">
            <button
              onClick={() => { setShowPasswordSection((p) => !p); setMessage(null); }}
              className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Reset Password
              </span>
              <span className="text-xs text-muted-foreground">{showPasswordSection ? "Close" : "Open"}</span>
            </button>

            {showPasswordSection && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">New Password</label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2 pr-10 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    type="password"
                    placeholder="Repeat password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
