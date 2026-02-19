import "dotenv/config";
import {
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

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

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: "Web Development Fundamentals",
        description:
          "Learn HTML, CSS, and JavaScript fundamentals with hands-on projects.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
        price: 49.99,
        isPublished: true,
        instructorId: instructor1.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Advanced React Patterns",
        description:
          "Master advanced React architecture and performance optimization.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop",
        price: 69.99,
        isPublished: true,
        instructorId: instructor2.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Node.js and Express Backend",
        description:
          "Build scalable REST APIs with Node.js, Express, and MySQL.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1516321318423-f06a6b1ef01d?w=500&h=300&fit=crop",
        price: 59.99,
        isPublished: true,
        instructorId: instructor1.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Database Design and SQL",
        description:
          "Design efficient schemas and write optimized SQL queries.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop",
        price: 39.99,
        isPublished: true,
        instructorId: instructor3.id,
      },
    }),
  ]);

  const lessonTitles = [
    "Introduction",
    "Core Concepts",
    "Advanced Topics",
    "Practical Applications",
    "Project Work",
  ];

  for (const course of courses) {
    for (let sectionIndex = 1; sectionIndex <= 2; sectionIndex++) {
      const section = await prisma.courseSection.create({
        data: {
          courseId: course.id,
          title: `Section ${sectionIndex}`,
          sectionOrder: sectionIndex,
        },
      });

      for (let lessonIndex = 1; lessonIndex <= 5; lessonIndex++) {
        const lesson = await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: `Lesson ${lessonIndex}: ${lessonTitles[lessonIndex - 1]}`,
            lessonOrder: lessonIndex,
          },
        });

        await prisma.lessonContent.create({
          data: {
            lessonId: lesson.id,
            contentType: "TEXT",
            contentBody:
              "This lesson includes curated explanations, examples, and practice tasks.",
            contentOrder: 1,
          },
        });

        const quiz = await prisma.quiz.create({
          data: {
            lessonId: lesson.id,
            title: `Quick Check ${lessonIndex}`,
          },
        });

        const question = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: "Which concept is most important in this lesson?",
          },
        });

        await prisma.quizOption.createMany({
          data: [
            {
              questionId: question.id,
              optionText: "Core idea",
              isCorrect: true,
            },
            {
              questionId: question.id,
              optionText: "Optional detail",
              isCorrect: false,
            },
          ],
        });
      }
    }
  }

  await prisma.courseEnrollment.createMany({
    data: [
      {
        userId: student.id,
        courseId: courses[0].id,
        status: "ACTIVE",
      },
      {
        userId: student.id,
        courseId: courses[1].id,
        status: "ACTIVE",
      },
      {
        userId: student.id,
        courseId: courses[3].id,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    ],
  });

  await prisma.courseProgress.createMany({
    data: [
      {
        userId: student.id,
        courseId: courses[0].id,
        status: "IN_PROGRESS",
        completionPercentage: 65.0,
      },
      {
        userId: student.id,
        courseId: courses[1].id,
        status: "IN_PROGRESS",
        completionPercentage: 30.0,
      },
      {
        userId: student.id,
        courseId: courses[3].id,
        status: "COMPLETED",
        completionPercentage: 100.0,
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
