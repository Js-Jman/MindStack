"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Ban, CheckCircle, UserCircle, Inbox, Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserData {
  id: number;
  name: string | null;
  email: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  isFlagged?: boolean;
  courseCount: number; // Derived from length of enrolled courses array
  createdAt?: Date | string | null;
}

interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  isFlagged: boolean;
  createdAt: string;
  courses: Array<{
    id: number;
    title: string;
    isPublished: boolean;
    createdAt: string;
    _count: { enrollments: number };
  }>;
  enrollments: Array<{
    id: number;
    status: string;
    enrolledAt: string;
    course: { id: number; title: string; isPublished: boolean };
  }>;
}

interface UsersTableProps {
  data: UserData[];
  entityLabel?: string;
  courseColumnLabel?: string;
}

export const UsersTable = ({
  data = [],
  entityLabel = "users",
  courseColumnLabel = "Courses Enrolled",
}: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<UserData[]>(data);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileResponse | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const filteredUsers = rows.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProfile = async (userId: number) => {
    try {
      setIsLoadingProfile(true);
      setIsProfileOpen(true);
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load profile details");
      const profile = await res.json();
      setSelectedProfile(profile);
    } catch {
      setSelectedProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const toggleFlag = async (user: UserData) => {
    try {
      setBusyUserId(user.id);
      const nextFlag = !user.isFlagged;
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFlagged: nextFlag }),
      });

      if (!res.ok) throw new Error("Failed to update flag status");

      setRows((prev) =>
        prev.map((row) =>
          row.id === user.id
            ? {
                ...row,
                isFlagged: nextFlag,
                status: nextFlag ? "SUSPENDED" : "ACTIVE",
              }
            : row
        )
      );

      if (selectedProfile?.id === user.id) {
        setSelectedProfile({ ...selectedProfile, isFlagged: nextFlag });
      }
    } catch {
      // no-op for now
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      setBusyUserId(userId);
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setRows((prev) => prev.filter((row) => row.id !== userId));
      if (selectedProfile?.id === userId) {
        setSelectedProfile(null);
        setIsProfileOpen(false);
      }
    } catch {
      // no-op for now
    } finally {
      setBusyUserId(null);
    }
  };

  const hasData = filteredUsers.length > 0;

  return (
    <div className="w-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
      {/* Search Header - Always Visible */}
      <div className="p-6 border-b bg-slate-50/30 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder={`Search ${entityLabel}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">User Profile</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Flag</th>
              <th className="px-8 py-5">{courseColumnLabel}</th>
              <th className="px-8 py-5">Joined Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasData ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                  onClick={() => openProfile(user.id)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                        {user.name?.charAt(0) || <UserCircle size={20} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      (user.isFlagged || user.status === "SUSPENDED")
                        ? "bg-red-50 text-red-700 border-red-100"
                        : user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {(user.isFlagged || user.status === "SUSPENDED") ? <Ban size={10} /> : <CheckCircle size={10} />}
                      {(user.isFlagged || user.status === "SUSPENDED") ? "SUSPENDED" : user.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border",
                        user.isFlagged
                          ? "bg-orange-50 text-orange-700 border-orange-100"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      {user.isFlagged ? "FLAGGED" : "CLEAR"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    {user.courseCount || 0} {user.courseCount === 1 ? "Course" : "Courses"}
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlag(user);
                        }}
                        disabled={busyUserId === user.id}
                        className={cn(
                          "p-2.5 rounded-xl transition-all",
                          user.isFlagged
                            ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
                            : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                        )}
                        title={user.isFlagged ? "Unflag user" : "Flag user"}
                      >
                        <Flag size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(user.id);
                        }}
                        disabled={busyUserId === user.id}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete user"
                      >
                      <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* EMPTY STATE ROW */
              <tr>
                <td colSpan={6} className="py-20">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-y-2">
                    <Inbox size={48} strokeWidth={1} className="text-slate-200" />
                    <p className="text-sm font-medium">No {entityLabel} found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isProfileOpen && (
        <div
          className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Profile Details</h3>
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setIsProfileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingProfile ? (
              <p className="text-sm text-slate-500">Loading profile...</p>
            ) : !selectedProfile ? (
              <p className="text-sm text-red-500">Unable to load profile details.</p>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border p-4 bg-slate-50/60">
                  <p className="text-lg font-semibold text-slate-900">{selectedProfile.name}</p>
                  <p className="text-sm text-slate-600">{selectedProfile.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedProfile.role}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full border",
                        selectedProfile.isFlagged
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      )}
                    >
                      {selectedProfile.isFlagged ? "FLAGGED" : "ACTIVE"}
                    </span>
                  </div>
                </div>

                {selectedProfile.role === "INSTRUCTOR" ? (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Courses Handled</h4>
                    {selectedProfile.courses.length === 0 ? (
                      <p className="text-sm text-slate-500">No courses assigned.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedProfile.courses.map((course) => (
                          <div key={course.id} className="rounded-lg border p-3">
                            <p className="font-medium text-slate-900">{course.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {course._count.enrollments} enrollments • {course.isPublished ? "Published" : "Draft"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Enrollments</h4>
                    {selectedProfile.enrollments.length === 0 ? (
                      <p className="text-sm text-slate-500">No enrollments yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedProfile.enrollments.map((enrollment) => (
                          <div key={enrollment.id} className="rounded-lg border p-3">
                            <p className="font-medium text-slate-900">{enrollment.course.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {enrollment.status} • {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};