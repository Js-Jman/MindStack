import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type { SeedCourseSpec } from "../types/seed";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("Cleaning existing data in the right order...");

  await prisma.assignmentSubmission.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonContent.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.courseAssignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
}

const d = (n: number): number => n;

async function createCourseWithContent(
  instructorId: number,
  spec: SeedCourseSpec,
) {
  const course = await prisma.course.create({
    data: {
      instructorId,
      title: spec.title,
      description: spec.description,
      thumbnailUrl: spec.thumbnailUrl ?? null,
      introVideoUrl: spec.introVideoUrl ?? null,
      price: spec.price != null ? d(spec.price) : null,
      isPublished: spec.isPublished ?? true,
    },
  });

  for (let sIdx = 0; sIdx < spec.sections.length; sIdx++) {
    const sectionSpec = spec.sections[sIdx];
    const section = await prisma.courseSection.create({
      data: {
        courseId: course.id,
        title: sectionSpec.title,
        sectionOrder: sIdx + 1,
      },
    });

    for (let lIdx = 0; lIdx < sectionSpec.lessons.length; lIdx++) {
      const lessonSpec = sectionSpec.lessons[lIdx];

      const lesson = await prisma.lesson.create({
        data: {
          sectionId: section.id,
          title: lessonSpec.title,
          lessonOrder: lIdx + 1,
        },
      });

      // Contents: TEXT (1) → IMAGE (2) → VIDEO (3)
      await prisma.lessonContent.createMany({
        data: [
          {
            lessonId: lesson.id,
            contentType: "TEXT",
            contentBody: lessonSpec.textHtml,
            contentOrder: 1,
          },
          {
            lessonId: lesson.id,
            contentType: "IMAGE",
            contentBody: lessonSpec.imageUrl,
            contentOrder: 2,
          },
          {
            lessonId: lesson.id,
            contentType: "VIDEO",
            contentBody: lessonSpec.videoUrl,
            contentOrder: 3,
          },
        ],
      });

      // Simple quiz: 1 question, 2 options
      const quiz = await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          title: `Quick Check: ${lessonSpec.title}`,
        },
      });

      const question = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: `What is the key takeaway from "${lessonSpec.title}"?`,
        },
      });

      await prisma.quizOption.createMany({
        data: [
          {
            questionId: question.id,
            optionText: "The core concept and how to apply it",
            isCorrect: true,
          },
          {
            questionId: question.id,
            optionText: "Irrelevant details not covered here",
            isCorrect: false,
          },
        ],
      });
    }
  }

  return course;
}

async function computeAndUpsertCourseProgress(
  userId: number,
  courseId: number,
) {
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { section: { courseId } } }),
    prisma.lessonProgress.count({
      where: {
        userId,
        status: "COMPLETED",
        lesson: { section: { courseId } },
      },
    }),
  ]);

  const pct =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  const status =
    pct >= 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "NOT_STARTED";

  await prisma.courseProgress.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: {
      courseId,
      userId,
      status,
      completionPercentage: d(pct),
    },
    update: {
      status,
      completionPercentage: d(pct),
    },
  });

  // If fully complete, also mark the enrollment completed
  if (pct === 100) {
    await prisma.courseEnrollment.update({
      where: { courseId_userId: { courseId, userId } },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }
}

async function main() {
  console.log("Starting seed...");
  await resetDatabase();

  // --- Users ---
  const student = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "student@example.com",
      password: "hashedpassword123",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya.student@example.com",
      password: "hashedpassword123",
      role: "STUDENT",
      isFlagged: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword123",
      role: "ADMIN",
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john.instructor@example.com",
      password: "hashedpassword123",
      role: "INSTRUCTOR",
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.instructor@example.com",
      password: "hashedpassword123",
      role: "INSTRUCTOR",
    },
  });

  const instructor3 = await prisma.user.create({
    data: {
      name: "Mike Wilson",
      email: "mike.instructor@example.com",
      password: "hashedpassword123",
      role: "INSTRUCTOR",
      isFlagged: true,
    },
  });

  // Reusable demo media
  const demoVideos = [
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
  ];

  // --- Courses + Sections + Lessons + Contents + Quizzes ---
  const coursesData: SeedCourseSpec[] = [
    {
      title: "Web Development Fundamentals",
      description:
        "Learn HTML, CSS, and JavaScript fundamentals with hands-on projects and modern best practices.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
      introVideoUrl: demoVideos[1],
      price: 49.99,
      isPublished: true,
      sections: [
        {
          title: "Getting Started",
          lessons: [
            {
              title: "Welcome & Course Overview",
              textHtml:
                "<p>Welcome! In this lesson, you’ll understand the course goals, structure, and how to succeed.</p><ul><li>Course structure</li><li>Tools you need</li><li>Project preview</li></ul>",
              imageUrl:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
            {
              title: "HTML Basics",
              textHtml:
                "<p>Learn the foundational tags and document structure of HTML.</p><pre><code>&lt;!doctype html&gt;...</code></pre>",
              imageUrl:
                "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "CSS Essentials",
              textHtml:
                "<p>Understand selectors, the box model, and how to style layouts responsively.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
          ],
        },
        {
          title: "Core JavaScript",
          lessons: [
            {
              title: "JS Syntax & Variables",
              textHtml:
                "<p>Variables, types, and basic operations with modern JS (let/const).</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
            {
              title: "Functions & Scope",
              textHtml:
                "<p>Function declarations, expressions, arrow functions, and scope behavior.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "DOM Basics",
              textHtml:
                "<p>Interact with the DOM: selecting, modifying, and handling events.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
          ],
        },
        {
          title: "Project",
          lessons: [
            {
              title: "Build a Landing Page",
              textHtml:
                "<p>Combine HTML/CSS/JS to build a responsive landing page.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
          ],
        },
      ],
    },
    {
      title: "Advanced React Patterns",
      description:
        "Master advanced patterns, performance optimization, and architecture for large React apps.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=450&fit=crop",
      introVideoUrl: demoVideos[2],
      price: 69.99,
      isPublished: true,
      sections: [
        {
          title: "Patterns",
          lessons: [
            {
              title: "Render Props & Control Props",
              textHtml:
                "<p>Explore flexible component patterns and when to use them.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
            {
              title: "Hooks Composition",
              textHtml:
                "<p>Compose hooks for reuse, maintainability, and clarity.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
          ],
        },
        {
          title: "Performance",
          lessons: [
            {
              title: "Memoization & Suspense Basics",
              textHtml:
                "<p>Use memo, useMemo, useCallback, and Suspense boundaries effectively.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "React Server Components (Intro)",
              textHtml:
                "<p>Understand the RSC model, server actions, and streaming.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
          ],
        },
      ],
    },
    {
      title: "Node.js and Express Backend",
      description:
        "Build scalable REST APIs with Node.js, Express, and MySQL. Learn auth, validation, and testing.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516321318423-f06a6b1ef01d?w=800&h=450&fit=crop",
      introVideoUrl: demoVideos[0],
      price: 59.99,
      isPublished: true,
      sections: [
        {
          title: "Essentials",
          lessons: [
            {
              title: "Express Fundamentals",
              textHtml:
                "<p>Routers, middleware, and error handling in Express apps.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
            {
              title: "RESTful API Design",
              textHtml:
                "<p>Design endpoints, resources, and standard response formats.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
          ],
        },
        {
          title: "Data & Auth",
          lessons: [
            {
              title: "MySQL + Prisma",
              textHtml:
                "<p>Model relations, migrations, and efficient querying with Prisma.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
            {
              title: "Auth & Validation",
              textHtml:
                "<p>Implement JWT, sessions, and input validation securely.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
          ],
        },
      ],
    },
    {
      title: "Database Design and SQL",
      description:
        "Design efficient schemas and write optimized SQL queries with indexes and normalization.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
      introVideoUrl: demoVideos[1],
      price: 39.99,
      isPublished: true,
      sections: [
        {
          title: "Modeling",
          lessons: [
            {
              title: "ER Modeling",
              textHtml:
                "<p>Entities, relationships, and translating real-world domains into data models.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "Normalization",
              textHtml:
                "<p>1NF to 3NF—avoid redundancy while maintaining performance.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
          ],
        },
        {
          title: "SQL Skills",
          lessons: [
            {
              title: "Joins & Aggregations",
              textHtml:
                "<p>Master joins, grouping, and aggregations for analytics queries.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
            {
              title: "Indexes & Query Plans",
              textHtml:
                "<p>Use indexes and understand execution plans to optimize performance.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
          ],
        },
      ],
    },
  ];

  const createdCourses = [];
  // Create courses under different instructors
  createdCourses.push(
    await createCourseWithContent(instructor1.id, coursesData[0]),
  );
  createdCourses.push(
    await createCourseWithContent(instructor2.id, coursesData[1]),
  );
  createdCourses.push(
    await createCourseWithContent(instructor1.id, coursesData[2]),
  );
  createdCourses.push(
    await createCourseWithContent(instructor3.id, coursesData[3]),
  );

  // --- Enrollments for the student ---
  await prisma.courseEnrollment.createMany({
    data: [
      { userId: student.id, courseId: createdCourses[0].id, status: "ACTIVE" },
      { userId: student.id, courseId: createdCourses[1].id, status: "ACTIVE" },
      { userId: student.id, courseId: createdCourses[3].id, status: "ACTIVE" },
      { userId: student2.id, courseId: createdCourses[1].id, status: "ACTIVE" },
      { userId: student2.id, courseId: createdCourses[2].id, status: "ACTIVE" },
    ],
  });

  // --- Seed some lesson completions to showcase progress ---
  // Complete first 3 lessons of course 0, first 1 lesson of course 1, and all lessons of course 3
  for (const [idx, course] of createdCourses.entries()) {
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId: course.id } },
      orderBy: [{ section: { sectionOrder: "asc" } }, { lessonOrder: "asc" }],
      select: { id: true },
    });

    let completeCount = 0;
    if (idx === 0) completeCount = Math.min(3, lessons.length);
    if (idx === 1) completeCount = Math.min(1, lessons.length);
    if (idx === 3) completeCount = lessons.length; // Complete entire 4th course

    for (let i = 0; i < completeCount; i++) {
      await prisma.lessonProgress.upsert({
        where: {
          lessonId_userId: { lessonId: lessons[i].id, userId: student.id },
        },
        create: {
          lessonId: lessons[i].id,
          userId: student.id,
          status: "COMPLETED",
        },
        update: {
          status: "COMPLETED",
        },
      });
    }

    await prisma.courseProgress.deleteMany({
      where: { userId: student.id, courseId: course.id },
    });
    await computeAndUpsertCourseProgress(student.id, course.id);
  }

  // Add partial progress for second student for richer profile view
  for (const course of [createdCourses[1], createdCourses[2]]) {
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId: course.id } },
      orderBy: [{ section: { sectionOrder: "asc" } }, { lessonOrder: "asc" }],
      select: { id: true },
    });

    if (lessons[0]) {
      await prisma.lessonProgress.upsert({
        where: {
          lessonId_userId: { lessonId: lessons[0].id, userId: student2.id },
        },
        create: {
          lessonId: lessons[0].id,
          userId: student2.id,
          status: "COMPLETED",
          completedAt: new Date(),
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    await prisma.courseProgress.deleteMany({
      where: { userId: student2.id, courseId: course.id },
    });
    await computeAndUpsertCourseProgress(student2.id, course.id);
  }

  console.log("Seed completed successfully! ✅");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
