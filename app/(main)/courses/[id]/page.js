import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CourseDetailsHero from "./_components/CourseDetailsHero";
import CourseDetails from "./_components/CourseDetails";
import Testimonials from "./_components/Testimonials";
import RelatedCourse from "./_components/RelatedCourse";
import { getCourseDetails } from "../../../../queries/courses";

import React from 'react';

const SingleCoursePage = async ({ params }) => {
  const {id} = await params;

  const courseDetails = await getCourseDetails(id);

  // console.log(" SingleCoursePage ~ courseDetails:", courseDetails);

  return (
    <div>
      <CourseDetailsHero categoryTitle={courseDetails?.category.title} title={courseDetails?.title}description={courseDetails?.description}thumbnail ={courseDetails?.thumbnail} />
      <CourseDetails courseDetails={courseDetails} />
      <Testimonials testimonials={courseDetails?.testimonials} />
      {/* <RelatedCourse categoryId={courseDetails?.category.id} /> */}
    </div>
  );
};

export default SingleCoursePage;
