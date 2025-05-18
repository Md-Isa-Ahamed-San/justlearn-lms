import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
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
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const CourseDetails = ({ courseDetails }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100) // Assuming price is in cents
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get instructor initials for avatar fallback
  const getInstructorInitials = () => {
    if (!courseDetails?.instructor) return "IN"
    return `${courseDetails.instructor.firstName.charAt(0)}${courseDetails.instructor.lastName.charAt(0)}`
  }

  // Calculate total lessons from modules
  const getTotalLessons = () => {
    if (!courseDetails?.modules) return 0
    return courseDetails.modules.reduce((total, module) => {
      return total + (module.lessonIds?.length || 0)
    }, 0)
  }

  // Calculate total duration in hours
  const getTotalDuration = () => {
    if (!courseDetails?.modules) return 0
    const totalMinutes = courseDetails.modules.reduce((total, module) => {
      return total + (module.duration || 0)
    }, 0)

    // Convert minutes to hours
    return Math.ceil(totalMinutes / 60)
  }

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
                      src={courseDetails?.instructor?.profilePicture || "/placeholder.svg"}
                      alt={`${courseDetails?.instructor?.firstName} ${courseDetails?.instructor?.lastName}`}
                    />
                    <AvatarFallback>{getInstructorInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {courseDetails?.instructor?.firstName} {courseDetails?.instructor?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{courseDetails?.instructor?.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < (courseDetails?.testimonials?.[0]?.rating || 5) ? "fill-current" : ""}`}
                      />
                    ))}
                  <span className="ml-1 text-xs">({courseDetails?.testimonials?.[0]?.rating || 5})</span>
                </div>
                <div className="text-sm">Last updated: {formatDate(courseDetails?.modifiedOn)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="rounded-full">Enroll for {formatPrice(courseDetails?.price || 0)}</Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full p-2">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{getTotalLessons()} Lessons</p>
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
                  <p className="text-sm font-medium">{getTotalDuration()}+ Hours</p>
                  <p className="text-xs text-muted-foreground">Total Duration</p>
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
                  <p className="text-xs text-muted-foreground">Interactive Sessions</p>
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
                  <p className="text-xs text-muted-foreground">Learn at your pace</p>
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

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-2xl font-bold">Course Description</h3>
                  <div className="max-w-none">
                    <p>{courseDetails?.description}</p>
                    <p className="mt-4">{courseDetails?.subtitle}</p>
                  </div>
                </div>

                <div className="rounded-xl p-8 bg-muted/30">
                  <h4 className="mb-6 text-2xl font-bold">What You Will Learn</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {courseDetails?.learning?.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold">Course Curriculum</h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BookCheck className="h-4 w-4" />
                      <span>{courseDetails?.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{getTotalDuration()}+ Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>{getTotalLessons()} Lessons</span>
                    </div>
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={courseDetails?.modules?.map((m) => m.id) || []}
                  className="w-full"
                >
                  {courseDetails?.modules?.map((module) => (
                    <AccordionItem key={module.id} value={module.id} className="border-b border-gray-200 px-0">
                      <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 p-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Video className="h-4 w-4" />
                            {module.lessonIds?.length || 0} Lessons
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {Math.ceil(module.duration / 60)} Hours
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {module.description}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Placeholder for lessons since we don't have actual lesson data */}
                          {Array(module.lessonIds?.length || 0)
                            .fill(0)
                            .map((_, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <Video className="h-4 w-4" />
                                  <span className="text-gray-700">
                                    Lesson {idx + 1}: {module.title} - Part {idx + 1}
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                  Preview
                                </Button>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <div className="overflow-hidden rounded-xl bg-muted/30 p-8">
                <div className="flex flex-col gap-8 md:flex-row">
                  <div className="flex-shrink-0">
                    <Image
                      src={courseDetails?.instructor?.profilePicture || "/placeholder.svg?height=250&width=250"}
                      alt={`${courseDetails?.instructor?.firstName} ${courseDetails?.instructor?.lastName}`}
                      width={250}
                      height={250}
                      className="rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold">
                      {courseDetails?.instructor?.firstName} {courseDetails?.instructor?.lastName}
                    </h3>
                    <p className="mb-4 text-lg">{courseDetails?.instructor?.designation}</p>

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
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export default CourseDetails
