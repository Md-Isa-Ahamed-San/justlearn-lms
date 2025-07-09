"use client";
import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookCheck,
  Clock,
  FileText,
  Video,
  Play,
  Download,
  ExternalLink,
  CheckCircle,
  Circle,
  Users,
  Award,
} from "lucide-react";
import {toast} from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CourseCurriculum = ({
                            courseDetails,
                            currentUser,
                            completedLessons,
                            onMarkLessonComplete
                          }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleMarkLessonComplete = async () => {
    setIsUpdating(true);
    try {
      const result = await onMarkLessonComplete(lesson.id);
      if (result && !result.success) {
        console.error('Failed to update lesson progress:', result.error);
      toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    } finally {
      setIsUpdating(false);
    }
  }
  console.log("CourseCurriculum ~ courseDetails:", courseDetails);

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'image':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <Download className="h-4 w-4" />;
      case 'link':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleAttachmentClick = (attachment) => {
    if (attachment.type === 'link') {
      window.open(attachment.url, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const onNavigateToQuiz = (quizId) => {
    // Add your quiz navigation logic here
    console.log("Navigate to quiz:", quizId);
  };

  const getTotalDuration = () => {
    if (!courseDetails?.weeks) return 0;
    return courseDetails.weeks.reduce((total, week) => total + (week.duration || 0), 0);
  };

  const getTotalLessons = () => {
    if (!courseDetails?.weeks) return 0;
    return courseDetails.weeks.reduce((total, week) => total + (week.lessons?.length || 0), 0);
  };

  const LessonModal = ({ lesson, week }) => {
    const isCompleted = isLessonCompleted(lesson.id);

    return (
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-poppins font-bold">
              {lesson.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Lesson Description */}
            <div>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>

            {/* Video Player */}
            {lesson.videoUrl && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground font-poppins font-bold flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Lesson Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Play className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Video Player</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => window.open(lesson.videoUrl, '_blank')}
                        >
                          Watch on YouTube
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Lesson Resources */}
            {lesson.attachments && lesson.attachments.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground font-poppins font-bold">
                      Resources & Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lesson.attachments.map((attachment, idx) => (
                          <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => handleAttachmentClick(attachment)}
                          >
                            <div className="flex items-center gap-3">
                              {getAttachmentIcon(attachment.type)}
                              <div>
                                <p className="font-medium text-foreground">{attachment.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {attachment.type}
                                </p>
                              </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              {attachment.type === 'link' ? 'Open' : 'Download'}
                            </Button>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Lesson Progress */}
            {currentUser && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">
                      {isCompleted ? 'Completed' : 'Not Completed'}
                    </span>
                      </div>

                      <Button
                          onClick={handleMarkLessonComplete}
                          variant={isCompleted ? "outline" : "default"}
                          disabled={isUpdating}
                          className={isCompleted
                              ? "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }
                      >
                        {isUpdating ? 'Updating...' : (isCompleted ? 'Mark as Incomplete' : 'Mark as Complete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </DialogContent>
    );
  };

  return (
      <TabsContent value="curriculum" className="mt-6">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-foreground font-poppins">Course Curriculum</h3>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookCheck className="h-4 w-4" />
                <span className="text-foreground">{courseDetails?.weeks?.length || 0} Weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-foreground">{Math.ceil(getTotalDuration() / 60)}+ Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="text-foreground">{getTotalLessons()} Lessons</span>
              </div>
            </div>
          </div>

          <Accordion
              type="multiple"
              defaultValue={courseDetails?.weeks?.map((m) => m.id) || []}
              className="w-full"
          >
            {courseDetails?.weeks?.map((week) => (
                <AccordionItem key={week.id} value={week.id} className="border-b border-border px-0">
                  <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline text-foreground font-poppins">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-border text-foreground">
                        Week {week.order}
                      </Badge>
                      {week.title}
                      {week.status === 'draft' && (
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                            Draft
                          </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 p-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Video className="h-4 w-4" />
                        <span className="text-foreground">{week.lessons?.length || 0} Lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span className="text-foreground">{Math.ceil((week.duration || 0) / 60)} Hours</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span className="text-muted-foreground">{week.description}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Lessons */}
                      {week.lessons?.map((lesson, idx) => (
                          <div
                              key={lesson.id}
                              className="flex items-center justify-between rounded-lg p-3 pl-8 transition-colors hover:bg-muted/50 border border-border"
                          >
                            <div className="flex items-center gap-3">
                              {currentUser && isLessonCompleted(lesson.id) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                  <Video className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <span className="font-medium text-foreground">{lesson.title}</span>
                                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.attachments && lesson.attachments.length > 0 && (
                                  <Badge variant="outline" className="border-border text-foreground">
                                    {lesson.attachments.length} Resources
                                  </Badge>
                              )}
                              {currentUser ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 gap-1 text-foreground hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => setSelectedLesson(lesson)}
                                      >
                                        <Play className="h-3 w-3" />
                                        Start Lesson
                                      </Button>
                                    </DialogTrigger>
                                    <LessonModal lesson={lesson} week={week} />
                                  </Dialog>
                              ) : (
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1 text-foreground hover:bg-accent hover:text-accent-foreground"
                                  >
                                    Preview
                                  </Button>
                              )}
                            </div>
                          </div>
                      ))}

                      {/* Quizzes */}
                      {week.quizzes?.map((quiz) => (
                          <div
                              key={quiz.id}
                              className="flex items-center justify-between rounded-lg p-3 pl-8 transition-colors hover:bg-muted/50 border border-border bg-accent/20"
                          >
                            <div className="flex items-center gap-3">
                              <Award className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="font-medium text-foreground">{quiz.title}</span>
                                <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>{quiz.questionsPerStudent} Questions</span>
                                  <span>{quiz.timeLimit} Minutes</span>
                                  <span>{quiz.maxAttempts} Attempt(s)</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-border text-foreground">
                                Quiz
                              </Badge>
                              {currentUser ? (
                                  <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                      onClick={() => onNavigateToQuiz(quiz.id)}
                                  >
                                    <Users className="h-3 w-3" />
                                    Take Quiz
                                  </Button>
                              ) : (
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1 text-foreground hover:bg-accent hover:text-accent-foreground"
                                  >
                                    Preview
                                  </Button>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </TabsContent>
  );
};

export default CourseCurriculum;