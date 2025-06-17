import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Image from "next/image";

import { Play } from "lucide-react";
import ClassJoin from "./ClassJoin";

const CourseDetailsHero = ({
  categoryTitle,
  title,
  description,
  thumbnail,
  isJoined,
  userId,
  courseId
}) => {


  return (
    <section className="relative overflow-hidden bg-gradient-to-b pt-20">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-5"></div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4">{categoryTitle}</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            <span className="block">{title}</span>
          </h1>
          <p className="mt-3 text-lg  sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-xl md:mt-5">
            {description}
          </p>
          <ClassJoin isJoined={isJoined} userId={userId} courseId={courseId}/>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailsHero;
