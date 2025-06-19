// app/instructor-dashboard/quiz-sets/[quizSetId]/page.jsx

import { getQuizSetById } from "../../../../queries/quizzes"; // Adjust path as needed

// Add this for dynamic routes that use headers/cookies
export const dynamic = 'force-dynamic';

// This is a Server Component
const QuizSetPage = async ({ params }) => {
  // ✅ FIX: Await params before accessing properties
  const { quizSetId } = await params;

  if (!quizSetId) {
    console.error("QuizSet ID is missing from params.");
    return (
      <div className="p-6">
        <div className="text-red-500">Error: Quiz Set ID is missing</div>
      </div>
    );
  }

  let initialQuizData = null;
  
  try {
    initialQuizData = await getQuizSetById(quizSetId);
    console.log("QuizSetPage ~ initialQuizData:", initialQuizData);
  } catch (error) {
    console.error("Error fetching quiz set:", error);
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading quiz set</div>
      </div>
    );
  }

  if (!initialQuizData) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Quiz set not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{initialQuizData.title}</h1>
      <p className="text-gray-600 mb-6">{initialQuizData.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Status</h3>
          <p className="capitalize">{initialQuizData.status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Questions</h3>
          <p>{initialQuizData.questions?.length || 0} questions</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Time Limit</h3>
          <p>{initialQuizData.timeLimit} minutes</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Max Attempts</h3>
          <p>{initialQuizData.maxAttempts}</p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Created By</h3>
        <div className="flex items-center gap-2">
          {initialQuizData.createdBy?.image && (
            <img 
              src={initialQuizData.createdBy.image} 
              alt={initialQuizData.createdBy.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{initialQuizData.createdBy?.name}</p>
            <p className="text-sm text-gray-600">{initialQuizData.createdBy?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSetPage;