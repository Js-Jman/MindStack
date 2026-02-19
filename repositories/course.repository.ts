import { Course, CreateCourseInput, UpdateCourseInput } from "@/types/course";

let mockCourses: Course[] = [];

export async function findAll(): Promise<Course[]> {
  return mockCourses;
}

export async function findById(id: string): Promise<Course | null> {
  return mockCourses.find(course => course.id === id) || null;
}

export async function create(data: CreateCourseInput): Promise<Course> {
  const newCourse: Course = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockCourses.push(newCourse);
  return newCourse;
}

export async function update(
  id: string,
  data: UpdateCourseInput
): Promise<Course | null> {
  const index = mockCourses.findIndex(course => course.id === id);
  if (index === -1) return null;

  mockCourses[index] = {
    ...mockCourses[index],
    ...data,
    updatedAt: new Date(),
  };

  return mockCourses[index];
}

export async function remove(id: string): Promise<boolean> {
  const initialLength = mockCourses.length;
  mockCourses = mockCourses.filter(course => course.id !== id);
  return mockCourses.length < initialLength;
}