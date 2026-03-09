"use client";

import { CourseWizard } from "@/components/instructor/CourseWizard";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UpdateCoursePage({ params }: PageProps) {
  const { id } = use(params);
  return <CourseWizard courseId={id} />;
}
