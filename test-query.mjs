import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const enr = await p.courseEnrollment.findMany({ where: { userId: 1 }, take: 2 });
  console.log("enrollments:", enr.length);
  const prog = await p.courseProgress.findMany({ where: { userId: 1 }, take: 2 });
  console.log("progress:", prog.length);
  await p.$disconnect();
} catch (e) {
  console.error("ERROR:", e.message);
  await p.$disconnect();
  process.exit(1);
}
