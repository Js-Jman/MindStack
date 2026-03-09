import { NextResponse } from "next/server";
import { COOKIE_NAME, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      select: { id: true, name: true, email: true, role: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}