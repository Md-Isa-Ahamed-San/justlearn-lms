"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Settings,
  AlertCircle,
  Users,
  FileText,
  Cog,
} from "lucide-react";

// API call to update quiz (general properties like type, title, description)
const updateQuizAPI = async (quizId, dataToUpdate) => {
  console.log(`Updating quiz ${quizId} with:`, dataToUpdate);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
  toast.success("Quiz updated successfully!");
  return { ...dataToUpdate };
};

const EditQuizSet = ({ initialQuizData }) => {
  const [quizData, setQuizData] = useState(initialQuizData);
  const [selectedQuizType, setSelectedQuizType] = useState(
    initialQuizData?.generationType || "manual"
  );
  const [isLoading, setIsLoading] = useState(
    !initialQuizData && initialQuizData !== null
  );

  useEffect(() => {
    setQuizData(initialQuizData);
    setSelectedQuizType(initialQuizData?.generationType || "manual");
    setIsLoading(!initialQuizData && initialQuizData !== null);
  }, [initialQuizData]);

  const handleQuizTypeChange = async (newType) => {
    if (!quizData) return;
    try {
      setSelectedQuizType(newType);
      setQuizData((prev) => ({ ...prev, generationType: newType }));
      await updateQuizAPI(quizData.id, { generationType: newType });
    } catch (error) {
      toast.error(`Failed to update quiz type: ${error.message}`);
      setSelectedQuizType(quizData.generationType);
      setQuizData((prev) => ({ ...prev, generationType: prev.generationType }));
    }
  };

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
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    ai_pool: {
      icon: Shuffle,
      label: "AI Question Pool",
      description: "AI creates a pool for randomized questions",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  };

  const currentTypeConfig = quizTypeConfig[selectedQuizType];
  const TypeIcon = currentTypeConfig?.icon || Settings;

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
                Current Type:
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
                  await updateQuizAPI(quizData.id, { active: newPublishState });
                  setQuizData((prev) => ({ ...prev, active: newPublishState }));
                  toast.success(
                    `Quiz ${newPublishState ? "published" : "unpublished"}!`
                  );
                } catch (error) {
                  toast.error(
                    `Failed to ${
                      newPublishState ? "publish" : "unpublish"
                    } quiz.`
                  );
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Type Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cog className="h-5 w-5 text-primary" />
              Quiz Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedQuizType}
              onValueChange={handleQuizTypeChange}
              disabled={!quizData}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select Quiz Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(quizTypeConfig).map(([value, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={value} value={value} className="py-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <div className="text-left">
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Type Description Card */}
            <div
              className={`p-4 rounded-lg border ${currentTypeConfig?.bgColor} ${currentTypeConfig?.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <TypeIcon
                  className={`h-5 w-5 mt-0.5 ${currentTypeConfig?.color}`}
                />
                <div>
                  <h4
                    className={`font-semibold ${currentTypeConfig?.color} mb-1`}
                  >
                    {currentTypeConfig?.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentTypeConfig?.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="lg:col-span-2">
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
      </div>

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
          {selectedQuizType === "manual" && (
            <ManualQuizEditor quizData={quizData} setQuizData={setQuizData} />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuizSet;
