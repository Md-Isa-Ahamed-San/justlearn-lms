import { getInstructorCourses } from "../../../queries/courses";
import { getServerUserData } from "../../../queries/users";
import { chalkLog } from "../../../utils/logger";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

// Add this to pages that use headers(), cookies(), etc.
export const dynamic = 'force-dynamic';

const CoursesPage = async () => {
  let serverUserData = null;
  let courses = [];

  try {
    serverUserData = await getServerUserData();
    const userData = serverUserData?.userData;
    console.log(" CoursesPage ~ userData:", userData);
    
    if (userData?.instructor?.id) {
      courses = await getInstructorCourses(userData.instructor.id);
      chalkLog.log(" CoursesPage ~ courses of a instructor:", courses);
    }
  } catch (error) {
    // During static generation or if user is not authenticated, this might fail
    console.log("Could not fetch data:", error.message);
    
    // You can either:
    // 1. Return empty array (current approach)
    // 2. Redirect to login
    // 3. Show error message
    courses = [];
  }

  // Ensure courses is always an array to prevent DataTable errors
  const safeCoursesData = Array.isArray(courses) ? courses : [];

  return (
    <div className="p-6">
      {safeCoursesData.length > 0 ? (
        <DataTable columns={columns} data={safeCoursesData} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No courses found.</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;