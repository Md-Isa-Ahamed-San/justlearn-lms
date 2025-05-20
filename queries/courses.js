import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ⏱ TTL for all caches (5 minutes)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// 🧠 In-memory caches
const courseListCache = {
  data: null,
  timestamp: 0,
};

const courseDetailsCache = new Map(); // key: courseId → { data, timestamp }
const instructorStatsCache = new Map(); // key: instructorId → { data, timestamp }

// ✅ Get All Courses (Cached)
export const getCourseList = async () => {
  if (
    courseListCache.data &&
    Date.now() - courseListCache.timestamp < CACHE_TTL
  ) {
    console.log("✅ Using cached course list");
    return courseListCache.data;
  }

  console.log("⏱ Fetching fresh course list from DB...");
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

    // cache it
    courseListCache.data = courses;
    courseListCache.timestamp = Date.now();

    return courses;
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    throw error;
  }
};

// ✅ Get Course Details by ID (Cached per Course)
// queries/courses.ts



// ⏳ Caching getCourseDetails with 5 min revalidate
export const getCourseDetails = unstable_cache(
  async (id) => {
    console.log("🔄 DB fetch: getCourseDetails", id); // visible only on actual fetch
    return await db.course.findUnique({
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
  },
  (id) => [`course-details-${id}`], // 🔑 cache key per id
  {
    revalidate: 300, // 5 min cache
  }
);

export const getCourseDetailss = async (id) => {
  const cached = courseDetailsCache.get(id);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Using cached details for course ${id}`);
    return cached.data;
  }

  console.log(`⏱ Fetching course ${id} details from DB...`);
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

    courseDetailsCache.set(id, {
      data: course,
      timestamp: Date.now(),
    });

    return course;
  } catch (error) {
    console.error(`❌ Error fetching course ${id} details:`, error);
    throw error;
  }
};

// ✅ Get Instructor Stats (Cached per Instructor)
export const getInstructorDetailedStats = async (instructorId) => {
  const cached = instructorStatsCache.get(instructorId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Using cached instructor stats for ${instructorId}`);
    return cached.data;
  }

  console.time(`instructorStats_${instructorId}`);
  try {
    console.time("Step 1: Getting courses");
    const courses = await db.course.findMany({
      where: { instructorId },
      select: { id: true },
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
      _count: { id: true },
    });

    const totalStudents = enrollments.reduce(
      (total, item) => total + item._count.id,
      0
    );
    console.timeEnd("Step 2: Counting students");

    console.time("Step 3: Calculating ratings");
    const testimonials = await db.testimonial.findMany({
      where: {
        courseId: { in: courseIds },
        rating: {
          not: 1, // FIXED: null-safe filter
        },
      },
      select: { rating: true },
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

    instructorStatsCache.set(instructorId, {
      data: result,
      timestamp: Date.now(),
    });

    console.timeEnd(`instructorStats_${instructorId}`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching instructor statistics:", error);
    console.timeEnd(`instructorStats_${instructorId}`);
    throw error;
  }
};
