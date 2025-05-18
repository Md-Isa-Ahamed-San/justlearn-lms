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








export default function SingleCoursePage() {
  return (
    <div>
      <CourseDetailsHero />

      <CourseDetails />

      <Testimonials />

      <RelatedCourse />
    </div>
  );
}
