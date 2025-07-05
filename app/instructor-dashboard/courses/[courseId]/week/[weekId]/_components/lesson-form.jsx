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
import { cn } from "@/lib/utils";
import { Loader2, PlusCircle, Pencil } from "lucide-react";
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

export const LessonForm = ({ weekDetails, courseId, weekId }) => {
  console.log("week details in lesson form: ", weekDetails)
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessons, setLessons] = useState(weekDetails?.lessons || []);
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false); // For reorder/save operations

  const toggleCreating = () => setIsCreating((current) => !current);
  const toggleEditing = () => setIsEditing((current) => !current);

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
          order: lessons.length + 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create lesson");
      }

      const newLesson = await response.json();

      setLessons((prevLessons) => [...prevLessons, newLesson].sort((a, b) => a.order - b.order)); // Add and re-sort
      toast.success("Lesson created successfully");
      toggleCreating();
      createForm.reset();
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error creating lesson:", error);
    }
  };

  //!!MARK: REORDER LESSONS
  const onReorder = async (updateData) => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/courses/${courseId}/week/${weekId}/lessons/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: updateData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reorder lessons");
      }

      // UpdatING local state immediately for better UX, then refresh
      const updatedLessons = lessons.map(lesson => {
        const update = updateData.find(item => item.id === lesson.id);
        if (update) {
          return { ...lesson, order: update.order };
        }
        return lesson;
      }).sort((a, b) => a.order - b.order);
      setLessons(updatedLessons);

      toast.success("Lessons reordered successfully");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error reordering lessons:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // !MARK: EDIT LESSON
  const onEdit = (lessonId) => {
    const lessonToEdit = lessons.find(lesson => lesson.id === lessonId);
    if (lessonToEdit) {
      setEditingLesson(lessonToEdit);
      toggleEditing();
    } else {
      toast.error("Lesson not found for editing.");
    }
  };

  //!MARK: SAVE EDITED LESSON
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


      setLessons(prevLessons =>
          prevLessons.map(lesson =>
              lesson.id === savedLesson.id ? savedLesson : lesson
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

  //!MARK: DELETE LESSON
  const onDelete = async (lessonId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/weeks/${weekId}/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete lesson");
      }

      setLessons((prevLessons) => prevLessons.filter(lesson => lesson.id !== lessonId));
      toast.success("Lesson deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error deleting lesson:", error);
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
          Week Lessons
          <Button variant="ghost" onClick={toggleCreating}>
            {isCreating ? (
                <>Cancel</>
            ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add a lesson
                </>
            )}
          </Button>
        </div>

        {/*!MARK: CREATE LESSON FORM */}
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

        {/* !MARK: LESSON LIST */}
        {!isCreating && (
            <div
                className={cn(
                    "text-sm mt-2",
                    !lessons?.length && "text-slate-500 italic"
                )}
            >
              {!lessons?.length ? (
                  <p className="text-slate-500 italic">No lessons added yet.</p>
              ) : (
                  <LessonList
                      onEdit={onEdit} // Pass the onEdit handler
                      onReorder={onReorder}
                      onDelete={onDelete}
                      items={lessons || []}
                  />
              )}
            </div>
        )}

        {!isCreating && lessons?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Drag & Drop to reorder the lessons
            </p>
        )}

        {/* !MARK: LESSON EDIT MODAL */}
        <LessonModal
            open={isEditing}
            setOpen={toggleEditing}
            lessonData={editingLesson} // Pass the lesson data to edit
            onSave={handleLessonSave} // Pass the save handler
            courseId={courseId} // Pass courseId
            weekId={weekId}     // Pass weekId
        />
      </div>
  );
};