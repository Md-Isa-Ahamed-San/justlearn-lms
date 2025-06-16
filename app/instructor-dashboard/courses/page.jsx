
import { getInstructorCourses } from "../../../queries/courses";
import { getServerUserData } from "../../../queries/users";
import { chalkLog } from "../../../utils/logger";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
// import { getInstructorDashboardData, COURSE_DATA } from "@/lib/dashboard-helper";
// Add this to pages that use headers(), cookies(), etc.
export const dynamic = 'force-dynamic'
const CoursesPage = async () => {
  let serverUserData = null;

  try {
    serverUserData = await getServerUserData();
  } catch (error) {
    // During static generation, this might fail
    console.log(
      "Could not fetch server user data during build:",
      error.message
    );
    serverUserData = null;
  }

  const userData = serverUserData?.userData;
  console.log(" CoursesPage ~ userData:", userData)
  let courses = [];
  if(userData){
    courses = await getInstructorCourses(userData?.instructor?.id);
  }
  chalkLog.log(" CoursesPage ~ courses of a instructor:", courses);

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
