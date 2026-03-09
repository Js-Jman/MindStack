"use client";

import { useState } from "react";
import { User, Mail, Phone, Pencil, Save, X } from "lucide-react";

interface OverviewTabProps {
  userId: number;
  initialName: string;
  email: string;       // read-only — never editable
  phoneNumber?: string;
  avatarUrl?: string;
  onSaved?: (data: { name: string; phoneNumber?: string }) => void;
}

export function OverviewTab({
  userId,
  initialName,
  email,
  phoneNumber: initPhone = "",
  onSaved,
}: OverviewTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initPhone);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phoneNumber: phone.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSuccess("Profile updated successfully!");
      setEditing(false);
      onSaved?.({ name: name.trim(), phoneNumber: phone.trim() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(initialName);
    setPhone(initPhone);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Overview</h2>
        {!editing ? (
          <button
            onClick={() => { setEditing(true); setSuccess(""); }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {success}
        </p>
      )}

      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold select-none">
          {initials}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          {editing ? (
            <input
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg">{name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email Address
            <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              read-only
            </span>
          </label>
          <p className="text-sm px-3 py-2 bg-muted rounded-lg text-muted-foreground">
            {email}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Phone Number
          </label>
          {editing ? (
            <input
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              type="tel"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg">
              {phone || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}