"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const QuizSetAction = ({ 
  disabled, 
  quizId, 
  isPublished, 
  onPublishToggle 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublish = async () => {
    if (!onPublishToggle) return;
    
    setIsLoading(true);
    try {
      await onPublishToggle(!isPublished);
    } catch (error) {
      toast.error("Failed to update quiz status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTogglePublish}
      disabled={disabled || isLoading}
      variant={isPublished ? "outline" : "default"}
      size="sm"
    >
      {isPublished ? (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Publish
        </>
      )}
    </Button>
  );
};