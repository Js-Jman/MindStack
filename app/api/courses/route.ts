import { NextResponse } from "next/server";
import {
  getAllCourses,
  createCourse,
  searchCourses,
} from "@/services/course.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    const rawCourses = query ? await searchCourses(query) : await getAllCourses();

    // Map thumbnailUrl → image for UI components
    const courses = rawCourses.map((c: any) => ({
      ...c,
      image: c.thumbnailUrl ?? undefined,
    }));

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const course = await createCourse(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

