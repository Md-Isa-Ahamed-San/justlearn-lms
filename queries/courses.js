import { db } from "@/lib/prisma";

export const getCourseList = async () => {
  try {
    // console.log("Fetching courses...");

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
        // modules: true,
        // enrollments: true,
        // reports: true,
      },
    });

    console.log(`Found ${courses.length} courses.`);
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};
export const getCourseDetails = async (id) => {
  // console.log("single course id: ",id);

  try {
    const course = await db.course.findUnique({
      where: { id: id },
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
        // enrollments: true,
        // reports: true,
      },
    });
    // console.log(" getCourseDetails ~ course:", course)

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export async function getInstructorDetailedStats(instructorId) {
  // Start timing the execution
  console.time(`instructorStats_${instructorId}`);
  
  try {
    // Step 1: Get all courses by this instructor
    console.time('Step 1: Getting courses');
    const courses = await db.course.findMany({
      where: {
        instructorId: instructorId,
      },
      select: {
        id: true,
      },
    });
    
    const courseIds = courses.map(course => course.id);
    const courseCount = courseIds.length;
    console.timeEnd('Step 1: Getting courses');
    
    // Step 2: Count total students across all courses
    console.time('Step 2: Counting students');
    let totalStudents = 0;
    for (const courseId of courseIds) {
      const enrollmentCount = await db.enrollment.count({
        where: {
          courseId: courseId,
        },
      });
      totalStudents += enrollmentCount;
    }
    console.timeEnd('Step 2: Counting students');
    
    // Step 3: Calculate average rating from testimonials
    console.time('Step 3: Calculating ratings');
    let totalRating = 0;
    let testimonialCount = 0;
    
    for (const courseId of courseIds) {
      const testimonials = await db.testimonial.findMany({
        where: {
          courseId: courseId,
        },
        select: {
          rating: true,
        },
      });
      
      // Add up all ratings
      testimonials.forEach(testimonial => {
        if (testimonial.rating) {  // Make sure rating exists
          totalRating += testimonial.rating;
          testimonialCount++;
        }
      });
    }
    
    // Calculate the average rating (avoid division by zero)
    const averageRating = testimonialCount > 0 ? (totalRating / testimonialCount) : 0;
    console.timeEnd('Step 3: Calculating ratings');
    
    // Return complete stats object
    const result = {
      courseCount,
      totalStudents,
      averageRating: parseFloat(averageRating.toFixed(2)), // Round to 2 decimal places
      testimonialCount
    };
    
    // End timing the entire function
    console.timeEnd(`instructorStats_${instructorId}`);
    
    return result;
    
  } catch (error) {
    console.error("Error fetching instructor statistics:", error);
    // End timing even if there's an error
    console.timeEnd(`instructorStats_${instructorId}`);
    throw error;
  }
}