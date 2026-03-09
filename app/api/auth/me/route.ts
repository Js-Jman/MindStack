import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Roles } from "@/types/user";

type AuthMeResponse = {
  id: number;
  name: string;
  email: string;
  role: Roles;
};

export async function GET(): Promise<NextResponse<AuthMeResponse | { error: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response: AuthMeResponse = {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}