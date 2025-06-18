// ./_components/manual-quiz-editor.jsx
"use client";

import AlertBanner from "@/components/alert-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, CircleCheck, Pencil, PlusCircle, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddQuizForm } from "./add-quiz-form"; // Your existing form

// Mock API call
const deleteQuestionAPI = async (quizId, questionId) => {
  console.log("Deleting question:", quizId, questionId);
  // await axios.delete(`/api/quiz-sets/${quizId}/questions/${questionId}`);
  toast.success("Question deleted");
  return true;
}

export const ManualQuizEditor = ({ quizData, setQuizData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // For editing existing questions

  const handleAddQuestion = (newQuestion) => {
    // This function will be passed to AddQuizForm
    // It should also make an API call to save the new question
    setQuizData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), { ...newQuestion, id: `temp-${Date.now()}` }] // Add temp ID
    }));
    setShowAddForm(false); // Hide form after adding
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    // API call to update question
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    }));
    setEditingQuestion(null); // Close edit form
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestionAPI(quizData.id, questionId);
        setQuizData(prev => ({
          ...prev,
          questions: prev.questions.filter(q => q.id !== questionId)
        }));
      } catch (error) {
        toast.error("Failed to delete question.");
      }
    }
  };


  return (
    <div className="mt-6 border  rounded-md p-4">
      <div className="font-medium flex items-center justify-between mb-4">
        <h3 className="text-lg">Questions</h3>
        <Button onClick={() => { setShowAddForm(prev => !prev); setEditingQuestion(null); }} variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          {showAddForm ? "Cancel" : "Add a Question"}
        </Button>
      </div>

      {showAddForm && !editingQuestion && (
        <AddQuizForm
          quizId={quizData.id}
          onQuestionAdded={handleAddQuestion} // Pass callback
          // You might need to adjust AddQuizForm to call this on successful submission
        />
      )}
      
      {editingQuestion && (
         <AddQuizForm // Reuse form for editing
          quizId={quizData.id}
          initialData={editingQuestion} // Pass question data to prefill
          onQuestionUpdated={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}


      {(!quizData.questions || quizData.questions.length === 0) && !showAddForm && !editingQuestion && (
        <AlertBanner
          label="No questions in this set yet. Click 'Add a Question' to get started."
          variant="info"
          className="rounded mb-6"
        />
      )}

      <div className="space-y-6 mt-4">
        {(quizData.questions || []).map((question, index) => (
          <div
            key={question.id || index} // Use a proper key
            className="shadow-md p-4 lg:p-6 rounded-md border "
          >
            <h4 className="mb-1 font-semibold">{index + 1}. {question.prompt}</h4>
            {question.explanation && <p className="text-xs text-gray-600 mb-3 italic">{question.explanation}</p>}

            {question.type === "mcq" && question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((option) => (
                  <div
                    className={cn(
                      "py-1.5 rounded-sm text-sm flex items-center gap-1",
                      option.isCorrect ? "text-emerald-700" : "text-gray-600"
                    )}
                    key={option.label}
                  >
                    {option.isCorrect ? (
                      <CircleCheck className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                    <p>{option.label}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Add display for other question types (short_answer, long_answer) here */}
            {(question.type === "short_answer" || question.type === "long_answer") && (
                <p className="text-sm text-gray-700 mt-2"><strong>Correct Answer:</strong> {JSON.stringify(question.correctAnswer)}</p>
            )}


            <div className="flex items-center justify-end gap-2 mt-6">
              <Button variant="ghost" size="sm" onClick={() => { setEditingQuestion(question); setShowAddForm(false); }}>
                <Pencil className="w-3 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                className="text-destructive"
                variant="ghost"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                <Trash className="w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};