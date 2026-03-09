"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye, EyeOff, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";import { useToast } from "@/components/ui/toast";
interface CourseTableRow {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  isFree: boolean;
  enrollmentsCount: number;
  lessonsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CoursesTableProps {
  data: CourseTableRow[];
}

export const CoursesTable = ({ data = [] }: CoursesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<CourseTableRow[]>(data);
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setRows(data);
  }, [data]);

  const filteredCourses = rows.filter((course) =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { toast } = useToast();
  const togglePublish = async (course: CourseTableRow) => {
    try {
      setBusyCourseId(course.id);
      const nextPublished = !course.isPublished;
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      });

      if (!res.ok) throw new Error("Failed to update course status");

      setRows((prev) =>
        prev.map((row) =>
          row.id === course.id
            ? { ...row, isPublished: nextPublished }
            : row
        )
      );
      toast("Course status updated", "success");
    } catch (error) {
      console.error("Error updating course:", error);
      toast("Unable to change publish status", "error");
    } finally {
      setBusyCourseId(null);
    }
  };

  const deleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      setBusyCourseId(courseId);
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      setRows((prev) => prev.filter((row) => row.id !== courseId));
      toast("Course deleted", "success");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast("Unable to delete course", "error");
    } finally {
      setBusyCourseId(null);
    }
  };

  const hasData = filteredCourses.length > 0;

  return (
    <div className="w-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
      {/* Search Header - Always Visible */}
      <div className="p-6 border-b bg-slate-50/30 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition"
        >
          Create Course
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Course</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5">Enrollments</th>
              <th className="px-8 py-5">Lessons</th>
              <th className="px-8 py-5">Created</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasData ? (
              filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                        <BookOpen size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{course.title}</span>
                        <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">
                          {course.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      course.isPublished
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {course.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                      {course.isPublished ? "PUBLISHED" : "DRAFT"}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    {course.isFree ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        Rs. 
                        {course.price.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-slate-400" />
                      {course.enrollmentsCount}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} className="text-slate-400" />
                      {course.lessonsCount}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(course)}
                        disabled={busyCourseId === course.id}
                        className={cn(
                          "p-2.5 rounded-xl transition-all",
                          course.isPublished
                            ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={course.isPublished ? "Unpublish course" : "Publish course"}
                      >
                        {course.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/courses/update/${course.id}`)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit course"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        disabled={busyCourseId === course.id}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete course"
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
                <td colSpan={7} className="py-20">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-y-2">
                    <BookOpen size={48} strokeWidth={1} className="text-slate-200" />
                    <p className="text-sm font-medium">No courses found</p>
                    <p className="text-xs">Try adjusting your search or create your first course</p>
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