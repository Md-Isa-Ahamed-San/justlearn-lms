import { getInstructorCourses } from "../../../queries/courses";
import { getServerUserData } from "../../../queries/users";
import { chalkLog } from "../../../utils/logger";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
// import { getInstructorDashboardData, COURSE_DATA } from "@/lib/dashboard-helper";


const CoursesPage = async () => {
  const {userData} = await getServerUserData()
  const courses = await getInstructorCourses(userData?.instructor?.id);
  chalkLog.log(" CoursesPage ~ courses of a instructor:", courses)

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
