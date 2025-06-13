import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
// import { getInstructorDashboardData, COURSE_DATA } from "@/lib/dashboard-helper";


const CoursesPage = async () => {
  const courses = []

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
