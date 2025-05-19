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
        modules: true,
        testimonials: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
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
