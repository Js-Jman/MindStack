import { NextRequest, NextResponse } from "next/server";
import { markLessonDone } from "@/services/progress.service";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const studentId = Number(session.user.id);
    // const studentId = 13;

    const body = await req.json();
    console.log("DEBUG INPUT:", body);
    console.log("SESSION USER ID:", studentId);

    const lessonId = Number(body?.lessonId);
    const doneValue = body?.done;

    if (!Number.isFinite(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lessonId", received: body.lessonId },
        { status: 400 },
      );
    }

    const done =
      doneValue === true ||
      doneValue === "true" ||
      doneValue === 1 ||
      doneValue === "1"
        ? true
        : doneValue === false ||
            doneValue === "false" ||
            doneValue === 0 ||
            doneValue === "0"
          ? false
          : null;

    if (done === null) {
      return NextResponse.json(
        { error: "Invalid done value", received: body.done },
        { status: 400 },
      );
    }

    const data = await markLessonDone(studentId, lessonId, done);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("API ERROR:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 },
    );
  }
}
