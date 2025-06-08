import FilterCourse from "./_components/FilterCourse";
import FilterCourseMobile from "./_components/FilterCourseMobile";
import SearchCourse from "./_components/SearchCourse";
import SortCourse from "./_components/SortCourse";

import { getCourseList } from "@/queries/courses";
import { getCategories } from "../../../queries/categories";
import CourseCard from "./_components/CourseCard";

const CoursesPage = async ({ searchParams }) => {
  // Get search parameters
  const { categories: selectedCategories } = await searchParams;

  // Parse selected categories from URL
  const categoryFilters = selectedCategories
    ? Array.isArray(selectedCategories)
      ? selectedCategories
      : [selectedCategories]
    : [];

  // Fetch all courses and categories
  const [courses, categories] = await Promise.all([
    getCourseList(),
    getCategories(),
  ]);

  // Filter courses based on selected categories
  const filteredCourses =
    categoryFilters.length > 0
      ? courses.filter((course) =>
          categoryFilters.includes(course?.category?.title)
        )
      : courses;

  console.log("Selected categories:", categoryFilters);
  console.log("Filtered courses count:", filteredCourses.length);

  return (
    <section
      id="courses"
      className="container space-y-6 dark:bg-transparent py-6"
    >
      {/* header */}
      <div className="flex items-baseline justify-between border-gray-200 border-b pb-6 flex-col gap-4 lg:flex-row"></div>

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
          <div>
            <div className="flex gap-4 justify-start items-center">
              <SearchCourse />
              <FilterCourseMobile
                categories={categories}
                selectedCategories={categoryFilters}
              />
            </div>
            <FilterCourse
              categories={categories}
              selectedCategories={categoryFilters}
            />
          </div>

          {/* Course grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  No courses found for the selected categories.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default CoursesPage;
