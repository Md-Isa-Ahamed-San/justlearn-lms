"use server"
import {getLoggedInUser} from "@/lib/loggedin-user";
import {db} from "@/lib/prisma";

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
