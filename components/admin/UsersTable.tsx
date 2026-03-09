"use client";

import { useState } from "react";
import { Search, Trash2, Ban, CheckCircle, UserCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";



export interface UserData {
  id: number;
  name: string | null;
  email: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  courseCount: number; // Derived from length of enrolled courses array
  createdAt: Date;
}

interface UsersTableProps {
  data: UserData[];
}

export const UsersTable = ({ data = [] }: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = data.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasData = filteredUsers.length > 0;

  return (
    <div className="w-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
      {/* Search Header - Always Visible */}
      <div className="p-6 border-b bg-slate-50/30 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder="Search users..."
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
              <th className="px-8 py-5">Courses Enrolled</th>
              <th className="px-8 py-5">Joined Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasData ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
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
                      user.status === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {user.status === "ACTIVE" ? <CheckCircle size={10} /> : <Ban size={10} />}
                      {user.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    {user.courseCount || 0} Courses
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              /* EMPTY STATE ROW */
              <tr>
                <td colSpan={5} className="py-20">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-y-2">
                    <Inbox size={48} strokeWidth={1} className="text-slate-200" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};