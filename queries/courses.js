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
          user: {
            select: {
              id: true,
              name: true,
              
              email: true,
              role: true,
              isActive : true,
              instructor: {
                select: {
                  id: true,
                  designation: true,
                  bio: true,
                  profilePicture: true,
                  department: true,
                },
              },
            },
          },
         
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
          user: {
            include: {
              instructor: true, // Get instructor details through user
            },
          },
        
          weeks: {
            include: {
              lessons: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          testimonials: {
            include: {
              user: true, // Get user details directly since testimonials reference userId
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

      // Debug: Check instructor information
      if (course?.user?.instructor) {
        console.log("Instructor found:", course.user.instructor.id);
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
      // Add validation for instructorId
      if (!instructorId) {
        console.error("❌ No instructorId provided");
        throw new Error("Instructor ID is required");
      }

      console.log("🔄 Fetching instructor stats for:", instructorId);

      // First, get the instructor record with user relationship
      const instructor = await db.instructor.findUnique({
        where: { id: instructorId },
        include: {
          user: {
            select: { id: true }
          }
        },
      });

      if (!instructor) {
        throw new Error(`Instructor with ID ${instructorId} not found`);
      }

      // Get all courses created by this instructor's user account
      const courses = await db.course.findMany({
        where: {
          userId: instructor.user.id, // Use the user.id from the instructor
          active: true // Only count active courses
        },
        select: { id: true },
      });

      const courseIds = courses.map((course) => course.id);
      const courseCount = courseIds.length;

      // If no courses, return early with zero stats
      if (courseCount === 0) {
        return {
          courseCount: 0,
          totalStudents: 0,
          averageRating: 0,
          testimonialCount: 0,
        };
      }

      // Get enrollment statistics
      const enrollmentStats = await db.enrollment.groupBy({
        by: ["courseId"],
        where: {
          courseId: { in: courseIds },
        },
        _count: { id: true },
      });

      const totalStudents = enrollmentStats.reduce(
        (total, item) => total + item._count.id,
        0
      );

      // Get testimonials for instructor's courses
      const testimonials = await db.testimonial.findMany({
        where: {
          courseId: { in: courseIds },
          rating: { 
            not: null,
            gte: 1 
          }, // Get all testimonials with valid ratings
        },
        select: { rating: true },
      });

      const testimonialCount = testimonials.length;
      const totalRating = testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
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
  (instructorId) => [`instructor-details-${instructorId}`],
  {
    revalidate: REVALIDATE_TIME,
  }
);