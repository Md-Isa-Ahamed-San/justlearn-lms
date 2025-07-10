// app/(main)/courses/[id]/quiz-participation/[quizId]/page.jsx
import { getQuizWithDetails } from "@/app/actions/quiz";
import { getUserQuizSubmissions } from "@/app/actions/quiz-submission";
import { getCurrentUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import QuizParticipationClient
    from "@/app/(main)/courses/[id]/quiz-participation/[quizId]/_component/quiz-participation-client";


export default async function QuizParticipationPage({ params }) {
    const { id: courseId, quizId } = params;

    // Get current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/auth/login");
    }


    // if (currentUser.role !== "student") {
    //     redirect(`/courses/${courseId}`);
    // }

    try {
        // Fetch quiz details with questions
        const quizData = await getQuizWithDetails(quizId);

        if (!quizData) {
            redirect(`/courses/${courseId}`);
        }

        // Check if quiz is published and active
        if (quizData.status !== "published" || !quizData.active) {
            redirect(`/courses/${courseId}`);
        }

        // Get user's previous submissions for this quiz
        const userSubmissions = await getUserQuizSubmissions(currentUser.id, quizId);

        // Check if user has exceeded max attempts
        const hasExceededAttempts = userSubmissions.length >= (quizData.maxAttempts || 1);

        // Check if user has a completed submission
        const hasCompletedSubmission = userSubmissions.some(
            submission => submission.status === "completed"
        );

        return (
            <QuizParticipationClient
                quiz={quizData}
                currentUser={currentUser}
                courseId={courseId}
                userSubmissions={userSubmissions}
                hasExceededAttempts={hasExceededAttempts}
                hasCompletedSubmission={hasCompletedSubmission}
            />
        );
    } catch (error) {
        console.error("Error loading quiz:", error);
        redirect(`/courses/${courseId}`);
    }
}