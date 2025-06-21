"use client";

import AlertBanner from "@/components/alert-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, CircleCheck, Pencil, PlusCircle, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddQuizForm } from "./add-quiz-form";

// Mock API call
const deleteQuestionAPI = async (quizId, questionId) => {
  console.log("Deleting question:", quizId, questionId);
  // await axios.delete(`/api/quiz-sets/${quizId}/questions/${questionId}`);
  toast.success("Question deleted");
  return true;
};

export const ManualQuizEditor = ({ quizData, setQuizData }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleAddQuestion = async (newQuestion) => {
    console.log(" handleAddQuestion ~ newQuestion:", newQuestion,quizData);
    
    const currentQuestions = quizData?.questions || [];
    const newOrder = currentQuestions.length;
  
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quizData?.id,
          text: newQuestion.text,
          type: newQuestion.type,
          mark: newQuestion.mark,
          explanation: newQuestion.explanation,
          options: newQuestion.options,
          correctAnswer: newQuestion.correctAnswer,
          order: newOrder,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.success) {
        setQuizData((prev) => ({
          ...prev,
          questions: [
            ...currentQuestions,
            {
              ...newQuestion,
              id: data.question.id,
              order: newOrder,
            },
          ],
        }));
        
        setShowAddForm(false);
        toast.success("Question added successfully");
      } else {
        throw new Error(data.error || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(error.message || "Failed to add question. Please try again.");
    }
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    // Update existing question
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    }));
    setEditingQuestion(null);
    toast.success("Question updated successfully");
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestionAPI(quizData.id, questionId);
        setQuizData((prev) => ({
          ...prev,
          questions: prev.questions
            .filter((q) => q.id !== questionId)
            .map((q, index) => ({ ...q, order: index })), // Reorder remaining questions
        }));
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete question.");
      }
    }
  };

  const handleToggleAddForm = () => {
    setShowAddForm((prev) => !prev);
    if (editingQuestion) {
      setEditingQuestion(null);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    if (showAddForm) {
      setShowAddForm(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  // Ensure quizData and questions array exist
  const questions = quizData?.questions || [];
  const hasQuestions = questions.length > 0;

  return (
    <div className="mt-6 border rounded-md p-4">
      <div className="font-medium flex items-center justify-between mb-4">
        <h3 className="text-lg">Questions</h3>
        <Button onClick={handleToggleAddForm} variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          {showAddForm ? "Cancel" : "Add a Question"}
        </Button>
      </div>

      {/* Add Question Form */}
      {showAddForm && !editingQuestion && (
        <div className="mb-6">
          <AddQuizForm
            quizId={quizData?.id}
            onQuestionAdded={handleAddQuestion}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {/* Edit Question Form */}
      {editingQuestion && (
        <div className="mb-6">
          <AddQuizForm
            quizId={quizData?.id}
            initialData={editingQuestion}
            onQuestionUpdated={handleUpdateQuestion}
            onCancel={handleCancelEdit}
            isEditing={true}
          />
        </div>
      )}

      {/* No Questions Alert */}
      {!hasQuestions && !showAddForm && !editingQuestion && (
        <AlertBanner
          label="No questions in this set yet. Click 'Add a Question' to get started."
          variant="warning"
          className="rounded mb-6 bg-primary-foreground"
        />
      )}

      {/* Questions List */}
      {hasQuestions && (
        <div className="space-y-6 mt-4">
          {questions
            .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
            .map((question, index) => (
              <div
                key={question.id || `question-${index}`}
                className="shadow-md p-4 lg:p-6 rounded-md border"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="mb-1 font-semibold flex-1">
                    {index + 1}. {question.text}
                  </h4>
                  <div className="text-sm text-gray-500 ml-4">
                    {question.mark} {question.mark === 1 ? "point" : "points"}
                  </div>
                </div>

                {question.explanation && (
                  <p className="text-xs text-gray-600 mb-3 italic">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                )}

                {/* Multiple Choice Questions */}
                {question.type === "mcq" && question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <div
                        className={cn(
                          "py-1.5 rounded-sm text-sm flex items-center gap-1",
                          option.isCorrect
                            ? "text-emerald-700"
                            : "text-gray-600"
                        )}
                        key={`${question.id}-option-${optionIndex}`}
                      >
                        {option.isCorrect ? (
                          <CircleCheck className="size-4 text-emerald-500" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                        <p>
                          <span className="font-medium mr-1">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Answer and Long Answer Questions */}
                {(question.type === "short_answer" ||
                  question.type === "long_answer") && (
                  <div className="mb-4 p-3  rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>
                        {question.type === "short_answer"
                          ? "Correct Answer:"
                          : "Sample Answer:"}
                      </strong>
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {typeof question.correctAnswer === "string"
                        ? question.correctAnswer
                        : JSON.stringify(question.correctAnswer)}
                    </p>
                  </div>
                )}

                {/* Question Type Badge */}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      question.type === "mcq" && "bg-blue-100 text-blue-700",
                      question.type === "short_answer" &&
                        "bg-green-100 text-green-700",
                      question.type === "long_answer" &&
                        "bg-purple-100 text-purple-700"
                    )}
                  >
                    {question.type === "mcq" && "Multiple Choice"}
                    {question.type === "short_answer" && "Short Answer"}
                    {question.type === "long_answer" && "Long Answer"}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      disabled={showAddForm || editingQuestion}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      variant="ghost"
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={showAddForm || editingQuestion}
                    >
                      <Trash className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
