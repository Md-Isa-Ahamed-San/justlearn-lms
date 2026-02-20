import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBook2, IconUsers } from "@tabler/icons-react";
import { Suspense } from "react";
import { getCourseList } from "../../../../queries/courses";
import { getAllUsers } from "../../../../queries/users";
import CourseManagement from "./course-management";
import UserManagement from "./user-management/user-management";


// Add this to fix the static generation error
export const dynamic = 'force-dynamic';

// This is a Server Component that serves as the main layout
export default async function AdminDashboard() {
  let users = [];
  let allCourses = [];

  try {
    const [usersResult, coursesResult] = await Promise.allSettled([
      getAllUsers(),
      getCourseList()
    ]);

    // Handle users data
    if (usersResult.status === 'fulfilled') {
      users = Array.isArray(usersResult.value) ? usersResult.value : [];
    } else {
      console.error("Error fetching users:", usersResult.reason);
    }

    // Handle courses data
    if (coursesResult.status === 'fulfilled') {
      allCourses = Array.isArray(coursesResult.value) ? coursesResult.value : [];
    } else {
      console.error("Error fetching courses:", coursesResult.reason);
    }

    // Handle analytics data (if needed for the summary cards)
    // Note: The original code was using allCourses.length and users.length which is fine.
    // The getInstructorAnalytics was added to demonstrate where it would go.
    // We can use it if we want to show specific instructor stats.


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

            {/* Analytics Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allCourses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
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