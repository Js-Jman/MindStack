"use client";

import { useState } from "react";
import { GraduationCap, Lightbulb, Star, Pencil, Save, X } from "lucide-react";

interface StudentPersonalDetailsTabProps {
  userId: number;
  initialCollegeName?: string;
  initialSkills?: string;
  initialInterests?: string;
}

export function StudentPersonalDetailsTab({
  userId,
  initialCollegeName = "",
  initialSkills = "",
  initialInterests = "",
}: StudentPersonalDetailsTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collegeName, setCollegeName] = useState(initialCollegeName);
  const [skills, setSkills] = useState(initialSkills);
  const [interests, setInterests] = useState(initialInterests);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeName, skills, interests }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSuccess("Educational details updated successfully!");
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setCollegeName(initialCollegeName);
    setSkills(initialSkills);
    setInterests(initialInterests);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Personal Details</h2>
        {!editing ? (
          <button
            onClick={() => { setEditing(true); setSuccess(""); }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
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

      <div className="grid gap-5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> College / Institution
          </label>
          {editing ? (
            <input
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Anna University, Chennai"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[2.5rem] flex items-center">
              {collegeName || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Skills
          </label>
          {editing ? (
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. JavaScript, Python, Machine Learning, Data Analysis"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[3rem]">
              {skills || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> Interests
          </label>
          {editing ? (
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. AI, Web Development, Data Science, Open Source"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[3rem]">
              {interests || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}