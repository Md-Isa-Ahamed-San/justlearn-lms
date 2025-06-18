// EditQuizSet.jsx
"use client";

import AlertBanner from "@/components/alert-banner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming you have a Select component
import { useEffect, useState } from "react";
import { QuizSetAction } from "./_components/quiz-set-action";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form"; // NEW: For Quiz Description
import { ManualQuizEditor } from "./_components/manual-quiz-editor";
import { AIFixedQuizGenerator } from "./_components/ai-fixed-quiz-generator";
import { AIPoolQuizGenerator } from "./_components/ai-pool-quiz-generator";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation"; // To get quizId

// Mock quiz data structure - replace with actual API call
const fetchQuizData = async (quizId) => {
  console.log("Fetching quiz data for ID:", quizId);
  // Replace with your actual API call:
  // const response = await axios.get(`/api/quiz-sets/${quizId}`);
  // return response.data;

  // Mock data for now:
  if (quizId === "1") { // Assuming the ID from AddQuizSet redirect is "1"
    return {
      id: "1",
      title: "Initial Quiz Title (from API)",
      description: "Initial Quiz Description (from API).",
      generationType: "manual", // Default or fetched from DB
      source: "manual",
      active: false,
      weekIds: [],
      poolSize: 0,
      questionsPerStudent: 5,
      aiPrompt: "",
      aiContextData: null,
      targetMcqCount: 5,
      targetShortAnswerCount: 2,
      targetLongAnswerCount: 1,
      timeLimit: 5,
      maxAttempts: 1,
      showResultsImmediately: true,
      questions: [
        {
          id: "q1",
          prompt: "What is HTML?",
          type: "mcq",
          options: [
            { label: "A programming language", isCorrect: false },
            { label: "A markup language", isCorrect: true },
            { label: "A famous book", isCorrect: false },
            { label: "A famous tv show", isCorrect: false },
          ],
          explanation: "HTML stands for HyperText Markup Language.",
          mark: 1,
          order: 0,
        },
      ],
    };
  }
  return null;
};

// Mock API call to update quiz type
const updateQuizGenerationType = async (quizId, generationType) => {
  console.log("Updating quiz generation type:", quizId, generationType);
  // Replace with your actual API call:
  // await axios.patch(`/api/quiz-sets/${quizId}`, { generationType });
  toast.success(`Quiz type updated to ${generationType}`);
  return true;
};


const EditQuizSet = () => {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizSetId; // Assuming your route is /.../[quizSetId]

  const [quizData, setQuizData] = useState(null);
  const [selectedQuizType, setSelectedQuizType] = useState("manual"); // Default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      const loadQuiz = async () => {
        setIsLoading(true);
        try {
          const data = await fetchQuizData(quizId);
          if (data) {
            setQuizData(data);
            setSelectedQuizType(data.generationType || "manual");
          } else {
            toast.error("Quiz not found.");
            router.push("/instructor-dashboard/quiz-sets"); // Redirect if not found
          }
        } catch (error) {
          toast.error("Failed to load quiz data.");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      loadQuiz();
    }
  }, [quizId, router]);

  const handleQuizTypeChange = async (newType) => {
    if (!quizData) return;
    try {
      await updateQuizGenerationType(quizData.id, newType);
      setSelectedQuizType(newType);
      setQuizData(prev => ({ ...prev, generationType: newType }));
      // Potentially clear questions or AI specific fields if type changes drastically
      // e.g., if changing from AI-Pool to Manual, what happens to poolSize?
    } catch (error) {
      toast.error("Failed to update quiz type.");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading quiz details...</div>;
  }

  if (!quizData) {
    return <div className="p-6">Quiz not found or failed to load.</div>;
  }

  const requiredFields = [
    quizData.title,
    quizData.description,
    // Add other core fields that determine if a quiz can be published
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = completedFields === totalFields;


  return (
    <>
      {!quizData.active && ( // Assuming 'active' means published
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
              Complete all fields {completionText}
            </span>
          </div>
          <div className="flex items-center gap-x-4">
            {/* Quiz Type Selector */}
            <div>
              <Select
                value={selectedQuizType}
                onValueChange={handleQuizTypeChange}
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
              disabled={!isComplete}
              quizId={quizData.id}
              isPublished={quizData.active}
            />
          </div>
        </div>

        {/* Core Quiz Info Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div>
            <TitleForm
              initialData={{ title: quizData.title }}
              quizId={quizData.id}
              onUpdate={(newTitle) => setQuizData(prev => ({ ...prev, title: newTitle }))}
            />
            <DescriptionForm // You'll need to create this similar to TitleForm
              initialData={{ description: quizData.description }}
              quizId={quizData.id}
              onUpdate={(newDesc) => setQuizData(prev => ({ ...prev, description: newDesc }))}
            />
          </div>
          <div>
            {/* Placeholder for other general quiz settings if any */}
            {/* e.g., Time Limit, Max Attempts - these could be separate components */}
          </div>
        </div>

        {/* Conditional Rendering based on Quiz Type */}
        <div className="mt-10">
          {selectedQuizType === "manual" && (
            <ManualQuizEditor
              quizData={quizData}
              setQuizData={setQuizData} // To update questions list
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