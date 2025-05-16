import { db } from "@/lib/prisma";

export const getCourses = async () => {
  try {
    console.log("Fetching courses...");

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

    console.log(`Found ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};
