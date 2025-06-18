
"use client";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { QuizSetAction } from "./quiz-set-action"; // Corrected import path
import { TitleForm } from "./title-form"; // Corrected import path
import { DescriptionForm } from "./description-form"; // Corrected import path
import { ManualQuizEditor } from "./manual-quiz-editor"; // Corrected import path
import { AIFixedQuizGenerator } from "./ai-fixed-quiz-generator"; // Corrected import path
import { AIPoolQuizGenerator } from "./ai-pool-quiz-generator"; // Corrected import path
import { toast } from "sonner";
// useRouter is still needed for potential client-side navigation, but not for fetching ID
// useParams is no longer needed as quizId comes from initialQuizData
import { useRouter } from "next/navigation";
import AlertBanner from "@/components/alert-banner"

// API call to update quiz (general properties like type, title, description)
const updateQuizAPI = async (quizId, dataToUpdate) => {
  console.log(`Updating quiz ${quizId} with:`, dataToUpdate);
  // Replace with your actual API call, e.g., using fetch or axios
  // const response = await fetch(`/api/quiz/${quizId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dataToUpdate),
  // });
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.message || "Failed to update quiz");
  // }
  // return response.json();
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  toast.success("Quiz updated successfully!");
  return { ...dataToUpdate }; // Simulate returning updated part
};


const EditQuizSet = ({ initialQuizData }) => { // Receive initialQuizData as a prop
 

  // Initialize state from props
  const [quizData, setQuizData] = useState(initialQuizData);
  const [selectedQuizType, setSelectedQuizType] = useState(initialQuizData?.generationType || "manual");
  // isLoading is true initially if no data, or false if data is present (or null indicating not found)
  const [isLoading, setIsLoading] = useState(!initialQuizData && initialQuizData !== null);


  // Effect to update state if initialQuizData prop changes (e.g., due to re-fetch on server)
  // This might not be strictly necessary if the page fully reloads on navigation,
  // but good practice if the component could re-render with new props without a full reload.
  useEffect(() => {
    setQuizData(initialQuizData);
    setSelectedQuizType(initialQuizData?.generationType || "manual");
    setIsLoading(!initialQuizData && initialQuizData !== null); // Set loading based on prop
  }, [initialQuizData]);


  const handleQuizTypeChange = async (newType) => {
    if (!quizData) return;
    try {
      // Optimistic UI update
      setSelectedQuizType(newType);
      setQuizData(prev => ({ ...prev, generationType: newType }));

      await updateQuizAPI(quizData.id, { generationType: newType });
      // No need to call setQuizData again if API confirms, already updated optimistically
      // Or, if API returns the full updated object:
      // const updatedQuiz = await updateQuizAPI(quizData.id, { generationType: newType });
      // setQuizData(updatedQuiz);
    } catch (error) {
      toast.error(`Failed to update quiz type: ${error.message}`);
      // Revert optimistic update if API call fails
      setSelectedQuizType(quizData.generationType); // Revert to original
      setQuizData(prev => ({ ...prev, generationType: prev.generationType })); // Revert
    }
  };

  // Handler for TitleForm and DescriptionForm updates
  const handleQuizDetailUpdate = async (field, value) => {
    if (!quizData) return;
    const originalValue = quizData[field];
    try {
      setQuizData(prev => ({ ...prev, [field]: value }));
    //   await updateQuizAPI(quizData.id, { [field]: value });
    } catch (error) {
      toast.error(`Failed to update ${field}: ${error.message}`);
      setQuizData(prev => ({ ...prev, [field]: originalValue })); // Revert
    }
  };


  if (isLoading) { // This will primarily be true if initialQuizData was undefined initially
    return <div className="p-6 text-center">Loading quiz details...</div>;
  }

  if (!quizData) { // Handles both null (not found) and undefined (initial state before effect if prop was undefined)
    return <div className="p-6 text-center">Quiz not found or failed to load.</div>;
  }

  // Determine if the quiz can be published
  const requiredFieldsForPublish = [
    quizData.title,
    quizData.description,
    // Add other conditions, e.g., quizData.questions && quizData.questions.length > 0 for manual/ai_fixed
  ];
  if (quizData.generationType === 'manual' || quizData.generationType === 'ai_fixed') {
    requiredFieldsForPublish.push(quizData.questions && quizData.questions.length > 0);
  } else if (quizData.generationType === 'ai_pool') {
    requiredFieldsForPublish.push(quizData.poolSize && quizData.poolSize > 0);
    requiredFieldsForPublish.push(quizData.questionsPerStudent && quizData.questionsPerStudent > 0);
    requiredFieldsForPublish.push(quizData.poolSize >= quizData.questionsPerStudent);
  }

  const totalFields = requiredFieldsForPublish.length;
  const completedFields = requiredFieldsForPublish.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isReadyToPublish = completedFields === totalFields;

  return (
    <>
      {!quizData.active && (
        <AlertBanner
          label="This quiz set is unpublished. It will not be visible to students."
          variant="warning"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Quiz Set Setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields to publish {completionText}
            </span>
          </div>
          <div className="flex items-center gap-x-4">
            <div>
              <Select
                value={selectedQuizType}
                onValueChange={handleQuizTypeChange}

                disabled={!quizData || initialQuizData?.generationType} // Disable if no quiz data or already have the type
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select Quiz Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Instructor Quiz</SelectItem>
                  <SelectItem value="ai_fixed">AI-Generated (Fixed)</SelectItem>
                  <SelectItem value="ai_pool">AI-Generated (Pool-Based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <QuizSetAction
              disabled={!isReadyToPublish}
              quizId={quizData.id}
              isPublished={quizData.active}
              // You'll need to pass a function to QuizSetAction to update quizData.active on publish/unpublish
              onPublishToggle={async (newPublishState) => {
                  try {
                      await updateQuizAPI(quizData.id, { active: newPublishState });
                      setQuizData(prev => ({...prev, active: newPublishState}));
                      toast.success(`Quiz ${newPublishState ? 'published' : 'unpublished'}!`);
                  } catch (error) {
                      toast.error(`Failed to ${newPublishState ? 'publish' : 'unpublish'} quiz.`);
                  }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div>
            <TitleForm
              initialData={{ title: quizData.title }}
              quizId={quizData.id}
              onUpdate={(newTitle) => handleQuizDetailUpdate('title', newTitle)}
            />
            <DescriptionForm
              initialData={{ description: quizData.description }}
              quizId={quizData.id}
              onUpdate={(newDesc) => handleQuizDetailUpdate('description', newDesc)}
            />
          </div>
          <div>
            {/* TODO: Add components for other quiz settings like:
                - Time Limit
                - Max Attempts
                - Show Results Immediately
                - etc.
                Each should have its own form and call updateQuizAPI.
            */}
          </div>
        </div>

        <div className="mt-10">
          {selectedQuizType === "manual" && (
            <ManualQuizEditor
              quizData={quizData}
              setQuizData={setQuizData}
            />
          )}
          {selectedQuizType === "ai_fixed" && (
            <AIFixedQuizGenerator
              quizData={quizData}
              setQuizData={setQuizData}
            />
          )}
          {selectedQuizType === "ai_pool" && (
            <AIPoolQuizGenerator
              quizData={quizData}
              setQuizData={setQuizData}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EditQuizSet;