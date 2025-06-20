"use client";

import { useEffect, useState } from "react";
import { QuizSetAction } from "./quiz-set-action";
import { TitleForm } from "./title-form";
import { DescriptionForm } from "./description-form";
import { ManualQuizEditor } from "./manual-quiz-editor";
import { AIFixedQuizGenerator } from "./ai-fixed-quiz-generator";
import { AIPoolQuizGenerator } from "./ai-pool-quiz-generator";
import { toast } from "sonner";
import AlertBanner from "@/components/alert-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Brain,
  Shuffle,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";

const EditQuizSet = ({ initialQuizData }) => {
  const [quizData, setQuizData] = useState(initialQuizData);
  const [isLoading, setIsLoading] = useState(
    !initialQuizData && initialQuizData !== null
  );

  useEffect(() => {
    setQuizData(initialQuizData);
    setIsLoading(!initialQuizData && initialQuizData !== null);
  }, [initialQuizData]);

  const handleQuizDetailUpdate = async (field, value) => {
    if (!quizData) return;

    try {
      const originalValue = quizData[field];

      setQuizData((prev) => ({ ...prev, [field]: value }));

      const response = await fetch(`/api/quiz/${quizData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Quiz updated:", result.data);

        setQuizData((prev) => ({ ...prev, ...result.data }));
        toast.success(`${field} updated successfully`);
        return result.data;
      } else {
        console.error("Error:", result.message);
     
        setQuizData((prev) => ({ ...prev, [field]: originalValue }));
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast.error(`Failed to update ${field}: ${error.message}`);
    
      setQuizData((prev) => ({ ...prev, [field]: originalValue }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Quiz Not Found
            </h3>
            <p className="text-muted-foreground">
              The quiz could not be loaded or does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz type configurations
  const quizTypeConfig = {
    manual: {
      icon: BookOpen,
      label: "Manual Quiz",
      description: "Create questions manually with full control",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    ai_fixed: {
      icon: Brain,
      label: "AI Fixed Questions",
      description: "AI creates a fixed set of questions",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    ai_pool: {
      icon: Shuffle,
      label: "AI Question Pool",
      description: "AI creates a pool for randomized questions",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
  };

  const currentTypeConfig = quizTypeConfig[quizData.generationType] || quizTypeConfig.manual;
  const TypeIcon = currentTypeConfig?.icon || BookOpen;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Status Banner */}
      {!quizData.active && (
        <AlertBanner
          label="This quiz is currently unpublished and not visible to students."
          variant="warning"
        />
      )}

      {/* Header Section */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Quiz Configuration
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Configure your quiz settings, content, and publication status
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-muted/30 rounded-lg border">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <TypeIcon className={`h-5 w-5 ${currentTypeConfig?.color}`} />
              <span className="font-semibold text-foreground">
                Quiz Type:
              </span>
              <Badge
                variant="outline"
                className={`${currentTypeConfig?.bgColor} ${currentTypeConfig?.borderColor}`}
              >
                {currentTypeConfig?.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTypeConfig?.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={quizData.active ? "default" : "secondary"}>
                {quizData.active ? "Published" : "Draft"}
              </Badge>
            </div>
            <QuizSetAction
              quizId={quizData.id}
              isPublished={quizData.active}
              onPublishToggle={async (newPublishState) => {
                try {
                  // API call to update quiz status
                  const response = await fetch(`/api/quiz/${quizData.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      active: newPublishState,
                    }),
                  });

                  const result = await response.json();

                  if (response.ok) {
                    setQuizData((prev) => ({ ...prev, active: newPublishState }));
                    toast.success(
                      `Quiz ${newPublishState ? "published" : "unpublished"}!`
                    );
                  } else {
                    throw new Error(result.message);
                  }
                } catch (error) {
                  toast.error(
                    `Failed to ${
                      newPublishState ? "publish" : "unpublish"
                    } quiz: ${error.message}`
                  );
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TitleForm
            initialData={{ title: quizData.title }}
            quizId={quizData.id}
            onUpdate={(newTitle) => handleQuizDetailUpdate("title", newTitle)}
          />
          <DescriptionForm
            initialData={{ description: quizData.description }}
            quizId={quizData.id}
            onUpdate={(newDesc) =>
              handleQuizDetailUpdate("description", newDesc)
            }
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Quiz Content Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TypeIcon className={`h-6 w-6 ${currentTypeConfig?.color}`} />
            Quiz Content
            <Badge
              variant="outline"
              className={`ml-2 ${currentTypeConfig?.bgColor} ${currentTypeConfig?.borderColor}`}
            >
              {currentTypeConfig?.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {quizData.generationType === "manual" && (
            <ManualQuizEditor quizData={quizData} setQuizData={setQuizData} />
          )}
          {quizData.generationType === "ai_fixed" && (
            <AIFixedQuizGenerator
              quizData={quizData}
              setQuizData={setQuizData}
            />
          )}
          {quizData.generationType === "ai_pool" && (
            <AIPoolQuizGenerator
              quizData={quizData}
              setQuizData={setQuizData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuizSet;