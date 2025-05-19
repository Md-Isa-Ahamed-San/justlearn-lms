import { db } from "@/lib/prisma";
import { cache } from "react";

// In-memory cache for instructor stats
const instructorStatsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// ⏳ Cache course list
export const getCourseList = cache(async () => {
  console.log("Fetching course list...");
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

    console.log(`Found ${courses.length} courses.`);
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
});

// ⏳ Cache course details by ID
export const getCourseDetails = cache(async (id) => {
  console.log("Fetching CourseDetails...");
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: true,
        quizSet: true,
        weeks: true,
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

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
});

// Cached wrapper using react's cache()
export const getInstructorDetailedStats = cache(async (instructorId) => {
  const cached = instructorStatsCache.get(instructorId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("✅ Using cached instructor stats for:", instructorId);
    return cached.data;
  }

  console.time(`instructorStats_${instructorId}`);

  try {
    console.time("Step 1: Getting courses");
    const courses = await db.course.findMany({
      where: {
        instructorId: instructorId,
      },
      select: {
        id: true,
      },
    });

    const courseIds = courses.map((course) => course.id);
    const courseCount = courseIds.length;
    console.timeEnd("Step 1: Getting courses");

    console.time("Step 2: Counting students");
    const enrollments = await db.enrollment.groupBy({
      by: ["courseId"],
      where: {
        courseId: { in: courseIds },
      },
      _count: {
        id: true,
      },
    });

    const totalStudents = enrollments.reduce(
      (total, item) => total + item._count.id,
      0
    );
    console.timeEnd("Step 2: Counting students");

    console.time("Step 3: Calculating ratings");
    const testimonials = await db.testimonial.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        rating: {
          not: 1, // ✅ This works
        },
      },
      select: {
        rating: true,
      },
    });

    const testimonialCount = testimonials.length;
    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);

    const averageRating =
      testimonialCount > 0 ? totalRating / testimonialCount : 0;
    console.timeEnd("Step 3: Calculating ratings");

    const result = {
      courseCount,
      totalStudents,
      averageRating: parseFloat(averageRating.toFixed(2)),
      testimonialCount,
    };

    // Store in memory cache
    instructorStatsCache.set(instructorId, {
      data: result,
      timestamp: Date.now(),
    });

    console.timeEnd(`instructorStats_${instructorId}`);
    return result;
  } catch (error) {
    console.error("Error fetching instructor statistics:", error);
    console.timeEnd(`instructorStats_${instructorId}`);
    throw error;
  }
});
