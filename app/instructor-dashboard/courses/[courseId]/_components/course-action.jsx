"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const CourseActions = ({ status, courseId, disabled }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isPublished = currentStatus === "public";

    const handleToggleStatus = async () => {
        const newStatus = isPublished ? "private" : "public";
        const payload = {
            visibility: newStatus
        };

        setIsLoading(true);

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update course");
            }

            setCurrentStatus(newStatus);
            toast.success(`Course ${newStatus === 'public' ? 'published' : 'saved as draft'} successfully`);
            router.refresh();
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete course");
            }

            toast.success("Course deleted successfully");
            router.push("/courses"); // Redirect to courses list
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error("Failed to delete course");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-x-2">
            <p className="text-sm font-medium bg-primary-foreground p-3 rounded-lg">
                Status: {isPublished ? "Published" : "Draft"}
            </p>

            <Button
                onClick={handleToggleStatus}
                disabled={disabled || isLoading}

                size="sm"
                className="bg-foreground"
            >
                {isLoading ? "Updating..." : "Toggle Status"}
            </Button>

            <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={disabled || isLoading}
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
};