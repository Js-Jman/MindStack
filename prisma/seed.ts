import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type { SeedCourseSpec } from "../types/seed";
import { hash } from "bcryptjs";

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

type SeedQuizQuestion = {
  questionText: string;
  options: string[];
  correctIndex: number;
};

function buildQuizQuestions(
  courseTitle: string,
  lessonTitle: string,
): SeedQuizQuestion[] {
  return [
    {
      questionText: `In ${courseTitle}, what is the primary goal of "${lessonTitle}"?`,
      options: [
        "Understand the core concept and apply it in practice",
        "Skip fundamentals and start with advanced optimizations",
        "Memorize syntax without understanding use cases",
        "Focus only on tooling setup",
      ],
      correctIndex: 0,
    },
    {
      questionText: `Which action best demonstrates mastery of "${lessonTitle}"?`,
      options: [
        "Implementing the concept in a small project exercise",
        "Reading the title once and moving to the next lesson",
        "Avoiding experiments to prevent mistakes",
        "Ignoring edge cases and validation",
      ],
      correctIndex: 0,
    },
  ];
}

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

      // Create richer quizzes for every lesson (2 questions, 4 options each)
      const quiz = await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          title: `Quick Check: ${lessonSpec.title}`,
        },
      });

      const questions = buildQuizQuestions(spec.title, lessonSpec.title);
      for (const q of questions) {
        const question = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: q.questionText,
          },
        });

        await prisma.quizOption.createMany({
          data: q.options.map((optionText, index) => ({
            questionId: question.id,
            optionText,
            isCorrect: index === q.correctIndex,
          })),
        });
      }
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

  const hashedPassword = await hash("password123", 10);

  //Users
  const student = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "student@example.com",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya.student@example.com",
      password: hashedPassword,
      role: "STUDENT",
      isFlagged: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john.instructor@example.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.instructor@example.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  const instructor3 = await prisma.user.create({
    data: {
      name: "Mike Wilson",
      email: "mike.instructor@example.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
      isFlagged: true,
    },
  });

  // Reusable demo media
  const demoVideos = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  ];

  const coursesData: SeedCourseSpec[] = [
    {
      title: "Web Development Fundamentals",
      description:
        "Learn HTML, CSS, and JavaScript fundamentals with projects.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
      introVideoUrl: demoVideos[1],
      price: 49.99,
      sections: [
        {
          title: "Getting Started",
          lessons: [
            {
              title: "Welcome & Course Overview",
              textHtml:
                "<h3>Welcome!</h3><p>In this course, we cover the <strong>holy trinity</strong> of web dev: HTML, CSS, and JS.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
            {
              title: "HTML Basics",
              textHtml:
                "<h3>Semantic HTML</h3><p>Use <code>&lt;header&gt;</code> and <code>&lt;footer&gt;</code> for better SEO.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "CSS Layout Essentials",
              textHtml:
                "<h3>Modern Layout</h3><p>Combine <strong>Flexbox</strong> for one-dimensional layouts and <strong>Grid</strong> for two-dimensional sections.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&fit=crop",
              videoUrl: demoVideos[3],
            },
          ],
        },
      ],
    },
    {
      title: "Advanced React Patterns",
      description: "Master hooks, performance, and architecture.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=450&fit=crop",
      price: 69.99,
      sections: [
        {
          title: "Patterns",
          lessons: [
            {
              title: "Hooks Composition",
              textHtml:
                "<h3>Clean Logic</h3><p>Extract your <code>useEffect</code> into custom hooks for reusability.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&fit=crop",
              videoUrl: demoVideos[0],
            },
            {
              title: "Memoization and Rendering",
              textHtml:
                "<h3>Performance Tuning</h3><p>Use <code>React.memo</code>, <code>useMemo</code>, and <code>useCallback</code> to reduce unnecessary renders.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&fit=crop",
              videoUrl: demoVideos[4],
            },
          ],
        },
      ],
    },
    {
      title: "Node.js & Backend Mastery",
      description: "Build scalable APIs with Express and Prisma.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516321318423-f06a6b1ef01d?w=800&h=450&fit=crop",
      price: 59.99,
      sections: [
        {
          title: "Backend Essentials",
          lessons: [
            {
              title: "Express Middleware",
              textHtml:
                "<h3>Middleware Flow</h3><p>Understand how <code>(req, res, next)</code> controls your API logic.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1200&fit=crop",
              videoUrl: demoVideos[1],
            },
            {
              title: "Prisma Query Patterns",
              textHtml:
                "<h3>Efficient Data Access</h3><p>Use <code>select</code> and <code>include</code> strategically to return only the fields your API needs.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&fit=crop",
              videoUrl: demoVideos[5],
            },
          ],
        },
      ],
    },
    {
      title: "Database Design Pro",
      description: "Optimize SQL queries and schema modeling.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=450&fit=crop",
      price: 39.99,
      sections: [
        {
          title: "Modeling",
          lessons: [
            {
              title: "Normalization",
              textHtml:
                "<h3>3rd Normal Form</h3><p>Avoid data redundancy by splitting tables logically.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&fit=crop",
              videoUrl: demoVideos[2],
            },
            {
              title: "Indexing Strategy",
              textHtml:
                "<h3>Faster Queries</h3><p>Create indexes on frequently filtered columns and validate gains using query plans.</p>",
              imageUrl:
                "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&fit=crop",
              videoUrl: demoVideos[3],
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

  // Create assignments for courses
  console.log("Creating assignments...");
  
  // Web Development Fundamentals - 2 assignments
  const assignment1 = await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[0].id,
      title: "Build a Personal Portfolio Website",
      description: "Create a responsive portfolio website using HTML, CSS, and JavaScript. Include sections for About, Projects, and Contact.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[0].id,
      title: "CSS Flexbox Layout Challenge",
      description: "Build a complex layout using only Flexbox. Submit your HTML and CSS files.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  // Advanced React Patterns - 2 assignments
  const assignment3 = await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[1].id,
      title: "Custom Hooks Implementation",
      description: "Create 3 custom hooks for common use cases: useFetch, useLocalStorage, and useDebounce. Include tests and documentation.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  });

  await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[1].id,
      title: "Performance Optimization Project",
      description: "Take a slow React app and optimize it using memoization techniques. Document your improvements with before/after metrics.",
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    },
  });

  // Node.js & Backend Mastery - 1 assignment
  await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[2].id,
      title: "RESTful API with Authentication",
      description: "Build a complete RESTful API with JWT authentication, CRUD operations, and proper error handling.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  // Database Design Pro - 1 assignment
  await prisma.courseAssignment.create({
    data: {
      courseId: createdCourses[3].id,
      title: "E-commerce Database Schema Design",
      description: "Design a normalized database schema for an e-commerce platform. Include ER diagram and sample queries.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  // Create sample submission for student 1 on assignment 1
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      userId: student.id,
      submissionText: "I've completed my portfolio website with all the required sections. The site is fully responsive and includes interactive elements.",
      fileUrl: "https://github.com/sample-user/portfolio",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      grade: 92.5,
      feedback: "Great work! Your portfolio is well-structured and responsive. Consider adding more animations for better UX.",
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // Create submission for student 1 on assignment 3 (not yet graded)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment3.id,
      userId: student.id,
      submissionText: "Here are my three custom hooks with full test coverage and documentation. The useFetch hook includes caching, useLocalStorage has serialization support, and useDebounce prevents excessive API calls.",
      fileUrl: "https://github.com/sample-user/react-custom-hooks",
      submittedAt: new Date(),
    },
  });

  // Enrollments for the student

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

    
    if (idx === 0) completeCount = lessons.length; 
    if (idx === 1) completeCount = Math.min(1, lessons.length); 
    if (idx === 2) completeCount = 0;
    if (idx === 3) completeCount = lessons.length; 

    for (let i = 0; i < completeCount; i++) {
      await prisma.lessonProgress.upsert({
        where: {
          lessonId_userId: { lessonId: lessons[i].id, userId: student.id },
        },
        create: {
          lessonId: lessons[i].id,
          userId: student.id,
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

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
