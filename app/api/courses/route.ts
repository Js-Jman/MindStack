import { NextResponse } from "next/server";
import {
  getAllCourses,
  createCourse,
} from "@/services/course.service";

export async function GET() {
  const courses = await getAllCourses();
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const course = await createCourse(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
