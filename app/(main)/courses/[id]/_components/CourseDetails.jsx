import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

import {
  BookCheck,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  MessageSquare,
  Radio,
  Star,
  Users,
  Video,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import CourseInstructor from "./CourseInstructor";
import CourseCurriculum from "./CourseCurriculum";
import CourseOverview from "./CourseOverview";

const CourseDetails = ({ courseDetails }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100); // Assuming price is in cents
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get instructor initials for avatar fallback
  const getInstructorInitials = () => {
    if (!courseDetails?.instructor) return "IN";
    return `${courseDetails.instructor.firstName.charAt(
      0
    )}${courseDetails.instructor.lastName.charAt(0)}`;
  };

  // Calculate total lessons from modules
  const getTotalLessons = () => {
    if (!courseDetails?.modules) return 0;
    return courseDetails.modules.reduce((total, module) => {
      return total + (module.lessonIds?.length || 0);
    }, 0);
  };

  // Calculate total duration in hours
  const getTotalDuration = () => {
    if (!courseDetails?.modules) return 0;
    const totalMinutes = courseDetails.modules.reduce((total, module) => {
      return total + (module.duration || 0);
    }, 0);

    // Convert minutes to hours
    return Math.ceil(totalMinutes / 60);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">{courseDetails?.title}</h2>
              <div className="mt-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        courseDetails?.instructor?.profilePicture ||
                        "/placeholder.svg"
                      }
                      alt={`${courseDetails?.instructor?.firstName} ${courseDetails?.instructor?.lastName}`}
                    />
                    <AvatarFallback>{getInstructorInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {courseDetails?.instructor?.firstName}{" "}
                      {courseDetails?.instructor?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {courseDetails?.instructor?.designation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (courseDetails?.testimonials?.[0]?.rating || 5)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    ))}
                  <span className="ml-1 text-xs">
                    ({courseDetails?.testimonials?.[0]?.rating || 5})
                  </span>
                </div>
                <div className="text-sm">
                  Last updated: {formatDate(courseDetails?.modifiedOn)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="rounded-full">
                Enroll for {formatPrice(courseDetails?.price || 0)}
              </Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full p-2">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {getTotalLessons()} Lessons
                  </p>
                  <p className="text-xs text-muted-foreground">HD Videos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full p-2">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {getTotalDuration()}+ Hours
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Duration
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full p-2">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Live Support</p>
                  <p className="text-xs text-muted-foreground">
                    Interactive Sessions
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full p-2">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Lifetime Access</p>
                  <p className="text-xs text-muted-foreground">
                    Learn at your pace
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-lg p-1">
              <TabsTrigger
                value="overview"
                className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="instructor"
                className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                Instructor
              </TabsTrigger>
            </TabsList>

            <CourseOverview courseDetails={courseDetails}/>
            <CourseCurriculum courseDetails={courseDetails} getTotalDuration ={getTotalDuration } getTotalLessons={getTotalLessons}/>

            <CourseInstructor courseDetails={courseDetails}/>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CourseDetails;
