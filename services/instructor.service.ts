/**
 * @fileoverview Instructor Service - Business Logic Layer
 *
 * This service contains business logic for instructor operations.
 * It orchestrates between repositories for instructor-specific data.
 */

import * as courseRepository from "@/repositories/course.repository";
import * as enrollmentRepository from "@/repositories/enrollment.repository";

/**
 * Get instructor dashboard statistics
 *
 * @param instructorId - ID of the instructor
 * @returns Statistics object
 */
export async function getInstructorStats(instructorId: number) {
  // Total courses
  const totalCourses = await courseRepository.countCoursesByInstructor(instructorId);

  // Total enrollments across all courses
  const totalEnrollments = await enrollmentRepository.countEnrollmentsByInstructor(instructorId);

  // Total revenue (sum of price * enrollments for paid courses)
  const totalRevenue = await enrollmentRepository.calculateRevenueByInstructor(instructorId);

  return {
    totalCourses,
    totalEnrollments,
    totalRevenue: Number(totalRevenue),
  };
}

/**
 * Get recent courses by instructor
 *
 * @param instructorId - ID of the instructor
 * @param limit - Number of courses to return
 * @returns Array of recent courses
 */
export async function getRecentCourses(instructorId: number, limit: number = 5) {
  return await courseRepository.findRecentCoursesByInstructor(instructorId, limit);
}

/**
 * Get enrollment data for chart (enrollments over time)
 *
 * @param instructorId - ID of the instructor
 * @returns Array of enrollment counts by date
 */
export async function getEnrollmentChartData(instructorId: number) {
  return await enrollmentRepository.getEnrollmentChartDataByInstructor(instructorId);
}