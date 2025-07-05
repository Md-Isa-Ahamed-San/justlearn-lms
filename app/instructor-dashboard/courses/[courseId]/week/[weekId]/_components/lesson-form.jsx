"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Loader2,
  PlusCircle,
  X,
  CheckCircle,
  GripVertical,
  Video,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  FileQuestion,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LessonList } from "./lesson-list";
import { LessonModal } from "./lesson-modal";

// Schema for creating a lesson
const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const LessonForm = ({ weekDetails, courseId, weekId, availableQuizzes = [] }) => {
  console.log("week details in lesson form: ", weekDetails);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState(weekDetails?.quizIds || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const toggleCreating = () => setIsCreating((current) => !current);
  const toggleEditing = () => setIsEditing((current) => !current);

  // Initialize items with lessons and quizzes
  useEffect(() => {
    const lessons = weekDetails?.lessons || [];
    const quizzes = availableQuizzes.filter(quiz =>
        (weekDetails?.quizIds || []).includes(quiz.id)
    );

    // Combine lessons and quizzes, maintaining order
    const combinedItems = [
      ...lessons.map(lesson => ({
        ...lesson,
        type: 'lesson',
        order: lesson.order || 0
      })),
      ...quizzes.map(quiz => ({
        ...quiz,
        type: 'quiz',
        order: quiz.order || 999 // Place quizzes at the end initially
      }))
    ].sort((a, b) => a.order - b.order);

    setItems(combinedItems);
  }, [weekDetails, availableQuizzes]);

  // Form for creating a new lesson
  const createForm = useForm({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      videoUrl: "",
    },
  });

  const { isSubmitting: isCreatingSubmitting, isValid: isCreateFormValid } = createForm.formState;

  // Helper functions
  const formatTimeLimit = (minutes) => {
    if (!minutes) return "No time limit";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "No duration";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  };

  const getQuizStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- CREATE LESSON SUBMISSION ---
  const onCreateSubmit = async (values) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          weekId,
          order: items.length + 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create lesson");
      }

      const newLesson = await response.json();
      const newLessonWithType = { ...newLesson, type: 'lesson' };

      setItems((prevItems) => [...prevItems, newLessonWithType].sort((a, b) => a.order - b.order));
      toast.success("Lesson created successfully");
      toggleCreating();
      createForm.reset();
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error creating lesson:", error);
    }
  };

  // REORDER ITEMS (lessons and quizzes)
  const onReorder = async (updateData) => {
    try {
      setIsUpdating(true);

      // Separate lessons and quizzes for different API calls
      const lessonUpdates = updateData.filter(item => item.type === 'lesson');
      const quizUpdates = updateData.filter(item => item.type === 'quiz');

      // Update lessons order
      if (lessonUpdates.length > 0) {
        const response = await fetch(`/api/courses/${courseId}/week/${weekId}/lessons/reorder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ list: lessonUpdates }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to reorder lessons");
        }
      }

      // Update quizzes order (you'll need to implement this API endpoint)
      if (quizUpdates.length > 0) {
        const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/quizzes/reorder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ list: quizUpdates }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to reorder quizzes");
        }
      }

      // Update local state
      const updatedItems = items.map(item => {
        const update = updateData.find(updateItem => updateItem.id === item.id);
        if (update) {
          return { ...item, order: update.order };
        }
        return item;
      }).sort((a, b) => a.order - b.order);

      setItems(updatedItems);
      toast.success("Items reordered successfully");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error reordering items:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // EDIT LESSON
  const onEdit = (lessonId) => {
    const lessonToEdit = items.find(item => item.id === lessonId && item.type === 'lesson');
    if (lessonToEdit) {
      setEditingLesson(lessonToEdit);
      toggleEditing();
    } else {
      toast.error("Lesson not found for editing.");
    }
  };

  // SAVE EDITED LESSON
  const handleLessonSave = async (updatedLessonData) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/lessons/${updatedLessonData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLessonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update lesson");
      }

      const savedLesson = await response.json();

      setItems(prevItems =>
          prevItems.map(item =>
              item.id === savedLesson.id ? { ...savedLesson, type: 'lesson' } : item
          )
      );

      toast.success("Lesson updated successfully");
      toggleEditing();
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error saving lesson:", error);
    }
  };

  // DELETE ITEM (lesson or quiz)
  const onDelete = async (itemId, itemType) => {
    try {
      if (itemType === 'lesson') {
        const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/lessons/${itemId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete lesson");
        }
      } else if (itemType === 'quiz') {
        // Remove quiz from week (you'll need to implement this API endpoint)
        const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/quizzes/${itemId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove quiz");
        }

        setSelectedQuizzes(prev => prev.filter(id => id !== itemId));
      }

      setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
      toast.success(`${itemType === 'lesson' ? 'Lesson' : 'Quiz'} ${itemType === 'lesson' ? 'deleted' : 'removed'} successfully`);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error(`Error deleting ${itemType}:`, error);
    }
  };

  // QUIZ SELECTION
  const handleQuizSelect = (quizId) => {
    setSelectedQuizzes(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });
  };

  // ADD SELECTED QUIZZES
  const handleAddQuizzes = async () => {
    try {
      // Add selected quizzes to the week (you'll need to implement this API endpoint)
      const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizIds: selectedQuizzes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add quizzes");
      }

      // Add selected quizzes to the items list
      const newQuizzes = availableQuizzes
          .filter(quiz => selectedQuizzes.includes(quiz.id))
          .filter(quiz => !items.some(item => item.id === quiz.id))
          .map(quiz => ({
            ...quiz,
            type: 'quiz',
            order: items.length
          }));

      setItems(prev => [...prev, ...newQuizzes]);
      setIsAddingQuiz(false);
      toast.success("Quizzes added successfully");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error adding quizzes:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (dragIndex !== dropIndex) {
      const newItems = [...items];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      // Update order for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index
      }));

      setItems(updatedItems);

      // Call reorder API
      onReorder(updatedItems);
    }
  };

  return (
      <div className="relative mt-6 border rounded-md p-4">
        {isUpdating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-slate-200/50">
              <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
            </div>
        )}

        <div className="font-medium flex items-center justify-between">
          Week Lessons & Quizzes
          <div className="flex gap-2">
            <Button variant="ghost" onClick={toggleCreating}>
              {isCreating ? (
                  <>Cancel</>
              ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Lesson
                  </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setIsAddingQuiz(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Quiz
            </Button>
          </div>
        </div>

        {/* CREATE LESSON FORM */}
        {isCreating && (
            <Form {...createForm}>
              <form
                  onSubmit={createForm.handleSubmit(onCreateSubmit)}
                  className="space-y-4 mt-4"
              >
                <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                                disabled={isCreatingSubmitting}
                                placeholder="e.g. 'Introduction to HTML Structure'"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                                disabled={isCreatingSubmitting}
                                placeholder="e.g. 'Learn about the basic structure of HTML documents...'"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={createForm.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                                type="number"
                                disabled={isCreatingSubmitting}
                                placeholder="Duration in seconds (e.g. 1200)"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={createForm.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                                disabled={isCreatingSubmitting}
                                placeholder="Video URL (optional)"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={!isCreateFormValid || isCreatingSubmitting} type="submit">
                  Create
                </Button>
              </form>
            </Form>
        )}

        {/* ITEMS LIST */}
        {!isCreating && (
            <div className="space-y-3 mt-4">
              {items.length === 0 ? (
                  <p className="text-slate-500 italic">No lessons or quizzes added yet.</p>
              ) : (
                  items.map((item, index) => (
                      <Card
                          key={`${item.type}-${item.id}`}
                          className={cn(
                              "cursor-move transition-all hover:shadow-md",
                              item.type === 'lesson' ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-green-500"
                          )}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {item.type === 'lesson' ? (
                                      <Video className="h-4 w-4 text-blue-500" />
                                  ) : (
                                      <BookOpen className="h-4 w-4 text-green-500" />
                                  )}
                                  <h4 className="font-medium">{item.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                  {item.type === 'quiz' && (
                                      <Badge className={cn("text-xs", getQuizStatusColor(item.status))}>
                                        {item.status}
                                      </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {item.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {item.type === 'lesson' ? (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{formatDuration(item.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span>Access: {item.access || 'free'}</span>
                                        </div>
                                      </>
                                  ) : (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <FileQuestion className="h-3 w-3" />
                                          <span>{item.questionsPerStudent || 0} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTimeLimit(item.timeLimit)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          <span>{item.maxAttempts || 1} attempts</span>
                                        </div>
                                      </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.type === 'lesson' && (
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onEdit(item.id)}
                                      className="text-blue-500 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                              )}
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDelete(item.id, item.type)}
                                  className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))
              )}
            </div>
        )}

        {!isCreating && items.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Drag & Drop to reorder the lessons and quizzes
            </p>
        )}

        {/* QUIZ SELECTION MODAL */}
        {isAddingQuiz && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Quiz to Week</h3>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingQuiz(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  {availableQuizzes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No quizzes available</p>
                        <p className="text-sm">Create a quiz first to add it to this week</p>
                      </div>
                  ) : (
                      availableQuizzes
                          .filter(quiz => !items.some(item => item.id === quiz.id))
                          .map((quiz) => (
                              <Card
                                  key={quiz.id}
                                  className={cn(
                                      "cursor-pointer transition-all hover:shadow-md",
                                      selectedQuizzes.includes(quiz.id)
                                          ? "ring-2 ring-blue-500 bg-blue-50"
                                          : "hover:bg-gray-50"
                                  )}
                                  onClick={() => handleQuizSelect(quiz.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium">{quiz.title}</h4>
                                        <Badge className={cn("text-xs", getQuizStatusColor(quiz.status))}>
                                          {quiz.status}
                                        </Badge>
                                        {selectedQuizzes.includes(quiz.id) && (
                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <FileQuestion className="h-3 w-3" />
                                          <span>{quiz.questionsPerStudent || 0} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTimeLimit(quiz.timeLimit)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          <span>{quiz.maxAttempts || 1} attempts</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                          ))
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                      variant="outline"
                      onClick={() => setIsAddingQuiz(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                      onClick={handleAddQuizzes}
                      disabled={selectedQuizzes.length === 0}
                  >
                    Add Selected Quizzes
                  </Button>
                </div>
              </div>
            </div>
        )}

        {/* LESSON EDIT MODAL */}
        <LessonModal
            open={isEditing}
            setOpen={toggleEditing}
            lessonData={editingLesson}
            onSave={handleLessonSave}
            courseId={courseId}
            weekId={weekId}
        />
      </div>
  );
};