import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  MessageSquare,
  Star,
  Users,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { getInstructorDetailedStats } from "@/queries/courses";

const CourseInstructor = async ({ courseDetails }) => {
  const { courseCount, totalStudents, averageRating, testimonialCount } =
    await getInstructorDetailedStats(courseDetails?.instructor?.id);

  return (
    <TabsContent value="instructor" className="mt-6">
      <div className="overflow-hidden rounded-xl bg-muted/30 p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-shrink-0">
            <Image
              src={
                courseDetails?.instructor?.profilePicture ||
                "/placeholder.svg?height=250&width=250"
              }
              alt={`${courseDetails?.instructor?.firstName} ${courseDetails?.instructor?.lastName}`}
              width={250}
              height={250}
              className="rounded-xl object-cover"
              quality={50}
            />
          </div>

          <div className="flex-1">
            <h3 className="text-3xl font-bold">
              {courseDetails?.instructor?.firstName}{" "}
              {courseDetails?.instructor?.lastName}
            </h3>
            <p className="mb-4 text-lg">
              {courseDetails?.instructor?.designation}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>{courseCount} Courses</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>{totalStudents} Students</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>{testimonialCount} Reviews</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>{averageRating} Star</div>
              </div>
            </div>

            <p className="text-gray-600">{courseDetails?.instructor?.bio}</p>

            {courseDetails?.instructor?.socialMedia && (
              <div className="mt-6 flex gap-4">
                {courseDetails.instructor.socialMedia.twitter && (
                  <Link
                    href={`https://twitter.com/${courseDetails.instructor.socialMedia.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=""
                  >
                    <Twitter className="h-5 w-5 text-primary hover:text-destructive " />
                  </Link>
                )}
                {courseDetails.instructor.socialMedia.linkedin && (
                  <Link
                    href={courseDetails.instructor.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=""
                  >
                    <Linkedin className="h-5 w-5  text-primary hover:text-destructive" />
                  </Link>
                )}
                {courseDetails.instructor.socialMedia.facebook && (
                  <Link
                    href={courseDetails.instructor.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=""
                  >
                    <Facebook className="h-5 w-5  text-primary hover:text-destructive" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default CourseInstructor;
