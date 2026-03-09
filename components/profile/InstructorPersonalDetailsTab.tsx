"use client";

import { useState } from "react";
import {
  FileText, Building2, Briefcase,
  Linkedin, Twitter, Facebook,
  Pencil, Save, X,
} from "lucide-react";

interface InstructorPersonalDetailsTabProps {
  userId: number;
  initialAbout?: string;
  initialOrganization?: string;
  initialExperience?: string;
  initialLinkedin?: string;
  initialTwitter?: string;
  initialFacebook?: string;
}

export function InstructorPersonalDetailsTab({
  userId,
  initialAbout = "",
  initialOrganization = "",
  initialExperience = "",
  initialLinkedin = "",
  initialTwitter = "",
  initialFacebook = "",
}: InstructorPersonalDetailsTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState(initialAbout);
  const [organization, setOrganization] = useState(initialOrganization);
  const [experience, setExperience] = useState(initialExperience);
  const [linkedin, setLinkedin] = useState(initialLinkedin);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [facebook, setFacebook] = useState(initialFacebook);
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
        body: JSON.stringify({
          about,
          organization,
          experience,
          linkedin,
          twitter,
          facebook,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSuccess("Professional details updated successfully!");
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setAbout(initialAbout);
    setOrganization(initialOrganization);
    setExperience(initialExperience);
    setLinkedin(initialLinkedin);
    setTwitter(initialTwitter);
    setFacebook(initialFacebook);
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
            <FileText className="w-3.5 h-3.5" /> About
          </label>
          {editing ? (
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell students about yourself and your teaching style…"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[4rem]">
              {about || <span className="text-muted-foreground italic">Not provided</span>}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Organization
          </label>
          {editing ? (
            <input
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. IIT Madras / Independent Educator"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[2.5rem] flex items-center">
              {organization || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Experience
          </label>
          {editing ? (
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5 years in software development, 3 years teaching…"
            />
          ) : (
            <p className="text-sm px-3 py-2 bg-muted rounded-lg min-h-[3rem]">
              {experience || (
                <span className="text-muted-foreground italic">Not provided</span>
              )}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Social Links
          </p>
          <div className="grid gap-3">
            {[
              {
                icon: <Linkedin className="w-3.5 h-3.5" />,
                label: "LinkedIn",
                value: linkedin,
                set: setLinkedin,
                placeholder: "https://linkedin.com/in/username",
              },
              {
                icon: <Twitter className="w-3.5 h-3.5" />,
                label: "Twitter / X",
                value: twitter,
                set: setTwitter,
                placeholder: "https://twitter.com/username",
              },
              {
                icon: <Facebook className="w-3.5 h-3.5" />,
                label: "Facebook",
                value: facebook,
                set: setFacebook,
                placeholder: "https://facebook.com/username",
              },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  {f.icon} {f.label}
                </label>
                {editing ? (
                  <input
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    type="url"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                  />
                ) : f.value ? (
                  <a
                    href={f.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm px-3 py-2 bg-muted rounded-lg text-primary hover:underline truncate"
                  >
                    {f.value}
                  </a>
                ) : (
                  <p className="text-sm px-3 py-2 bg-muted rounded-lg text-muted-foreground italic">
                    Not provided
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}