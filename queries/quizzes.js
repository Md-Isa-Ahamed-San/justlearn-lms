import { db } from "@/lib/prisma";

// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';
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
export async function createQuiz(
  title,description,instructorId,generationType
) {
  try {
    const res = await db.quiz.create({
      data: {
        title,
        description,
        createdByUserId: instructorId,
        generationType,
      },
    });
    return res;
  } catch (e) {
    throw new Error(e);
  }
}
export async function updateQuizBasicInfo(quizId, updateData) {
  try {
    if (!quizId) {
      throw new Error("Quiz ID is required to update quiz information.");
    }

    // Validate updateData
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("Update data is required.");
    }

    // Validate status if provided
    if (
      updateData.status &&
      !["draft", "published"].includes(updateData.status)
    ) {
      throw new Error("Status must be either 'draft' or 'published'.");
    }

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (typeof updateData.title !== "string") {
        throw new Error("Title must be a string.");
      }
      if (updateData.title.trim().length === 0) {
        throw new Error("Title cannot be empty.");
      }
      if (updateData.title.length > 60) {
        throw new Error("Title must be less than 60 characters.");
      }
    }

    // Validate description if provided
    if (updateData.description !== undefined) {
      if (typeof updateData.description !== "string") {
        throw new Error("Description must be a string.");
      }
      if (updateData.description.length > 200) {
        throw new Error("Description must be less than 200 characters.");
      }
    }

    // Remove generationType from updateData if present (since it's ignored)
    if (updateData.generationType) {
      console.log("generationType field ignored in update operation");
      delete updateData.generationType;
    }

    const updateObject = {
      updatedAt: new Date(),
    };

    // Add fields to update
    if (updateData.title !== undefined) {
      updateObject.title = updateData.title.trim();
    }

    if (updateData.description !== undefined) {
      updateObject.description = updateData.description.trim();
    }

    if (updateData.status !== undefined) {
      updateObject.status = updateData.status;
    }
    
    if (updateData.active !== undefined) {
      updateObject.active = updateData.active;
    }

    const updatedQuiz = await db.quiz.update({
      where: {
        id: quizId,
      },
      data: updateObject,
    });

    console.log(`Quiz ${quizId} updated successfully:`, updateObject);
    return updatedQuiz;
    
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error.message);

    // Handle Prisma-specific errors
    if (error.code === "P2025") {
      throw new Error("Quiz not found. Please check the quiz ID.");
    }

    if (error.code === "P2002") {
      throw new Error("A quiz with this title already exists.");
    }

    throw new Error(`Failed to update quiz. Details: ${error.message}`);
  }
}


