import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";

import { ArrowRight } from "lucide-react";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SearchCourse from "./_components/SearchCourse";
import SortCourse from "./_components/SortCourse";
import FilterCourseMobile from "./_components/FilterCourseMobile";
import ActiveFilters from "./_components/ActiveFilters";
import FilterCourse from "./_components/FilterCourse";

import { getCourseList } from "@/queries/courses";
import CourseCard from "./_components/CourseCard";
import { getCategories } from "../../../queries/categories";

const CoursesPage = async ({ searchParams }) => {
  // Get search parameters
  const { categories: selectedCategories } = await searchParams;
  
  // Parse selected categories from URL
  const categoryFilters = selectedCategories 
    ? (Array.isArray(selectedCategories) ? selectedCategories : [selectedCategories])
    : [];

  // Fetch all courses and categories
  const [courses, categories] = await Promise.all([
    getCourseList(),
    getCategories()
  ]);

  // Filter courses based on selected categories
  const filteredCourses = categoryFilters.length > 0 
    ? courses.filter(course => 
        categoryFilters.includes(course.category.title)
      )
    : courses;

  console.log("Selected categories:", categoryFilters);
  console.log("Filtered courses count:", filteredCourses.length);

  return (
    <section id="courses" className="container space-y-6 dark:bg-transparent py-6">
      {/* header */}
      <div className="flex items-baseline justify-between border-gray-200 border-b pb-6 flex-col gap-4 lg:flex-row">
        <SearchCourse />
        <div className="flex items-center justify-end gap-2 max-lg:w-full">
          <SortCourse />
          <FilterCourseMobile />
        </div>
      </div>

      {/* active filters */}
      {/* <ActiveFilters
        filter={{
          categories: categoryFilters,
          price: [],
          sort: "",
        }}
      /> */}

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <FilterCourse 
            categories={categories} 
            selectedCategories={categoryFilters}
          />

          {/* Course grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No courses found for the selected categories.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default CoursesPage;