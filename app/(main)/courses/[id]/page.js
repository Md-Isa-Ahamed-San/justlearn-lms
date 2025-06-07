import CourseDetailsHero from "./_components/CourseDetailsHero";
import CourseDetails from "./_components/CourseDetails";
import Testimonials from "./_components/Testimonials";

import { getCourseDetails } from "../../../../queries/courses";

import React from "react";
import ScrollToTop from "./_components/ScrollToTop";

const SingleCoursePage = async ({ params }) => {
  const { id } = await params;

  const courseDetails = await getCourseDetails(id);
  console.log(" SingleCoursePage ~ courseDetails:", courseDetails)

  return (
    <div>
      <ScrollToTop/>
      <CourseDetailsHero
        categoryTitle={courseDetails?.category.title}
        title={courseDetails?.title}
        description={courseDetails?.description}
        thumbnail={courseDetails?.thumbnail}
      />
      <CourseDetails courseDetails={courseDetails} />
      <Testimonials testimonials={courseDetails?.testimonials} />
      {/* <RelatedCourse categoryId={courseDetails?.category.id} /> */}
    </div>
  );
};

export default SingleCoursePage;
