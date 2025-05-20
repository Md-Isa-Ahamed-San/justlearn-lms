import { db } from "../../../../lib/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  console.log(" GET ~ id:", id);
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: true,
        quizSet: true,
        weeks: true,
        testimonials: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    // console.log(" GET ~ course:", course);
    return course;
  } catch (error) {
    throw error;
  }
}
