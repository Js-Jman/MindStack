import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

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

function d(n: number): Prisma.Decimal {
  // Convenience helper for MySQL Decimal
  return new Prisma.Decimal(n);
}

type SeedLessonSpec = {
  title: string;
  textHtml: string;
  imageUrl: string;
  videoUrl: string;
};

type SeedSectionSpec = {
  title: string;
  lessons: SeedLessonSpec[];
};

type SeedCourseSpec = {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  introVideoUrl?: string | null;
  price?: number | null;
  isPublished?: boolean;
  sections: SeedSectionSpec[];
};

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

  //Users
  const student = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "student@example.com",
      password: "hashedpassword123",
      role: "STUDENT",
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
    },
  });

  // Reusable demo media
  const demoVideos = [
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
    "https://res.cloudinary.com/djfefn9qx/video/upload/v1772780658/videoplayback_csonvy.mp4",
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

  // Enrollments for the student

  await prisma.courseEnrollment.createMany({
    data: createdCourses.map((c) => ({
      userId: student.id,
      courseId: c.id,
      status: "ACTIVE",
    })),
    skipDuplicates: true,
  });


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

    await computeAndUpsertCourseProgress(student.id, course.id);
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
