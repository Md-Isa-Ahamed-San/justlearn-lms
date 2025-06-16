import { db } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

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
              isActive: true,
              instructor: {
                select: {
                  id: true,
                  designation: true,
                  bio: true,

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
// ✅ Get Course Details By ID
export const getCourseDetailsById = async (id) => {
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          include: {
            instructor: true,
          },
        },
        weeks: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        testimonials: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return course;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

// ✅ Get Instructor Stats (Cache removed)
export const getInstructorDetailedStats = async (instructorId) => {
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
          select: { id: true },
        },
      },
    });

    if (!instructor) {
      throw new Error(`Instructor with ID ${instructorId} not found`);
    }

    // Get all courses created by this instructor's user account
    const courses = await db.course.findMany({
      where: {
        userId: instructor.user.id, // Use the user.id from the instructor
        active: true, // Only count active courses
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

    // Get student statistics using CourseProgress (instead of enrollment)
    const courseProgressStats = await db.courseProgress.groupBy({
      by: ["courseId"],
      where: {
        courseId: { in: courseIds },
      },
      _count: { id: true },
    });

    const totalStudents = courseProgressStats.reduce(
      (total, item) => total + item._count.id,
      0
    );

    // Alternative: Get unique students from Participation table
    // const participationStats = await db.participation.groupBy({
    //   by: ["courseId"],
    //   where: {
    //     courseId: { in: courseIds },
    //   },
    //   _count: { id: true },
    // });

    // Get testimonials for instructor's courses
    const testimonials = await db.testimonial.findMany({
      where: {
        courseId: { in: courseIds },
        rating: {
          not: null,
          gte: 1,
        }, // Get all testimonials with valid ratings
      },
      select: { rating: true },
    });

    const testimonialCount = testimonials.length;
    const totalRating = testimonials.reduce(
      (sum, t) => sum + (t.rating || 0),
      0
    );
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
};

// ✅ Get User's Enrolled Courses
export const getUserEnrolledCourses = async (userId) => {
  try {
    // Add validation for userId
    if (!userId) {
      console.error("❌ No userId provided");
      throw new Error("User ID is required");
    }

    console.log("🔄 Fetching enrolled courses for user:", userId);

    // Get all course progress records for the user (which represents enrollment)
    const enrolledCourses = await db.courseProgress.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: {
          include: {
            category: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                instructor: {
                  select: {
                    id: true,
                    designation: true,
                    bio: true,
                    department: true,
                  },
                },
              },
            },
            weeks: {
              select: {
                id: true,
                title: true,
                order: true,
                duration: true,
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    duration: true,
                    order: true,
                    active: true,
                  },
                  orderBy: {
                    order: "asc",
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
            _count: {
              select: {
                testimonials: true,
                courseProgress: true, // Total enrolled students
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recently enrolled first
      },
    });

    // Transform the data to include additional calculated fields
    const transformedCourses = enrolledCourses.map((enrollment) => {
      const course = enrollment.course;

      // Calculate total course duration
      const totalDuration = course.weeks.reduce((total, week) => {
        const weekDuration = week.lessons.reduce((weekTotal, lesson) => {
          return weekTotal + (lesson.duration || 0);
        }, 0);
        return total + weekDuration;
      }, 0);

      // Calculate total lessons
      const totalLessons = course.weeks.reduce((total, week) => {
        return total + week.lessons.length;
      }, 0);

      return {
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt,
        lastUpdated: enrollment.updatedAt,
        course: {
          ...course,
          totalDuration,
          totalLessons,
          totalWeeks: course.weeks.length,
          totalStudents: course._count.courseProgress,
          totalTestimonials: course._count.testimonials,
        },
      };
    });

    console.log(
      `✅ Found ${transformedCourses.length} enrolled courses for user ${userId}`
    );

    return transformedCourses;
  } catch (error) {
    console.error(
      `❌ Error fetching enrolled courses for user ${userId}:`,
      error
    );
    throw error;
  }
};

// ✅ Get User's Enrolled Courses with Detailed Progress (Alternative version)
export const getUserEnrolledCoursesWithProgress = unstable_cache(
  async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log(
        "🔄 Fetching detailed enrolled courses with progress for user:",
        userId
      );

      const enrolledCourses = await db.courseProgress.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: {
            include: {
              category: true,
              user: {
                include: {
                  instructor: true,
                },
              },
              weeks: {
                include: {
                  lessons: {
                    select: {
                      id: true,
                      title: true,
                      duration: true,
                      order: true,
                      active: true,
                      // Get user's watch progress for each lesson
                      watches: {
                        where: {
                          userId: userId,
                        },
                        select: {
                          id: true,
                          state: true,
                          lastTime: true,
                        },
                      },
                    },
                    orderBy: {
                      order: "asc",
                    },
                  },
                  // Get user's quiz attempts for each week
                  quizzes: {
                    select: {
                      id: true,
                      title: true,
                      status: true,
                      submissions: {
                        where: {
                          userId: userId,
                        },
                        select: {
                          id: true,
                          status: true,
                          score: true,
                          attemptNumber: true,
                          endTime: true,
                        },
                        orderBy: {
                          attemptNumber: "desc",
                        },
                        take: 1, // Get latest attempt
                      },
                    },
                  },
                },
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform with detailed progress information
      const detailedCourses = enrolledCourses.map((enrollment) => {
        const course = enrollment.course;

        // Calculate watched lessons
        let totalWatchedLessons = 0;
        let totalCompletedQuizzes = 0;
        let totalLessons = 0;
        let totalQuizzes = 0;

        course.weeks.forEach((week) => {
          totalLessons += week.lessons.length;
          totalQuizzes += week.quizzes.length;

          // Count watched lessons (state === 'completed' or similar)
          week.lessons.forEach((lesson) => {
            if (
              lesson.watches.length > 0 &&
              lesson.watches[0].state === "completed"
            ) {
              totalWatchedLessons++;
            }
          });

          // Count completed quizzes
          week.quizzes.forEach((quiz) => {
            if (
              quiz.submissions.length > 0 &&
              quiz.submissions[0].status === "completed"
            ) {
              totalCompletedQuizzes++;
            }
          });
        });

        const lessonsCompletionRate =
          totalLessons > 0 ? (totalWatchedLessons / totalLessons) * 100 : 0;
        const quizzesCompletionRate =
          totalQuizzes > 0 ? (totalCompletedQuizzes / totalQuizzes) * 100 : 0;

        return {
          enrollmentId: enrollment.id,
          enrollmentStatus: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.createdAt,
          lastUpdated: enrollment.updatedAt,
          progressDetails: {
            totalLessons,
            watchedLessons: totalWatchedLessons,
            lessonsCompletionRate:
              Math.round(lessonsCompletionRate * 100) / 100,
            totalQuizzes,
            completedQuizzes: totalCompletedQuizzes,
            quizzesCompletionRate:
              Math.round(quizzesCompletionRate * 100) / 100,
          },
          course,
        };
      });

      return detailedCourses;
    } catch (error) {
      console.error(
        `❌ Error fetching detailed enrolled courses for user ${userId}:`,
        error
      );
      throw error;
    }
  },
  (userId) => [`user-enrolled-courses-detailed-${userId}`],
  {
    revalidate: REVALIDATE_TIME,
  }
);

// ✅ Get User's Course Enrollment Status (Check if enrolled in specific course)
export const getUserCourseEnrollmentStatus = unstable_cache(
  async (userId, courseId) => {
    try {
      if (!userId || !courseId) {
        throw new Error("Both User ID and Course ID are required");
      }

      const enrollment = await db.courseProgress.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
        },
        select: {
          id: true,
          status: true,
          progress: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      };
    } catch (error) {
      console.error(`❌ Error checking enrollment status:`, error);
      throw error;
    }
  },
  (userId, courseId) => [`enrollment-status-${userId}-${courseId}`],
  {
    revalidate: REVALIDATE_TIME,
  }
);

export async function getInstructorAnalytics(instructorUserId) {
  try {
    // Get instructor's courses with related data
    const instructorCourses = await db.course.findMany({
      where: {
        userId: instructorUserId,
        active: true,
      },
      include: {
        weeks: {
          include: {
            lessons: true,
            quizzes: {
              include: {
                submissions: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        testimonials: true,
        certificates: true,
        courseProgress: {
          include: {
            user: true,
          },
        },
        participations: {
          include: {
            user: true,
          },
        },
      },
    });

    // Calculate total courses
    const totalCourses = instructorCourses.length;

    // Calculate unique students across all courses (based on course progress and participations)
    const uniqueStudentIds = new Set();
    instructorCourses.forEach((course) => {
      course.courseProgress.forEach((progress) => {
        uniqueStudentIds.add(progress.userId);
      });
      course.participations.forEach((participation) => {
        uniqueStudentIds.add(participation.userId);
      });
    });
    const totalStudents = uniqueStudentIds.size;

    // Calculate total lessons and quizzes
    let totalLessons = 0;
    let totalQuizzes = 0;
    let totalQuizSubmissions = 0;
    let completedCourses = 0;

    instructorCourses.forEach((course) => {
      course.weeks.forEach((week) => {
        totalLessons += week.lessons.length;
        totalQuizzes += week.quizzes.length;
        week.quizzes.forEach((quiz) => {
          totalQuizSubmissions += quiz.submissions.length;
        });
      });

      // Count completed courses (progress = 100)
      completedCourses += course.courseProgress.filter(
        (progress) => progress.progress === 100
      ).length;
    });

    // Calculate average rating
    const allTestimonials = instructorCourses.flatMap(
      (course) => course.testimonials
    );
    const averageRating =
      allTestimonials.length > 0
        ? allTestimonials.reduce(
            (sum, testimonial) => sum + (testimonial.rating || 0),
            0
          ) / allTestimonials.length
        : 0;

    // Calculate completion rate
    const completionRate =
      totalStudents > 0 ? (completedCourses / totalStudents) * 100 : 0;

    // Get recent activity (recent quiz submissions)
    const recentActivity = await db.quizSubmission.findMany({
      where: {
        quiz: {
          week: {
            course: {
              userId: instructorUserId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        quiz: {
          include: {
            week: {
              include: {
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get course performance data
    const coursePerformance = instructorCourses.map((course) => {
      const courseStudents = course.courseProgress.length;
      const courseCompletions = course.courseProgress.filter(
        (progress) => progress.progress === 100
      ).length;
      const courseRating =
        course.testimonials.length > 0
          ? course.testimonials.reduce(
              (sum, testimonial) => sum + (testimonial.rating || 0),
              0
            ) / course.testimonials.length
          : 0;

      return {
        id: course.id,
        title: course.title,
        students: courseStudents,
        completions: courseCompletions,
        completionRate:
          courseStudents > 0 ? (courseCompletions / courseStudents) * 100 : 0,
        rating: courseRating,
        totalLessons: course.weeks.reduce(
          (sum, week) => sum + week.lessons.length,
          0
        ),
        totalQuizzes: course.weeks.reduce(
          (sum, week) => sum + week.quizzes.length,
          0
        ),
      };
    });

    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.courseProgress.groupBy({
      by: ["createdAt"],
      where: {
        course: {
          userId: instructorUserId,
        },
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      totalCourses,
      totalStudents,
      totalLessons,
      totalQuizzes,
      totalQuizSubmissions,
      completedCourses,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
      totalCertificates: instructorCourses.reduce(
        (sum, course) => sum + course.certificates.length,
        0
      ),
      recentActivity,
      coursePerformance,
      monthlyStats,
      // Additional metrics
      totalTestimonials: allTestimonials.length,
      publishedCourses: instructorCourses.filter((course) => course.active)
        .length,
      averageStudentsPerCourse:
        totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0,
    };
  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    throw new Error("Failed to fetch analytics data");
  }
}

export async function getAllCategories() {
  try {
    const categories = await db.category.findMany();
    // console.log(" getAllCategories ~ categories:", categories)

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

export const getInstructorCourses = async (instructorId) => {
  try {
    if (!instructorId) {
      console.error("❌ No instructorId provided");
      return []; // Return empty array instead of throwing error
    }

    // console.log("🔄 Fetching courses for instructor:", instructorId);

    const instructor = await db.instructor.findUnique({
      where: { id: instructorId }
      
    });

    if (!instructor) {
      console.error(`Instructor with ID ${instructorId} not found`);
      return []; // Return empty array instead of throwing error
    }

    const courses = await db.course.findMany({
      where: {
        userId: instructor.userId, // Fixed: use instructor.userId instead of instructor.id
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            instructor: {
              select: {
                id: true,
                designation: true,
                bio: true,
                department: true,
              },
            },
          },
        },
        weeks: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
                active: true,
              },
              orderBy: {
                order: "asc",
              },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
                status: true,
                active: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        testimonials: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            testimonials: true,
            courseProgress: true,
            certificates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include additional calculated fields
    const transformedCourses = courses.map((course) => {
      // Calculate total course duration
      const totalDuration = course.weeks.reduce((total, week) => {
        const weekDuration = week.lessons.reduce((weekTotal, lesson) => {
          return weekTotal + (lesson.duration || 0);
        }, 0);
        return total + weekDuration;
      }, 0);

      // Calculate total lessons and quizzes
      const totalLessons = course.weeks.reduce((total, week) => {
        return total + week.lessons.length;
      }, 0);

      const totalQuizzes = course.weeks.reduce((total, week) => {
        return total + week.quizzes.length;
      }, 0);

      // Calculate average rating
      const averageRating =
        course.testimonials.length > 0
          ? course.testimonials.reduce(
              (sum, testimonial) => sum + (testimonial.rating || 0),
              0
            ) / course.testimonials.length
          : 0;

      return {
        ...course,
        totalDuration,
        totalLessons,
        totalQuizzes,
        totalWeeks: course.weeks.length,
        totalStudents: course._count.courseProgress,
        totalTestimonials: course._count.testimonials,
        totalCertificates: course._count.certificates,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      };
    });

    console.log(
      `✅ Found ${transformedCourses.length} courses for instructor ${instructorId}`
    );

    return transformedCourses;
  } catch (error) {
    console.error(
      `❌ Error fetching courses for instructor ${instructorId}:`,
      error
    );
    return []; // Return empty array on error instead of throwing
  }
};