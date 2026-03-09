import { prisma } from "@/lib/db";
import { UsersTable } from "@/components/admin/UsersTable";
import type { UserData } from "@/components/admin/UsersTable";

export default async function UsersPage() {
  // Fetch users with their enrollment count from Prisma
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { enrollments: true }, // Replace 'enrollments' with your actual relation name
      },
    },
  });

  const formattedUsers: UserData[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: "ACTIVE",
    courseCount: user._count?.enrollments || 0,
    createdAt: user.createdAt,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="px-4">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-sm text-slate-500">Manage student accounts and monitor course engagement.</p>
      </div>

      <UsersTable data={formattedUsers} />
    </div>
  );
}