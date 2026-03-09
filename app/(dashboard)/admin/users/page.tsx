import { prisma } from "@/lib/db";
import { UsersTable } from "@/components/admin/UsersTable";
import type { UserTableRow } from "@/types/admin";

type StudentUser = {
  id: number;
  name: string;
  email: string;
  isFlagged: boolean;
  createdAt: Date;
  _count: { enrollments: number };
};

export default async function UsersPage() {
  // Fetch students with enrollment count from Prisma
  const users = (await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  })) as StudentUser[];

  const formattedUsers: UserTableRow[] = users.map((user: StudentUser) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.isFlagged ? "SUSPENDED" : "ACTIVE",
    isFlagged: user.isFlagged,
    courseCount: user._count?.enrollments || 0,
    createdAt: user.createdAt,
  }));

  return (
    <div className="space-y-6 max-w mx-auto">
      <div className="px-4">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-sm text-slate-500">Manage student accounts and monitor course engagement.</p>
      </div>

      <UsersTable data={formattedUsers} />
    </div>
  );
}