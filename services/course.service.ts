/**
 * @fileoverview Course Service - Business Logic Layer
 * 
 * This service contains business logic for course operations.
 * It orchestrates between:
 * - courseRepository: database layer for course data
 * 
 * Responsibilities:
 * - Input validation for course operations
 * - Business rule enforcement (e.g., title/description required)
 * - Delegation to repository for data persistence
 * - Error handling and meaningful error messages
 */

import * as courseRepository from "@/repositories/course.repository";
import { CreateCourseInput, UpdateCourseInput } from "@/types/course";

/**
 * Get all published courses
 * 
 * @returns Array of all published courses with full details
 */
export async function getAllCourses() {
  return await courseRepository.findAll();
}

/**
 * Get all published courses enriched with current user's enrollment/progress data
 * 
 * Adds to each course:
 * - isEnrolled: whether current user is enrolled
 * - progress: student's completion percentage
 * - progressStatus: course progress status
 * - instructorName: formatted instructor name
 * - isFree: whether course is free
 * 
 * @param currentUserId - ID of the current user
 * @returns Array of courses with enrichment data
 */
export async function getAllCoursesForStudent(currentUserId: number) {
  return await courseRepository.findAllWithEnrichment(currentUserId);
}

/**
 * Get a single course by ID
 * 
 * @param id - Course ID
 * @returns Course with full details or null if not found
 * @throws Error if course not found
 */
export async function getCourseById(id: number) {
  const course = await courseRepository.findById(id);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
}

/**
 * Get all courses a student is enrolled in
 * 
 * Includes progress information for each course
 * 
 * @param studentId - ID of the student
 * @returns Array of enrolled courses
 */
export async function getEnrolledCourses(studentId: number) {
  return await courseRepository.findEnrolledCoursesByStudent(studentId);
}

/**
 * Search published courses by title or description
 * 
 * If no query is provided, returns all published courses
 * 
 * @param query - Search query string
 * @returns Array of matching courses
 */
export async function searchCourses(query: string) {
  if (!query || query.trim() === "") {
    return await courseRepository.findAll();
  }
  return await courseRepository.searchCourses(query);
}

/**
 * Search published courses with enrichment for a student
 * 
 * Adds enrollment and progress information to results
 * 
 * @param query - Search query string
 * @param currentUserId - ID of current user
 * @returns Array of matching courses with enrichment data
 */
export async function searchCoursesForStudent(query: string, currentUserId: number) {
  return await courseRepository.searchCoursesWithEnrichment(query, currentUserId);
}

/**
 * Create a new course
 * 
 * Business rules:
 * - Title is required
 * - Description is required
 * - Courses are not published by default
 * 
 * @param data - Course creation input
 * @returns Created course with full details
 * @throws Error if title or description missing
 */
export async function createCourse(data: CreateCourseInput) {
  if (!data.title || !data.description) {
    throw new Error("Title and description are required");
  }

  return await courseRepository.create(data);
}

/**
 * Update course details
 * 
 * @param id - Course ID
 * @param data - Partial course data to update
 * @returns Updated course with full details
 * @throws Error if course not found
 */
export async function updateCourse(id: number, data: UpdateCourseInput) {
  const updated = await courseRepository.update(id, data);

  if (!updated) {
    throw new Error("Course not found for update");
  }

  return updated;
}

/**
 * Delete a course
 * 
 * @param id - Course ID
 * @returns Success confirmation message
 * @throws Error if course not found
 */
export async function deleteCourse(id: number) {
  const success = await courseRepository.remove(id);

  if (!success) {
    throw new Error("Course not found for deletion");
  }

  return { message: "Course deleted successfully" };
}
