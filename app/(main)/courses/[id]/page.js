import CourseDetailsHero from "./_components/CourseDetailsHero";
import CourseDetails from "./_components/CourseDetails";
import Testimonials from "./_components/Testimonials";



import React from "react";
import ScrollToTop from "./_components/ScrollToTop";
import { getCourseDetailsById } from "../../../../queries/courses";
import { getServerUserData } from "../../../../queries/users";
import { checkUserParticipation } from "../../../../queries/participation";

const SingleCoursePage = async ({ params }) => {
  const { id } = await params;
  const {userData} = await getServerUserData()

  const courseDetails = await getCourseDetailsById(id);
  const {isJoined,participationId} = await checkUserParticipation(userData.id,id)

  console.log(" SingleCoursePage ~ courseDetails:", courseDetails)

  return (
    <div>
      <ScrollToTop/>
      <CourseDetailsHero
        categoryTitle={courseDetails?.category.title}
        title={courseDetails?.title}
        description={courseDetails?.description}
        thumbnail={courseDetails?.thumbnail}
        isJoined={isJoined}
        userId ={userData?.id}
        courseId={id}

      />
      <CourseDetails courseDetails={courseDetails} />
      <Testimonials testimonials={courseDetails?.testimonials} />
      {/* <RelatedCourse categoryId={courseDetails?.category.id} /> */}
    </div>
  );
};

export default SingleCoursePage;
