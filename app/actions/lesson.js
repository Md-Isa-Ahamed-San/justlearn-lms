"use server";

import { getLoggedInUser } from "@/lib/loggedin-user";
import { db } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
import { markLessonComplete, markLessonIncomplete } from "@/queries/lesson";
// !MARK: createLesson
export async function createLesson(data) {
    try {
        const loggedinUser = await getLoggedInUser();

        if (!loggedinUser?.id) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        // Validate required fields
        if (!data.weekId || !data.courseId || !data.title || !data.description) {
            return {
                success: false,
                error: "Week ID, Course ID, Title, and Description are required"
            };
        }

        // Validate that the week exists and belongs to the course
        const week = await db.week.findFirst({
            where: {
                id: data.weekId,
                courseId: data.courseId,
            },
        });

        if (!week) {
            return {
                success: false,
                error: "Week not found or doesn't belong to the specified course"
            };
        }

        // Validate that the course belongs to the logged-in user
        const course = await db.course.findFirst({
            where: {
                id: data.courseId,
                userId: loggedinUser.id,
            },
        });

        if (!course) {
            return {
                success: false,
                error: "Course not found or you don't have permission to modify it"
            };
        }

        // Ensure order is a valid number
        const orderNumber = parseInt(data.order, 10);
        if (isNaN(orderNumber)) {
            return {
                success: false,
                error: "Order must be a valid number"
            };
        }

        // Create the lesson
        const newLesson = await db.lesson.create({
            data: {
                title: data.title,
                description: data.description,
                videoUrl: data.videoUrl || null,
                weekId: data.weekId,
                order: orderNumber,
                duration: data.duration || 0,
                access: data.access || "private",
                active: data.active || false,
                attachments: data.attachments || null,
            },
            include: {
                week: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });

        // Revalidate relevant paths
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}/week/${data.weekId}`);
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}`);

        return {
            success: true,
            lesson: newLesson,
            message: "Lesson created successfully"
        };

    } catch (error) {
        console.error("Error creating lesson:", error);
        return {
            success: false,
            error: `Failed to create lesson: ${error.message}`
        };
    }
}
// !!MARK: updateLesson
export async function updateLesson(data, lessonId, courseId, weekId) {
    try {
        const loggedinUser = await getLoggedInUser();

        if (!loggedinUser?.id) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        if (!lessonId) {
            return {
                success: false,
                error: "Lesson ID needed."
            };
        }

        // Validate that the lesson exists and get course/week info for revalidation
        const existingLesson = await db.lesson.findFirst({
            where: {
                id: lessonId,
            },
            include: {
                week: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });

        if (!existingLesson) {
            return {
                success: false,
                error: "Lesson not found."
            };
        }

        // Prepare update data - only include fields that are provided
        const updateData = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.access !== undefined) updateData.access = data.access;
        if (data.active !== undefined) updateData.active = data.active;

        // Handle attachments with validation
        if (data.attachments !== undefined) {
            // Validate attachments structure
            if (Array.isArray(data.attachments)) {
                const validAttachments = data.attachments.filter(attachment => {
                    return attachment &&
                        typeof attachment === 'object' &&
                        attachment.name &&
                        attachment.url &&
                        attachment.type;
                });

                // Validate URLs in attachments
                for (const attachment of validAttachments) {
                    try {
                        new URL(attachment.url);
                    } catch (error) {
                        return {
                            success: false,
                            error: `Invalid URL in attachment: ${attachment.name}`
                        };
                    }
                }

                updateData.attachments = validAttachments;
            } else {
                return {
                    success: false,
                    error: "Attachments must be an array"
                };
            }
        }

        if (data.order !== undefined) {
            const orderNumber = parseInt(data.order, 10);
            if (isNaN(orderNumber)) {
                return {
                    success: false,
                    error: "Order must be a valid number"
                };
            }
            updateData.order = orderNumber;
        }

        // Check if there's any data to update
        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: "No valid data provided for update"
            };
        }

        // Update the lesson using the lessonId parameter
        const updatedLesson = await db.lesson.update({
            where: {
                id: lessonId,
            },
            data: updateData,
            include: {
                week: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });
console.log("updatedLesson: ",updatedLesson)

        // Revalidate relevant paths
        revalidatePath(`/instructor-dashboard/courses/${courseId}/week/${weekId}`);
        revalidatePath(`/instructor-dashboard/courses/${courseId}`);
        revalidatePath(`/instructor-dashboard/courses/${courseId}/week/${weekId}/lesson/${lessonId}`);

        return {
            success: true,
            lesson: updatedLesson,
            message: "Lesson updated successfully"
        };

    } catch (error) {
        console.error("Error updating lesson:", error);
        return {
            success: false,
            error: `Failed to update lesson: ${error.message}`
        };
    }
}
// !!MARK: deleteLesson
export async function deleteLesson(data) {
    try {
        const loggedinUser = await getLoggedInUser();

        if (!loggedinUser?.id) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        // Validate required fields
        if (!data.lessonId || !data.weekId || !data.courseId) {
            return {
                success: false,
                error: "Lesson ID, Week ID, and Course ID are required"
            };
        }

        // Validate that the lesson exists and belongs to the correct week/course
        const existingLesson = await db.lesson.findFirst({
            where: {
                id: data.lessonId,
                weekId: data.weekId,
                week: {
                    courseId: data.courseId,
                    course: {
                        userId: loggedinUser.id,
                    },
                },
            },
        });

        if (!existingLesson) {
            return {
                success: false,
                error: "Lesson not found or you don't have permission to delete it"
            };
        }

        // Delete the lesson
        await db.lesson.delete({
            where: {
                id: data.lessonId,
            },
        });

        // Revalidate relevant paths
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}/week/${data.weekId}`);
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}`);

        return {
            success: true,
            message: "Lesson deleted successfully"
        };

    } catch (error) {
        console.error("Error deleting lesson:", error);
        return {
            success: false,
            error: `Failed to delete lesson: ${error.message}`
        };
    }
}
// !!MARK: reorderLessons
export async function reorderLessons(data) {
    try {
        const loggedinUser = await getLoggedInUser();

        if (!loggedinUser?.id) {
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        // Validate required fields
        if (!data.courseId || !data.weekId || !data.lessons || !Array.isArray(data.lessons)) {
            return {
                success: false,
                error: "Course ID, Week ID, and lessons array are required"
            };
        }

        // Validate that the week exists and belongs to the user's course
        const week = await db.week.findFirst({
            where: {
                id: data.weekId,
                courseId: data.courseId,
                course: {
                    userId: loggedinUser.id,
                },
            },
        });

        if (!week) {
            return {
                success: false,
                error: "Week not found or you don't have permission to modify it"
            };
        }

        // Validate that all lessons belong to the week
        const lessonIds = data.lessons.map(lesson => lesson.id);
        const existingLessons = await db.lesson.findMany({
            where: {
                id: { in: lessonIds },
                weekId: data.weekId,
            },
            select: { id: true },
        });

        if (existingLessons.length !== lessonIds.length) {
            return {
                success: false,
                error: "Some lessons don't belong to the specified week"
            };
        }

        // Update lessons in a transaction
        const updatePromises = data.lessons.map(lesson => {
            const orderNumber = parseInt(lesson.order, 10);
            if (isNaN(orderNumber)) {
                throw new Error(`Invalid order for lesson ${lesson.id}: ${lesson.order}`);
            }

            return db.lesson.update({
                where: { id: lesson.id },
                data: { order: orderNumber },
            });
        });

        await db.$transaction(updatePromises);

        // Revalidate relevant paths
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}/week/${data.weekId}`);
        revalidatePath(`/instructor-dashboard/courses/${data.courseId}`);

        return {
            success: true,
            message: "Lessons reordered successfully"
        };

    } catch (error) {
        console.error("Error reordering lessons:", error);
        return {
            success: false,
            error: `Failed to reorder lessons: ${error.message}`
        };
    }
}




export async function toggleLessonProgress(userId, lessonId, courseId, isCompleted) {
    try {
        if (isCompleted) {
            await markLessonIncomplete(userId, lessonId);
        } else {
            await markLessonComplete(userId, lessonId);
        }

        // Revalidate the course page to update the UI
        revalidatePath(`/courses/${courseId}`);

        return { success: true };
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        return { success: false, error: error.message };
    }
}