import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  BookCheck,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  MessageSquare,
  Play,
  Radio,
  Star,
  Users,
  Video,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const courses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    category: "Development",
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: 49,
    progress: 0,
  },
  {
    id: 2,
    title: "TypeScript Masterclass",
    category: "Development",
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: 59,
    progress: 30,
  },
  {
    id: 3,
    title: "Full-Stack Next.js Development",
    category: "Development",
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: 79,
    progress: 0,
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    category: "Design",
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: 49,
    progress: 0,
  },
];

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
    text: "This course completely transformed my understanding of React and Next.js. The instructor's teaching style made complex concepts easy to grasp.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?img=5",
    text: "Incredibly comprehensive and well-structured. I went from beginner to confidently building full-stack applications in just a few weeks.",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=3",
    text: "The project-based approach really helped solidify my understanding. Each module builds on the previous one in a logical way.",
    rating: 4,
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

const CourseProgress = ({ value, variant, size }) => {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progress</span>
        <span
          className={cn(
            "font-medium",
            variant === "success" ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {value}%
        </span>
      </div>
      <Progress
        value={value}
        className={cn(
          "h-1.5",
          variant === "success" ? "bg-emerald-100 [&>div]:bg-emerald-600" : ""
        )}
      />
    </div>
  );
};

export default function SingleCoursePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b  pt-20 pb-12">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-5"></div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4">Development</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">Reactive Accelerator</span>
            </h1>
            <p className="mt-3 text-lg text-gray-600 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-xl md:mt-5">
              Master React JS & Next JS through hands-on projects and real-world
              applications
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="rounded-full ">
                Enroll Now
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
                <Play className="mr-2 h-4 w-4" /> Watch Preview
              </Button>
            </div>
          </div>

          <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl shadow-2xl">
            <div className="aspect-video w-full ">
              <Image
                src="/placeholder.svg?height=720&width=1280"
                alt="Course Preview"
                className="h-full w-full object-cover"
                width={1280}
                height={720}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full  backdrop-blur-sm"
                >
                  <Play className="h-6 w-6 " />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold 0">Reactive Accelerator</h2>
                <div className="mt-2 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/3633137?v=4"
                        alt="Tapas Adhikary"
                      />
                      <AvatarFallback>TA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Tapas Adhikary</p>
                      <p className="text-xs text-muted-foreground">
                        Senior Software Engineer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-xs ">(4.9)</span>
                  </div>
                  <div className="text-sm ">Last updated: Feb 22, 2022</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full ">
                  Enroll for {formatPrice(49)}
                </Button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full  p-2 ">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">36 Lessons</p>
                    <p className="text-xs text-muted-foreground">HD Videos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full  p-2 ">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">50+ Hours</p>
                    <p className="text-xs text-muted-foreground">
                      Total Duration
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full  p-2 ">
                    <Radio className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">4 Live Classes</p>
                    <p className="text-xs text-muted-foreground">
                      Interactive Sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full  p-2 ">
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
              <TabsList className="grid w-full grid-cols-3 rounded-lg  p-1">
                <TabsTrigger
                  value="overview"
                  className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary  data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="curriculum"
                  className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary  data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  Curriculum
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="rounded-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary  data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  Instructor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">
                      Course Description
                    </h3>
                    <div className="prose max-w-none ">
                      <p>
                        This comprehensive course will help you master React and
                        Next.js quickly and thoroughly. You&apos;ll learn modern
                        development practices and build real-world applications
                        that showcase your skills to potential employers.
                      </p>
                      <p>
                        You&apos;ll be exposed to principles and strategies,
                        but, more importantly, you&apos;ll learn how to actually
                        apply these abstract concepts by coding three different
                        websites for three very different audiences. By the end
                        of this course, you&apos;ll have a portfolio of projects
                        that demonstrate your expertise.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl  p-8">
                    <h4 className="mb-6 text-2xl font-bold">
                      What You Will Learn
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        "Build modern, responsive UIs with React components",
                        "Master state management with hooks and context",
                        "Create server-rendered applications with Next.js",
                        "Implement authentication and authorization",
                        "Connect to APIs and manage data fetching",
                        "Deploy applications to production environments",
                        "Optimize performance and implement best practices",
                        "Build a complete e-commerce application from scratch",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 " />
                          <span className="text-gray-700">{item}</span>
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
                    <div className="flex flex-wrap items-center gap-6 text-sm ">
                      <div className="flex items-center gap-2">
                        <BookCheck className="h-4 w-4 " />
                        <span>12 Chapters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 " />
                        <span>50+ Hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 " />
                        <span>4 Live Classes</span>
                      </div>
                    </div>
                  </div>

                  <Accordion
                    type="multiple"
                    defaultValue={["item-1"]}
                    className="w-full"
                  >
                    {[
                      {
                        id: "item-1",
                        title: "Introduction to React",
                        lessons: [
                          { title: "What is React?", type: "video" },
                          {
                            title: "Setting up your development environment",
                            type: "video",
                          },
                          { title: "Understanding JSX", type: "video" },
                          { title: "React Basic Notes", type: "note" },
                          {
                            title: "Your first React component",
                            type: "video",
                          },
                        ],
                      },
                      {
                        id: "item-2",
                        title: "Master Next.js",
                        lessons: [
                          { title: "Introduction to Next.js", type: "video" },
                          {
                            title:
                              "Server-side rendering vs. Static generation",
                            type: "video",
                          },
                          { title: "Routing in Next.js", type: "video" },
                          { title: "Data fetching strategies", type: "video" },
                          { title: "Next.js project structure", type: "note" },
                        ],
                      },
                      {
                        id: "item-3",
                        title: "Building an E-commerce App with Next.js",
                        lessons: [
                          {
                            title: "Project overview and requirements",
                            type: "video",
                          },
                          { title: "Setting up the database", type: "video" },
                          { title: "Creating product listings", type: "video" },
                          {
                            title: "Implementing the shopping cart",
                            type: "video",
                          },
                          { title: "Processing payments", type: "video" },
                          {
                            title: "Deployment and optimization",
                            type: "video",
                          },
                        ],
                      },
                    ].map((section) => (
                      <AccordionItem
                        key={section.id}
                        value={section.id}
                        className="border-b border-gray-200 px-0"
                      >
                        <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline">
                          {section.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg  p-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Video className="h-4 w-4 " />
                              {
                                section.lessons.filter(
                                  (l) => l.type === "video"
                                ).length
                              }{" "}
                              Videos
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 " />
                              {
                                section.lessons.filter((l) => l.type === "note")
                                  .length
                              }{" "}
                              Notes
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Radio className="h-4 w-4 " />1 Live Class
                            </div>
                          </div>

                          <div className="space-y-3">
                            {section.lessons.map((lesson, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg p-3 transition-colors "
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.type === "video" ? (
                                    <Video className="h-4 w-4 " />
                                  ) : (
                                    <FileText className="h-4 w-4 " />
                                  )}
                                  <span className="text-gray-700">
                                    {lesson.title}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 "
                                >
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
                <div className="overflow-hidden rounded-xl  p-8">
                  <div className="flex flex-col gap-8 md:flex-row">
                    <div className="flex-shrink-0">
                      <Image
                        src="https://avatars.githubusercontent.com/u/3633137?v=4"
                        alt="Tapas Adhikary"
                        width={250}
                        height={250}
                        className="rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold">Tapas Adhikary</h3>
                      <p className="mb-4 text-lg ">Senior Software Engineer</p>

                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full  p-2 ">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div className="">10+ Courses</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full  p-2 ">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="">2k+ Students</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full  p-2 ">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="">1500+ Reviews</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full  p-2 ">
                            <Star className="h-5 w-5" />
                          </div>
                          <div className="">4.9 Average Rating</div>
                        </div>
                      </div>

                      <p className="text-gray-600">
                        Tapas is a passionate educator and developer with over
                        15 years of experience in the software industry. He
                        specializes in React, Next.js, and modern JavaScript
                        frameworks, having worked with companies ranging from
                        startups to Fortune 500 enterprises. His teaching
                        approach focuses on practical, project-based learning
                        that helps students build real-world skills.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              What Our Students Say
            </h2>

            <Carousel
              opts={{
                align: "start",
              }}
              className="mx-auto w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem
                    key={testimonial.id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <div className="h-full rounded-xl  p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <div className="flex ">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < testimonial.rating ? "fill-current" : ""
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="">{testimonial.text}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex justify-center gap-2">
                <CarouselPrevious className="relative inset-0 translate-y-0" />
                <CarouselNext className="relative inset-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Related Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Related Courses
            </h2>

            <Carousel
              opts={{
                align: "start",
              }}
              className="mx-auto w-full"
            >
              <CarouselContent>
                {courses.map((course) => (
                  <CarouselItem
                    key={course.id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <Link
                      href={`/courses/${course.id}`}
                      className="block h-full"
                    >
                      <div className="h-full overflow-hidden rounded-xl border border-gray-200  transition-all hover:shadow-md">
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={course.thumbnail || "/placeholder.svg"}
                            alt={course.title}
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            fill
                          />
                          <div className="absolute inset-0 bg-gradient-to-t  opacity-0 transition-opacity hover:opacity-100">
                            <div className="absolute bottom-4 left-4 right-4">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                              >
                                View Course
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <Badge className="mb-2 b  ">{course.category}</Badge>
                          <h3 className="mb-2 line-clamp-2 text-lg font-bold">
                            {course.title}
                          </h3>

                          {course.progress > 0 ? (
                            <CourseProgress value={course.progress} />
                          ) : (
                            <div className="mt-4 flex items-center justify-between">
                              <p className="font-bold ">
                                {formatPrice(course.price)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 "
                              >
                                Enroll
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex justify-center gap-2">
                <CarouselPrevious className="relative inset-0 translate-y-0" />
                <CarouselNext className="relative inset-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}
