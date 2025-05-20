import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ⏱ TTL in seconds
const REVALIDATE_TIME = 300;

// ✅ Get All Courses (Cached)
export const getCourseList = unstable_cache(
  async () => {
    try {
      const courses = await db.course.findMany({
        include: {
          category: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
              designation: true,
              bio: true,
            },
          },
          quizSet: true,
        },
      });

      return courses;
    } catch (error) {
      console.error("❌ Error fetching course list:", error);
      throw error;
    }
  },
  () => ["all-courses"],
  {
    revalidate: REVALIDATE_TIME,
  }
);

// ✅ Get Course Details by ID (Cached per Course)
// Modify your database query to ensure proper relations are loaded
export const getCourseDetails = unstable_cache(
  async (id) => {
    try {
      console.log("🔄 Fetching course details for:", id);

      const course = await db.course.findUnique({
        where: { id },
        include: {
          category: true,
          instructor: true,
          quizSet: true,
          weeks: {
            include: {
              lessons: true, // This is correctly including lessons
            },
            orderBy: {
              order: "asc", // Optional: sort weeks by order
            },
          },
          testimonials: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      // Debug: Check if weeks have associated lessons
      if (course?.weeks) {
        console.log("Weeks found:", course.weeks.length);
        course.weeks.forEach((week, i) => {
          console.log(
            `Week ${i + 1} (${week.id}) has ${
              week?.lessons?.length || 0
            } lessons`
          );
        });
      }

      return course;
    } catch (error) {
      console.error(`❌ Error fetching course details for ${id}:`, error);
      throw error;
    }
  },
  (id) => [`course-details-${id}`],
  {
    revalidate: REVALIDATE_TIME,
  }
);

// ✅ Get Instructor Stats (Cached per Instructor)
export const getInstructorDetailedStats = unstable_cache(
  async (instructorId) => {
    try {
      console.log("🔄 Fetching instructor stats for:", instructorId);

      const courses = await db.course.findMany({
        where: { instructorId },
        select: { id: true },
      });

      const courseIds = courses.map((course) => course.id);
      const courseCount = courseIds.length;

      const enrollments = await db.enrollment.groupBy({
        by: ["courseId"],
        where: {
          courseId: { in: courseIds },
        },
        _count: { id: true },
      });

      const totalStudents = enrollments.reduce(
        (total, item) => total + item._count.id,
        0
      );

      const testimonials = await db.testimonial.findMany({
        where: {
          courseId: { in: courseIds },
          rating: 1, // ✅ Correct null-safe filter
        },
        select: { rating: true },
      });

      const testimonialCount = testimonials.length;
      const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
      const averageRating =
        testimonialCount > 0 ? totalRating / testimonialCount : 0;

      return {
        courseCount,
        totalStudents,
        averageRating: parseFloat(averageRating.toFixed(2)),
        testimonialCount,
      };
    } catch (error) {
      console.error(
        `❌ Error fetching stats for instructor ${instructorId}:`,
        error
      );
      throw error;
    }
  },
  (i) => [`instructor-details-${id}`],
  {
    revalidate: REVALIDATE_TIME,
  }
);
