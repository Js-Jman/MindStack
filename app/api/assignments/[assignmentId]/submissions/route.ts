import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * GET /api/assignments/[assignmentId]/submissions
 * Get the current user's submission for a specific assignment
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { assignmentId } = await params;
    const assignmentIdNum = Number(assignmentId);

    if (!Number.isInteger(assignmentIdNum)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: assignmentIdNum },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Get user's submission if it exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentIdNum,
          userId: session.userId,
        },
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assignments/[assignmentId]/submissions
 * Submit or update an assignment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit assignments" },
        { status: 403 }
      );
    }

    const { assignmentId } = await params;
    const assignmentIdNum = Number(assignmentId);

    if (!Number.isInteger(assignmentIdNum)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
    }

    const body = await req.json();
    const { submissionText, fileUrl } = body;

    // At least one field must be provided
    if (!submissionText && !fileUrl) {
      return NextResponse.json(
        { error: "Please provide either submission text or a file URL" },
        { status: 400 }
      );
    }

    // Verify assignment exists and isn't deleted
    const assignment = await prisma.courseAssignment.findUnique({
      where: { id: assignmentIdNum },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: session.userId, status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!assignment || assignment.deletedAt) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Verify student is enrolled in the course
    if (assignment.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: "You must be enrolled in this course to submit assignments" },
        { status: 403 }
      );
    }

    // Upsert the submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentIdNum,
          userId: session.userId,
        },
      },
      create: {
        assignmentId: assignmentIdNum,
        userId: session.userId,
        submissionText: submissionText || null,
        fileUrl: fileUrl || null,
        submittedAt: new Date(),
      },
      update: {
        submissionText: submissionText || null,
        fileUrl: fileUrl || null,
        submittedAt: new Date(),
        // Reset grade and feedback on resubmission
        grade: null,
        feedback: null,
        gradedAt: null,
      },
    });

    return NextResponse.json({
      message: "Submission successful",
      submission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
