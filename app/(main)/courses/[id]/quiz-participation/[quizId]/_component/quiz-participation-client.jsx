// app/(main)/courses/[id]/quiz-participation/[quizId]/_components/QuizParticipationClient.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    Send,
    Timer,
    BookOpen,
    Users,
    Award,
    AlertCircle,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
    startQuizSubmission,
    submitQuizAnswer,
    completeQuizSubmission
} from "@/app/actions/quiz-submission";

const QuizParticipationClient = ({
                                     quiz,
                                     currentUser,
                                     courseId,
                                     userSubmissions,
                                     hasExceededAttempts,
                                     hasCompletedSubmission,
                                 }) => {
    const router = useRouter();
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [suspiciousActivities, setSuspiciousActivities] = useState([]);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [minimizeCount, setMinimizeCount] = useState(0);
    const [offlineCount, setOfflineCount] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [finalResults, setFinalResults] = useState(null);

    // Questions for this user (could be from pool or fixed set)
    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // Calculate time limit in seconds
    const timeLimitSeconds = (quiz.timeLimit || 5) * 60;

    // Start quiz
    const handleStartQuiz = async () => {
        try {
            setIsSubmitting(true);
            const submission = await startQuizSubmission({
                userId: currentUser.id,
                quizId: quiz.id,
                attemptNumber: userSubmissions.length + 1,
            });

            setCurrentSubmission(submission);
            setQuizStarted(true);
            setTimeLeft(timeLimitSeconds);
            toast.success("Quiz started successfully!");
        } catch (error) {
            console.error("Error starting quiz:", error);
            toast.error("Failed to start quiz. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Timer effect
    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleAutoSubmit("time_expired");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quizStarted, timeLeft]);

    // Handle answer change
    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    // Auto-submit when time expires or violations occur
    const handleAutoSubmit = useCallback(async (reason) => {
        if (!currentSubmission) return;

        try {
            const result = await completeQuizSubmission({
                submissionId: currentSubmission.id,
                answers,
                submissionReason: reason,
                suspiciousActivities,
                tabSwitchCount,
                minimizeCount,
                offlineCount,
            });

            if (result.success) {
                setFinalResults(result.results);
                setShowResults(true);
                setQuizStarted(false);
            }
        } catch (error) {
            console.error("Error auto-submitting quiz:", error);
        }
    }, [currentSubmission, answers, suspiciousActivities, tabSwitchCount, minimizeCount, offlineCount]);

    // Handle manual submission
    const handleSubmitQuiz = async () => {
        if (!currentSubmission) return;

        try {
            setIsSubmitting(true);
            const result = await completeQuizSubmission({
                submissionId: currentSubmission.id,
                answers,
                submissionReason: "manual_submit",
                suspiciousActivities,
                tabSwitchCount,
                minimizeCount,
                offlineCount,
            });

            if (result.success) {
                setFinalResults(result.results);
                setShowResults(true);
                setQuizStarted(false);
                toast.success("Quiz submitted successfully!");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            toast.error("Failed to submit quiz. Please try again.");
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    // Monitor tab switching and focus
    useEffect(() => {
        if (!quizStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setMinimizeCount(prev => prev + 1);
                setSuspiciousActivities(prev => [...prev, {
                    action: 'minimize',
                    timestamp: new Date().toISOString()
                }]);
            }
        };

        const handleFocusChange = () => {
            if (!document.hasFocus()) {
                setTabSwitchCount(prev => prev + 1);
                setSuspiciousActivities(prev => [...prev, {
                    action: 'tab_switch',
                    timestamp: new Date().toISOString()
                }]);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleFocusChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleFocusChange);
        };
    }, [quizStarted]);

    // Format time
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Render question based on type
    const renderQuestion = (question) => {
        const currentAnswer = answers[question.id] || "";

        switch (question.type) {
            case "mcq":
                return (
                    <div className="space-y-4">
                        <RadioGroup
                            value={currentAnswer}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                        >
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label
                                        htmlFor={`option-${index}`}
                                        className="flex-1 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );

            case "short_answer":
                return (
                    <div className="space-y-4">
                        <Textarea
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Enter your answer here..."
                            className="min-h-[100px] bg-input border-border text-foreground"
                            maxLength={500}
                        />
                        <p className="text-sm text-muted-foreground">
                            {currentAnswer.length}/500 characters
                        </p>
                    </div>
                );

            case "long_answer":
                return (
                    <div className="space-y-4">
                        <Textarea
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Enter your detailed answer here..."
                            className="min-h-[200px] bg-input border-border text-foreground"
                            maxLength={2000}
                        />
                        <p className="text-sm text-muted-foreground">
                            {currentAnswer.length}/2000 characters
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    // If quiz not started, show start screen
    if (!quizStarted && !showResults) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`/courses/${courseId}`)}
                                className="mb-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Button>
                            <h1 className="text-3xl font-bold text-foreground font-poppins mb-2">
                                {quiz.title}
                            </h1>
                            <p className="text-muted-foreground">{quiz.description}</p>
                        </div>

                        {/* Quiz Info */}
                        <Card className="mb-8 bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground font-poppins">Quiz Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-foreground">Questions</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.questionsPerStudent || questions.length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-foreground">Time Limit</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.timeLimit || 5} minutes
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-foreground">Max Attempts</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.maxAttempts || 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Previous Attempts */}
                        {userSubmissions.length > 0 && (
                            <Card className="mb-8 bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-foreground font-poppins">Previous Attempts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {userSubmissions.map((submission, index) => (
                                            <div
                                                key={submission.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="border-border text-foreground">
                                                        Attempt {submission.attemptNumber}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={submission.status === "completed" ? "default" : "secondary"}
                                                        className={
                                                            submission.status === "completed"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-secondary text-secondary-foreground"
                                                        }
                                                    >
                                                        {submission.status}
                                                    </Badge>
                                                    {submission.status === "completed" && (
                                                        <span className="text-sm font-medium text-foreground">
                              Score: {submission.score}%
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Warnings */}
                        {hasExceededAttempts && (
                            <Alert className="mb-8 border-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    You have reached the maximum number of attempts for this quiz.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Start Button */}
                        <div className="flex justify-center">
                            <Button
                                onClick={handleStartQuiz}
                                disabled={isSubmitting || hasExceededAttempts}
                                size="lg"
                                className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Timer className="mr-2 h-4 w-4 animate-spin" />
                                        Starting Quiz...
                                    </>
                                ) : (
                                    <>
                                        <Award className="mr-2 h-4 w-4" />
                                        Start Quiz
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show results
    if (showResults && finalResults) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-card border-border">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold text-foreground font-poppins">
                                    Quiz Completed!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground mb-2">
                                        {finalResults.score}%
                                    </h2>
                                    <p className="text-muted-foreground">
                                        You scored {finalResults.correctAnswers} out of {finalResults.totalQuestions} questions correctly
                                    </p>
                                </div>

                                {quiz.showResultsImmediately && (
                                    <div className="space-y-4">
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {finalResults.correctAnswers}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Correct</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {finalResults.wrongAnswers}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Wrong</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-foreground">
                                                    {formatTime(finalResults.timeSpent)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Time Spent</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <Button
                                        onClick={() => router.push(`/courses/${courseId}`)}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Course
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz interface
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-foreground font-poppins">
                                {quiz.title}
                            </h1>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-border text-foreground">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </Badge>
                                <div className="flex items-center gap-2 text-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-mono font-medium">
                    {formatTime(timeLeft)}
                  </span>
                                </div>
                            </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Question */}
                    <Card className="mb-6 bg-card border-border">
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <Badge variant="outline" className="border-border text-foreground">
                                        Q{currentQuestionIndex + 1}
                                    </Badge>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-foreground mb-2">
                                            {currentQuestion?.text}
                                        </h3>
                                        {currentQuestion?.image && (
                                            <img
                                                src={currentQuestion.image}
                                                alt="Question"
                                                className="max-w-full h-auto rounded-lg border border-border"
                                            />
                                        )}
                                    </div>
                                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                        {currentQuestion?.mark} {currentQuestion?.mark === 1 ? 'Mark' : 'Marks'}
                                    </Badge>
                                </div>
                            </div>

                            {renderQuestion(currentQuestion)}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-2">
                            {questions.map((_, index) => (
                                <Button
                                    key={index}
                                    variant={index === currentQuestionIndex ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={
                                        index === currentQuestionIndex
                                            ? "bg-primary text-primary-foreground"
                                            : answers[questions[index]?.id]
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                    }
                                >
                                    {index + 1}
                                </Button>
                            ))}
                        </div>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                onClick={() => setShowConfirmDialog(true)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Submit Quiz
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Violations Warning */}
                    {(tabSwitchCount > 0 || minimizeCount > 0) && (
                        <Alert className="border-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> Suspicious activity detected.
                                Tab switches: {tabSwitchCount}, Window minimizes: {minimizeCount}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground font-poppins">Submit Quiz</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Are you sure you want to submit your quiz? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Timer className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Quiz
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default QuizParticipationClient;