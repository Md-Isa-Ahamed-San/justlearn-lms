import { Suspense } from "react";
import CourseManagement from "./course-management";
import UserManagement from "./user-management/user-management";
import { IconBook2, IconUsers } from "@tabler/icons-react";
import { getCourseList } from "../../../../queries/courses";
import { getAllUsers } from "../../../../queries/users";
import { chalkLog } from "../../../../utils/logger";

// Add this to fix the static generation error
export const dynamic = 'force-dynamic';

// This is a Server Component that serves as the main layout
export default async function AdminDashboard() {
  let users = [];
  let allCourses = [];

  try {
    // Fetch data with proper error handling
    const [usersData, coursesData] = await Promise.allSettled([
      getAllUsers(),
      getCourseList()
    ]);

    // Handle users data
    if (usersData) {
      users = Array.isArray(usersData) ? usersData: [];
    } else {
      console.error("Error fetching users:", usersData.reason);
    }

    // Handle courses data
    if (coursesData) {
      allCourses = Array.isArray(coursesData) ? coursesData : [];
      chalkLog.log(" AdminDashboard ~ allCourses:", allCourses);
    } else {
      console.error("Error fetching courses:", coursesData.reason);
    }

  } catch (error) {
    console.error("Error in AdminDashboard:", error);
    // Keep empty arrays as fallback
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <main className="flex-1">
          <div className="space-y-6">
            {/* Mobile Navigation Tabs */}
            <div className="lg:hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2"
                    data-tab="users"
                  >
                    <IconUsers className="h-5 w-5" />
                    <span>Users ({users.length})</span>
                  </button>
                  <button
                    className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2"
                    data-tab="courses"
                  >
                    <IconBook2 className="h-5 w-5" />
                    <span>Courses ({allCourses.length})</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Content Sections */}
            <div id="users-section">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-64">
                    Loading user data...
                  </div>
                }
              >
                <UserManagement users={users} />
              </Suspense>
            </div>

            <div id="courses-section" className="hidden">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-64">
                    Loading course data...
                  </div>
                }
              >
                <CourseManagement courses={allCourses} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}