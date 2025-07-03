"use client";

import AlertBanner from "@/components/alert-banner";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {Circle, CircleCheck, Pencil, PlusCircle, Trash, Database} from "lucide-react";
import {useState, useEffect} from "react";
import {toast} from "sonner";
import {AddQuizForm} from "./add-quiz-form";
import {uploadToCloudinary} from "@/utils/uploadToCloudinary";
import Image from "next/image";

export const ManualQuizEditor = ({quizData, setQuizData, initialQuestions = null}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const QuestionDBExistStatus = quizData.questions.every(item => !item.id);

    console.log("quizData inside manual quiz editor: ", quizData);

    useEffect(() => {
        const shouldProcessInitialQuestions =
            initialQuestions &&
            Array.isArray(initialQuestions) &&
            initialQuestions.length > 0 &&
            (quizData?.generationType === "ai_fixed" || quizData?.generationType === "ai_pool") &&
            (!quizData?.questions || quizData.questions.length === 0);

        if (shouldProcessInitialQuestions) {
            handleBulkCreateQuestions(initialQuestions);
        }
    }, [initialQuestions, quizData?.generationType, quizData?.questions?.length, quizData?.id]);

    const handleBulkCreateQuestions = async (questions) => {
        if (!questions || questions.length === 0) return;

        setBulkProcessing(true);

        try {
            console.log("Creating bulk questions:", questions);

            const res = await fetch(`/api/quiz/${quizData.id}/questions/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({questions}),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setQuizData((prev) => ({
                    ...prev,
                    questions: data.questions,
                }));

                toast.success(`${data.count} questions created successfully`);
            } else {
                throw new Error(data.error || "Failed to create questions");
            }
        } catch (error) {
            console.error("Error creating bulk questions:", error);
            toast.error(error.message || "Failed to create questions. Please try again.");
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleImageUpload = async (imageData) => {
        if (!imageData || typeof imageData !== "string" || !imageData.startsWith("data:")) {
            return imageData;
        }

        try {
            console.log("Uploading image to Cloudinary...");
            const uploadResult = await uploadToCloudinary(imageData);
            console.log("Image uploaded successfully:", uploadResult);
            return uploadResult;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image. Please try again.");
        }
    };

    const handleAddQuestion = async (newQuestion) => {
        console.log("handleAddQuestion ~ newQuestion:", newQuestion, quizData);
        setProcessing(true);

        const currentQuestions = quizData?.questions || [];
        const newOrder = currentQuestions.length;

        try {
            // Handle image upload if needed
            const imageUrl = await handleImageUpload(newQuestion.image);

            // Create question with the image URL
            const questionData = {
                quizId: quizData?.id,
                text: newQuestion.text,
                type: newQuestion.type,
                mark: newQuestion.mark,
                explanation: newQuestion.explanation,
                image: imageUrl,
                options: newQuestion.options,
                correctAnswer: newQuestion.correctAnswer,
                order: newOrder,
            };

            const res = await fetch("/api/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(questionData),
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
                            image: imageUrl,
                            order: newOrder,
                        },
                    ],
                }));

                toast.success("Question added successfully");
                closeModal();
            } else {
                throw new Error(data.error || "Failed to add question");
            }
        } catch (error) {
            console.error("Error adding question:", error);
            toast.error(error.message || "Failed to add question. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleAddAllAIQuestions = async () => {
        try {
            setProcessing(true);
            const res = await fetch(`/api/quiz/${quizData.id}/questions/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questions: quizData.questions
                })
            });

            const data = await res.json();
            console.log("data: ", data);
            if (res.ok && data.success) {
                toast.success(`All ${data?.count} questions added successfully`);
                setQuizData((prev) => ({
                    ...prev,
                    questions: data.questions,
                }));
            } else {
                toast.error(data.error || "Failed to add questions");
            }
        } catch (error) {
            console.error("Error adding questions:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateQuestion = async (updatedQuestion) => {
        setProcessing(true);

        try {
            // Handle image upload if needed
            const imageUrl = await handleImageUpload(updatedQuestion.image);

            const questionData = {
                text: updatedQuestion.text,
                type: updatedQuestion.type,
                mark: updatedQuestion.mark,
                explanation: updatedQuestion.explanation,
                image: imageUrl,
                options: updatedQuestion.options,
                correctAnswer: updatedQuestion.correctAnswer,
            };

            const res = await fetch(`/api/question/${updatedQuestion.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(questionData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setQuizData((prev) => ({
                    ...prev,
                    questions: prev.questions.map((q) =>
                        q.id === updatedQuestion.id
                            ? {...updatedQuestion, image: imageUrl}
                            : q
                    ),
                }));

                toast.success("Question updated successfully");
                closeModal();
            } else {
                throw new Error(data.error || "Failed to update question");
            }
        } catch (error) {
            console.error("Error updating question:", error);
            toast.error(error.message || "Failed to update question. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        toast("Are you sure you want to delete this question?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await fetch(`/api/question/${questionId}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        const data = await res.json();

                        if (res.ok && data.success) {
                            setQuizData((prev) => ({
                                ...prev,
                                questions: prev.questions
                                    .filter((q) => q.id !== questionId)
                                    .map((q, index) => ({...q, order: index})),
                            }));
                            toast.success("Question deleted successfully");
                        } else {
                            toast.error(data.message || "Failed to delete question");
                        }
                    } catch (error) {
                        console.error("Delete error:", error);
                        toast.error("Failed to delete question. Please try again.");
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => {
                    toast.dismiss();
                },
            },
        });
    };

    const openAddModal = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleModalOpenChange = (open) => {
        if (!open) {
            closeModal();
        }
    };

    // Derived state for better readability
    const questions = quizData?.questions || [];
    const hasQuestions = questions.length > 0;
    const isAiGenerated = quizData?.generationType === "ai_fixed" || quizData?.generationType === "ai_pool";
    const isPublished = quizData?.status === 'published';
    const isDisabled = bulkProcessing || isPublished;

    // Sort questions by order for consistent display
    const sortedQuestions = questions.sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="mt-6 border rounded-md p-4">
            <div className="font-medium flex items-center justify-between mb-4">
                <h3 className="text-lg">Questions</h3>
                {/* Add buttons */}
                <div className="flex gap-2">
                    {QuestionDBExistStatus && (
                        <Button
                            onClick={handleAddAllAIQuestions}
                            variant="outline"
                            disabled={processing || bulkProcessing}
                        >
                            <Database className="h-4 w-4 mr-2"/>
                            {processing ? "Adding Questions..." : "Add All AI Generated Questions"}
                        </Button>
                    )}

                    <Button
                        onClick={openAddModal}
                        variant="outline"
                        disabled={isDisabled}
                        title={isPublished ? "Cannot modify questions in a published quiz" : ""}
                    >
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Add a Question
                    </Button>
                </div>
            </div>

            {/* Published Quiz Warning */}
            {isPublished && (
                <AlertBanner
                    label="This quiz is published. Questions cannot be modified."
                    variant="info"
                    className="rounded mb-6 bg-blue-50"
                />
            )}

            {/* Bulk Processing Alert */}
            {bulkProcessing && (
                <AlertBanner
                    label="Creating AI-generated questions... Please wait."
                    variant="info"
                    className="rounded mb-6 bg-blue-50"
                />
            )}

            {/* No Questions Alert */}
            {!hasQuestions && !bulkProcessing && (
                <AlertBanner
                    label={`No questions in this ${isAiGenerated ? 'AI-generated' : ''} quiz yet. ${!isAiGenerated && !isPublished ? "Click 'Add a Question' to get started." : isPublished ? "This quiz has no questions." : "Generate questions using AI or add manually."}`}
                    variant="warning"
                    className="rounded mb-6 bg-primary-foreground"
                />
            )}

            {/* Questions List */}
            {hasQuestions && (
                <div className="space-y-6 mt-4">
                    {sortedQuestions.map((question, index) => (
                        <div
                            key={question.id || `question-${index}`}
                            className="shadow-md p-4 lg:p-6 rounded-md border"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex flex-col gap-2">
                                    {question?.image && (
                                        <Image
                                            width={300}
                                            height={300}
                                            src={question?.image}
                                            alt="question image"
                                            className="rounded-md"
                                        />
                                    )}
                                    <h4 className="mb-1 font-semibold flex-1">
                                        {index + 1}. {question.text}
                                    </h4>
                                </div>
                                <div className="text-sm text-gray-500 ml-4 flex flex-col items-end gap-1">
                                    <span>
                                        {question.mark} {question.mark === 1 ? "point" : "points"}
                                    </span>
                                    {question.isFromPool && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                            Pool Question
                                        </span>
                                    )}
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
                                                <CircleCheck className="size-4 text-emerald-500"/>
                                            ) : (
                                                <Circle className="size-4"/>
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
                            {(question.type === "short_answer" || question.type === "long_answer") && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-700 mb-1">
                                        <strong>
                                            {question.type === "short_answer"
                                                ? "Correct Answer:"
                                                : "Sample Answer:"}
                                        </strong>
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {typeof question.correctAnswer === "string"
                                            ? question.correctAnswer
                                            : JSON.stringify(question.correctAnswer)}
                                    </p>
                                </div>
                            )}

                            {/* Question Type Badge and Actions */}
                            <div className="flex items-center justify-between mt-4">
                                <span
                                    className={cn(
                                        "px-2 py-1 text-xs rounded-full",
                                        question.type === "mcq" && "bg-blue-100 text-blue-700",
                                        question.type === "short_answer" && "bg-green-100 text-green-700",
                                        question.type === "long_answer" && "bg-purple-100 text-purple-700"
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
                                        onClick={() => openEditModal(question)}
                                        disabled={isDisabled}
                                        title={isPublished ? "Cannot edit questions in a published quiz" : ""}
                                    >
                                        <Pencil className="w-3 h-3 mr-1"/>
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        variant="ghost"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        disabled={isDisabled}
                                        title={isPublished ? "Cannot delete questions in a published quiz" : ""}
                                    >
                                        <Trash className="w-3 h-3 mr-1"/>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Question Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuestion ? "Edit Question" : "Add New Question"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <AddQuizForm
                            quizId={quizData?.id}
                            initialData={editingQuestion}
                            onQuestionAdded={handleAddQuestion}
                            onQuestionUpdated={handleUpdateQuestion}
                            onCancel={closeModal}
                            isEditing={!!editingQuestion}
                            processing={processing}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};