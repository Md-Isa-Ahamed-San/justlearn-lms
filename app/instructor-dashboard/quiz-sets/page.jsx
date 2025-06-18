import { getAllQuizzesByInstructorId } from "../../../queries/quizzes";
import { getServerUserData } from "../../../queries/users";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const quizSets = [
  {
    id: 1,
    title: "Reactive Accelerator",
    isPublished: true,
    totalQuiz: 10,
    quizes: [],
  },
  {
    id: 2,
    title: "Think In A Redux Way",
    isPublished: false,
    totalQuiz: 50,
    quizes: [],
  },
];
const QuizSets = async () => {
  let data = null;
  let allQuizzes = null;
  try{
    data = await getServerUserData();
  }
  catch(err){
    console.log(err)
  }
  if(data?.userData?.id){
   allQuizzes = await getAllQuizzesByInstructorId(data?.userData?.id);
  }
  console.log(" QuizSets ~ allQuizzes:", allQuizzes)

  // console.log(" QuizSets ~ userData:", userData)
  
  return (
    <div className="p-6">
      <DataTable columns={columns} data={allQuizzes} />
    </div>
  );
};

export default QuizSets;
