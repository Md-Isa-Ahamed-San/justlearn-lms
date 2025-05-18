import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Image from "next/image";

import { Play } from "lucide-react";

const CourseDetailsHero = ({categoryTitle, title,description,thumbnail}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b  pt-20 pb-12">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-5"></div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4">{categoryTitle}</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            <span className="block">{title}</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-xl md:mt-5">
            {description}
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
              src={`/assets/images/courses/${thumbnail}`}
              alt="Course Preview"
              className="h-full w-full"
              width={600}
              height={600}
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
  );
};

export default CourseDetailsHero;
