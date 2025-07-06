"use server"
import {getLoggedInUser} from "@/lib/loggedin-user";
import {db} from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
export async function createWeek(courseId, data) {
    try {
        const loggedinUser = await getLoggedInUser();

        if (!loggedinUser?.id) {
            throw new Error("User not authenticated");
        }

        // Validate courseId
        if (!courseId) {
            throw new Error("Course ID is required to create a week.");
        }

        // Validate input data
        if (!data.title || !data.description || data.order === undefined) {
            throw new Error("Title, Description, and Order are required for a week.");
        }

        // Ensure the order is a valid number
        const orderNumber = parseInt(data.order, 10);
        if (isNaN(orderNumber)) {
            throw new Error("Order must be a valid number.");
        }

        // Create the week record
        const newWeek = await db.week.create({
            data: {
                title: data.title,
                description: data.description,
                order: orderNumber,
                courseId: courseId,
                status: "draft", // Default status for a new week
                quizIds: [], // Default to empty array
            },
            include: {
                course: { // Include course details for context if needed
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        console.log("new week after create: ", newWeek)
        return newWeek;
    } catch (error) {
        console.error("Error creating week:", error);
        // Rethrow the error to be caught by the calling component
        throw new Error(`Failed to create week: ${error.message}`);
    }
}

export async function toggleAddRemoveQuizFromWeek(weekId, quizId) {
    try {
        if (!weekId || !quizId) {
            throw new Error("Week ID and Quiz ID are required");
        }

        // First, get the current week data
        const currentWeek = await db.week.findUnique({
            where: {
                id: weekId,
            },
            select: {
                quizIds: true,
            },
        });

        if (!currentWeek) {
            throw new Error("Week not found");
        }

        // Check if quizId exists in the array
        const currentQuizIds = currentWeek.quizIds || [];
        const quizIndex = currentQuizIds.indexOf(quizId);

        let updatedQuizIds;
        let action;

        if (quizIndex > -1) {
            // Quiz exists, remove it
            updatedQuizIds = currentQuizIds.filter(id => id !== quizId);
            action = 'removed';
        } else {
            // Quiz doesn't exist, add it
            updatedQuizIds = [...currentQuizIds, quizId];
            action = 'added';
        }

        // Update the week with new quizIds array
        const updatedWeek = await db.week.update({
            where: {
                id: weekId,
            },
            data: {
                quizIds: updatedQuizIds,
            },
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard/weeks');
        revalidatePath(`/dashboard/weeks/${weekId}`);

        return {
            success: true,
            action,
            updatedWeek,
            message: `Quiz ${action} successfully`,
        };

    } catch (error) {
        console.error(
            `Error toggling quiz ${quizId} for week ${weekId}:`,
            error.message
        );

        return {
            success: false,
            error: error.message,
            message: "Failed to update week quizzes",
        };
    }
}