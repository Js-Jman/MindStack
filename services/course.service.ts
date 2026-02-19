import * as courseRepository from "@/repositories/course.repository";
import {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/types/course";

export async function getAllCourses() {
  return await courseRepository.findAll();
}

export async function getCourseById(id: string) {
  const course = await courseRepository.findById(id);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
}

export async function createCourse(data: CreateCourseInput) {
  if (!data.title || !data.description) {
    throw new Error("Title and description are required");
  }

  return await courseRepository.create(data);
}

export async function updateCourse(
  id: string,
  data: UpdateCourseInput
) {
  const updated = await courseRepository.update(id, data);

  if (!updated) {
    throw new Error("Course not found for update");
  }

  return updated;
}

export async function deleteCourse(id: string) {
  const success = await courseRepository.remove(id);

  if (!success) {
    throw new Error("Course not found for deletion");
  }

  return { message: "Course deleted successfully" };
}
