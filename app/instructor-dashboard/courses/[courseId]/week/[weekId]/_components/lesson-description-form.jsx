"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Dynamic import of ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded border"></div>
});

const formSchema = z.object({
    description: z.string().min(1, "Description is required"),
});

export const LessonDescriptionForm = ({
                                          descriptionData,
                                          courseId,
                                          lessonId,
                                          onUpdate
                                      }) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: descriptionData || "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    // Reset form when descriptionData changes
    useEffect(() => {
        if (descriptionData !== undefined) {
            form.reset({ description: descriptionData });
        }
    }, [descriptionData, form]);

    const onSubmit = async (values) => {
        try {
            // Call the parent's onUpdate function if provided
            if (onUpdate) {
                await onUpdate({ description: values.description });
            } else {
                // Default API call if no onUpdate provided
                const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to update lesson description");
                }
            }

            toast.success("Lesson description updated successfully");
            toggleEdit();
        } catch (error) {
            toast.error(error.message || "Something went wrong");
            console.error("Error updating lesson description:", error);
        }
    };

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className="mt-6 border rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Lesson Description
                <Button variant="ghost" onClick={toggleEdit}>
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit description
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <div
                    className={cn(
                        "text-sm mt-2 text-white",
                        !descriptionData && " italic"
                    )}
                >
                    {!descriptionData ? (
                        <p>No description provided</p>
                    ) : (
                        <div
                            className="prose prose-sm max-w-none text-foreground"
                            dangerouslySetInnerHTML={{ __html: descriptionData }}
                        />
                    )}
                </div>
            )}

            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ReactQuill
                                            theme="snow"
                                            value={field.value}
                                            onChange={field.onChange}
                                            modules={modules}
                                            formats={formats}
                                            placeholder="Enter lesson description..."
                                            style={{ minHeight: '200px' }}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button disabled={!isValid || isSubmitting} type="submit">
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};