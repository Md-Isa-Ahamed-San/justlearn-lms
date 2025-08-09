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
import { getQuizSubmissionDetails } from "../../../actions/quiz";
import { chalkLog } from "../../../../utils/logger";


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
//   const testQuizSubmissionData = await getQuizSubmissionDetails({userId:"6842e2f52433a7219fcb76e1",courseId:"686bd330132d72f488155d02", quizId:"686be8d4981bb26d863af82a"});
    // chalkLog.log("testQuizSubmissionData: ", testQuizSubmissionData);
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