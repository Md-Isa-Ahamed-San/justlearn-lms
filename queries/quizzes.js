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
export async function getQuizDetailsById(quizId) {
  if (!quizId) {
    console.warn("getQuizById called without a quizId.");
    return null; // Or throw new Error("Quiz ID is required.");
  }

  try {
    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!quiz) {
      console.log(`Quiz with ID ${quizId} not found.`);
      return null;
    }

    return quiz;
  } catch (error) {
    console.error(
      `Error fetching quiz with ID ${quizId} using Prisma:`,
      error.message
    );

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

export async function createQuiz(title, description, instructorId) {
  try {
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
