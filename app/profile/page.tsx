// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, KeyRound, ArrowLeft } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { OverviewTab } from "@/components/profile/OverviewTab";
import { StudentPersonalDetailsTab } from "@/components/profile/StudentPersonalDetailsTab";
import { InstructorPersonalDetailsTab } from "@/components/profile/InstructorPersonalDetailsTab";
import { ChangePasswordTab } from "@/components/profile/ChangePasswordTab";

interface FullUser {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  phoneNumber?: string;
  avatarUrl?: string;
  profile?: {
    collegeName?: string;
    skills?: string;
    interests?: string;
    about?: string;
    organization?: string;
    experience?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  } | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) throw new Error("Unauthorized");
        const me = await meRes.json();

        const profileRes = await fetch(`/api/users/${me.id}`);
        if (!profileRes.ok) throw new Error("Failed to load profile");
        setUser(await profileRes.json());
      } catch {
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isStudent = user.role === "STUDENT";
  const dashboardHref = isStudent ? "/dashboard/student" : "/dashboard/instructor";

  const tabs = [
    { id: "overview",  label: "Overview",          icon: <User     className="w-4 h-4" /> },
    { id: "personal",  label: "Personal Details",   icon: <BookOpen className="w-4 h-4" /> },
    { id: "password",  label: "Change Password",    icon: <KeyRound className="w-4 h-4" /> },
  ];

  const panels = [
    <OverviewTab
      key="overview"
      userId={user.id}
      initialName={user.name}
      email={user.email}
      phoneNumber={user.phoneNumber}
      avatarUrl={user.avatarUrl}
      onSaved={(d) => setUser((u) => u && { ...u, ...d })}
    />,

    isStudent ? (
      <StudentPersonalDetailsTab
        key="personal"
        userId={user.id}
        initialCollegeName={user.profile?.collegeName ?? ""}
        initialSkills={user.profile?.skills ?? ""}
        initialInterests={user.profile?.interests ?? ""}
      />
    ) : (
      <InstructorPersonalDetailsTab
        key="personal"
        userId={user.id}
        initialAbout={user.profile?.about ?? ""}
        initialOrganization={user.profile?.organization ?? ""}
        initialExperience={user.profile?.experience ?? ""}
        initialLinkedin={user.profile?.linkedin ?? ""}
        initialTwitter={user.profile?.twitter ?? ""}
        initialFacebook={user.profile?.facebook ?? ""}
      />
    ),

    <ChangePasswordTab key="password" userId={user.id} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <button
          onClick={() => router.push(dashboardHref)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 bg-white/80 border border-purple-100 rounded-2xl shadow-lg p-6 flex flex-col gap-4 sticky top-24 h-fit self-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mt-2">
                {user.role}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Page heading */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Manage your account information
                </p>
              </div>
            </div>

            <ProfileTabs tabs={tabs}>{panels}</ProfileTabs>
          </div>
        </div>
      </div>
    </div>
  );
}