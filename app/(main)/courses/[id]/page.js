// Remove CourseDetailsWithProgress component entirely
// Update SingleCoursePage.js

import CourseDetailsHero from "./_components/CourseDetailsHero";
import Testimonials from "./_components/Testimonials";
import CourseDetails from "./_components/CourseDetails";
import React from "react";
import ScrollToTop from "./_components/ScrollToTop";
import { getCourseDetailsById } from "../../../../queries/courses";
import { getServerUserData } from "../../../../queries/users";
import { checkUserParticipation } from "../../../../queries/participation";
import { getCompletedLessonsByCourse } from "@/queries/lesson";
import {toggleLessonProgress} from "@/app/actions/lesson";
import { getCompletedQuizIdsByCourse } from "../../../../queries/quizzes";


const SingleCoursePage = async ({ params }) => {
    const { id } = await params;
    const { userData } = await getServerUserData();

    const courseDetails = await getCourseDetailsById(id);
    const { isJoined, participationId } = await checkUserParticipation(userData.id, id);
    const completedLessons = userData?.id && courseDetails?.id
        ? await getCompletedLessonsByCourse(userData.id, courseDetails.id)
        : [];
    const completedQuizzes = userData?.id && courseDetails?.id
        ? await getCompletedQuizIdsByCourse(userData.id, courseDetails.id)
        : []; 

    return (
        <div>
            <ScrollToTop />
            <CourseDetailsHero
                categoryTitle={courseDetails?.category.title}
                title={courseDetails?.title}
                description={courseDetails?.description}
                thumbnail={courseDetails?.thumbnail}
                isJoined={isJoined}
                userId={userData?.id}
                courseId={id}
            />

            <CourseDetails
                courseDetails={courseDetails}
                currentUser={userData}
                completedLessons={completedLessons}
                completedQuizzes={completedQuizzes}

            />

            <Testimonials testimonials={courseDetails?.testimonials} />
        </div>
    );
};

export default SingleCoursePage;