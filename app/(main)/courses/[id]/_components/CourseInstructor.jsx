import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { GraduationCap, MessageSquare, Star, Users } from "lucide-react";
const CourseInstructor = ({ courseDetails }) => {
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
                <div>Multiple Courses</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>Many Students</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>Active Support</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>High Ratings</div>
              </div>
            </div>

            <p className="text-gray-600">{courseDetails?.instructor?.bio}</p>

            {courseDetails?.instructor?.socialMedia && (
              <div className="mt-6 flex gap-4">
                {courseDetails.instructor.socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${courseDetails.instructor.socialMedia.twitter}`}
                    className="text-blue-500 hover:text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                )}
                {courseDetails.instructor.socialMedia.linkedin && (
                  <a
                    href={courseDetails.instructor.socialMedia.linkedin}
                    className="text-blue-700 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
                {courseDetails.instructor.socialMedia.facebook && (
                  <a
                    href={courseDetails.instructor.socialMedia.facebook}
                    className="text-blue-600 hover:text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
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
