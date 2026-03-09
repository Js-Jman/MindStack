import { prisma } from "@/lib/db";
import { UsersTable } from "@/components/admin/UsersTable";
import type { UserTableRow } from "@/types/admin";

type InstructorUser = {
  id: number;
  name: string;
  email: string;
  isFlagged: boolean;
  createdAt: Date;
  _count: { courses: number };
};

export default async function InstructorsPage() {
  const instructors = (await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  })) as InstructorUser[];

  const formattedInstructors: UserTableRow[] = instructors.map((instructor: InstructorUser) => ({
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    status: instructor.isFlagged ? "SUSPENDED" : "ACTIVE",
    isFlagged: instructor.isFlagged,
    courseCount: instructor._count.courses,
    createdAt: instructor.createdAt,
  }));

  return (
    <div className="space-y-6 max-w mx-auto">
      <div className="px-4">
        <h2 className="text-2xl font-bold text-slate-900">Instructor Management</h2>
        <p className="text-sm text-slate-500">
          Review and manage instructor accounts and published course ownership.
        </p>
      </div>

      <UsersTable
        data={formattedInstructors}
        entityLabel="instructors"
        courseColumnLabel="Courses"
      />
    </div>
  );
}
