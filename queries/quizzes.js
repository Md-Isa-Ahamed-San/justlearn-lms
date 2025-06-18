import { db } from "../lib/prisma";

export async function getAllQuizzesByInstructorId(instructorId) {
  try {
    if (!instructorId) {
      throw new Error("Instructor ID is required to fetch their quizzes.");
    }

    const quizzes = await db.quiz.findMany({
      where: {
        createdByUserId: instructorId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return quizzes;
  } catch (error) {
    console.error(
      `Error fetching quizzes for instructor ${instructorId} using Prisma:`,
      error.message
    );

    throw new Error(
      `Failed to retrieve quizzes for instructor. Details: ${error.message}`
    );
  }
}
export async function getQuizDetailsById(quizId, prismaInstance = prisma) {
    const client = prismaInstance;

    if (!client) {
        console.error("Prisma client is not available.");
        throw new Error("Database client is not configured.");
    }

    if (!quizId) {
        console.warn("getQuizById called without a quizId.");
        return null; // Or throw new Error("Quiz ID is required.");
    }

    try {
        const quiz = await client.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                questions: { // Include all related questions
                    orderBy: {
                        order: 'asc', // Optional: order questions by their 'order' field
                    },
                },
                createdBy: { // Include the user who created the quiz
                    select: { // Select only necessary fields from the User model
                        id: true,
                        name: true,
                        email: true, // Be mindful of exposing emails if not needed
                        image: true,
                    }
                },
                // You can include other relations if needed, e.g.,
                // aiGenerationLogs: true,
                // liveSession: true,
            },
        });

        if (!quiz) {
            console.log(`Quiz with ID ${quizId} not found.`);
            return null;
        }

        return quiz;

    } catch (error) {
        console.error(`Error fetching quiz with ID ${quizId} using Prisma:`, error.message);
        // Handle Prisma-specific errors if needed, e.g.,
        // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
        //   // Invalid ObjectId format
        //   console.error("Invalid quizId format provided:", quizId);
        //   return null; // Or throw a more specific error
        // }
        throw new Error(`Failed to retrieve quiz. Details: ${error.message}`);
    }
}

export async function getAllQuizSets(excludeUnPublished) {
  // try {
  //     let quizSets = [];
  //     if (excludeUnPublished) {
  //         quizSets = await Quizset.find({active: true}).lean();
  //     } else {
  //         quizSets = await Quizset.find().lean();
  //     }
  //       return replaceMongoIdInArray(quizSets);
  // } catch (e) {
  //     throw new Error(e);
  // }
}

export async function getQuizSetById(id) {
  //     try {
  //         const quizSet = await Quizset.findById(id)
  //             .populate({
  //                 path: "quizIds",
  //                 model: Quiz,
  //           }).lean();
  //           return replaceMongoIdInObject(quizSet);
  //     } catch (e) {
  //         throw new Error(e);
  //     }
}

export async function createQuiz(title,description,instructorId) {
  try{
      const res = await db.quiz.create({
        data: {
          title,
          description,
          createdByUserId: instructorId,
        },
      });
      return res;
  } catch (e) {
      throw new Error(e);
  }
}
