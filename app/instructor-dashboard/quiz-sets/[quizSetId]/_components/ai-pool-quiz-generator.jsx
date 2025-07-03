"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ManualQuizEditor } from "@/app/instructor-dashboard/quiz-sets/[quizSetId]/_components/manual-quiz-editor";

export const AIPoolQuizGenerator = ({ quizData, setQuizData }) => {
  const [aiPrompt, setAiPrompt] = useState(quizData.aiPrompt || "");
  const [contextText, setContextText] = useState("");
  const [contextFile, setContextFile] = useState(null);
  const [poolSize, setPoolSize] = useState(quizData.poolSize || 20);
  const [questionsPerStudent, setQuestionsPerStudent] = useState(quizData.questionsPerStudent || 5);

  // Question type controls
  const [targetMcq, setTargetMcq] = useState(quizData.targetMcqCount || 10);
  const [targetShort, setTargetShort] = useState(quizData.targetShortAnswerCount || 8);
  const [targetLong, setTargetLong] = useState(quizData.targetLongAnswerCount || 2);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setContextFile(file);

    // Clear context text when file is selected
    if (file) {
      setContextText("");
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!aiPrompt && !contextText && !contextFile) {
      toast.error("Please provide a prompt or context data.");
      return;
    }

    const totalQuestionTypes = targetMcq + targetShort + targetLong;
    if (totalQuestionTypes === 0) {
      toast.error("Please specify at least one question type.");
      return;
    }

    if (poolSize < questionsPerStudent) {
      toast.error("Total questions in pool must be greater than or equal to questions per student.");
      return;
    }

    if (poolSize < 1 || questionsPerStudent < 1) {
      toast.error("Pool size and questions per student must be at least 1.");
      return;
    }

    // Validate that pool size matches the sum of question types
    if (poolSize !== totalQuestionTypes) {
      toast.error(`Pool size (${poolSize}) must equal the sum of question types (${totalQuestionTypes}).`);
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Generating AI pool quiz with Groq:", quizData.id);

      let response;

      // Prepare form data if file is provided, otherwise use JSON
      if (contextFile) {
        const formData = new FormData();

        formData.append('quizId', quizData.id);
        formData.append('aiPrompt', aiPrompt || '');
        formData.append('contextText', contextText || '');
        formData.append('contextFile', contextFile);
        formData.append('poolSize', poolSize.toString());
        formData.append('questionsPerStudent', questionsPerStudent.toString());
        formData.append('targetMcq', targetMcq.toString());
        formData.append('targetShort', targetShort.toString());
        formData.append('targetLong', targetLong.toString());
        formData.append('generationType', 'ai_pool');

        response = await fetch('/api/quiz/groq', {
          method: 'POST',
          body: formData
        });
      } else {
        // Use JSON for text-only requests
        response = await fetch('/api/quiz/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId: quizData.id,
            aiPrompt,
            contextText,
            poolSize,
            questionsPerStudent,
            targetMcq,
            targetShort,
            targetLong,
            generationType: 'ai_pool'
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate quiz pool');
      }

      const result = await response.json();
      const generatedQuestions = result.questions;

      // Update quiz data with pool-specific information - following the same pattern as AIFixedQuizGenerator
      setQuizData(prev => ({
        ...prev,
        questions: generatedQuestions,
        poolSize: poolSize,
        questionsPerStudent: questionsPerStudent,
        targetMcqCount: targetMcq,
        targetShortAnswerCount: targetShort,
        targetLongAnswerCount: targetLong,
        aiPrompt: aiPrompt,
        generationType: 'ai_pool'
      }));

      toast.success(`Question pool of ${generatedQuestions.length} questions generated successfully!`);
    } catch (error) {
      toast.error("AI pool generation failed: " + error.message);
      console.error('Pool generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalQuestions = targetMcq + targetShort + targetLong;
  const hasGeneratedQuestions = quizData.questions && quizData.questions.length > 0;

  return (
      <div className="mt-6 border rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-row gap-2">
            <h3 className="text-lg font-semibold text-gray-900">AI-Generated Quiz Pool</h3>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-sm text-gray-600 px-3 py-1 rounded-full border">
            Pool: {poolSize} → {questionsPerStudent} per student
          </div>
        </div>

        {/* Only show form if no questions generated yet */}
        {!hasGeneratedQuestions && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="aiPoolPrompt" className="text-sm font-medium">
                    Custom Prompt <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Textarea
                      id="aiPoolPrompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Generate diverse questions about React hooks, focusing on useState and useEffect..."
                      rows={3}
                      disabled={isGenerating}
                      className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="poolContextText" className="text-sm font-medium">
                    Context Data <span className="text-gray-500">(Paste Text)</span>
                  </Label>
                  <Textarea
                      id="poolContextText"
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      placeholder="Paste your document text, lecture notes, or study material here..."
                      rows={8}
                      disabled={isGenerating || !!contextFile}
                      className="mt-1 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-sm text-gray-500 px-4 py-1 rounded-full border">
                    OR
                  </div>
                </div>

                <div>
                  <Label htmlFor="poolContextFile" className="text-sm font-medium">
                    Upload Context File <span className="text-gray-500">(PDF, DOCX, TXT)</span>
                  </Label>
                  <Input
                      id="poolContextFile"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={isGenerating || !!contextText}
                      className="mt-1"
                  />
                  {contextFile && (
                      <p className="text-xs mt-2 text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Selected: {contextFile.name} ({(contextFile.size / 1024).toFixed(1)} KB)
                      </p>
                  )}
                </div>

                {/* Question Type Controls */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Question Types for Pool</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="targetMcq" className="text-sm">Multiple Choice Questions</Label>
                      <Input
                          id="targetMcq"
                          type="number"
                          value={targetMcq}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10) || 0;
                            setTargetMcq(newValue);
                            setPoolSize(newValue + targetShort + targetLong);
                          }}
                          min="0"
                          max="50"
                          disabled={isGenerating}
                          className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">1 mark each</p>
                    </div>
                    <div>
                      <Label htmlFor="targetShort" className="text-sm">Short Answer Questions</Label>
                      <Input
                          id="targetShort"
                          type="number"
                          value={targetShort}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10) || 0;
                            setTargetShort(newValue);
                            setPoolSize(targetMcq + newValue + targetLong);
                          }}
                          min="0"
                          max="30"
                          disabled={isGenerating}
                          className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">2 marks each</p>
                    </div>
                    <div>
                      <Label htmlFor="targetLong" className="text-sm">Long Answer Questions</Label>
                      <Input
                          id="targetLong"
                          type="number"
                          value={targetLong}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10) || 0;
                            setTargetLong(newValue);
                            setPoolSize(targetMcq + targetShort + newValue);
                          }}
                          min="0"
                          max="20"
                          disabled={isGenerating}
                          className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">5 marks each</p>
                    </div>
                  </div>
                </div>

                {/* Pool Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poolSize" className="text-sm font-medium">
                      Total Questions in Pool
                    </Label>
                    <Input
                        id="poolSize"
                        type="number"
                        value={poolSize}
                        onChange={(e) => setPoolSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        min="1"
                        max="100"
                        disabled={isGenerating}
                        className="mt-1 bg-gray-50"
                        readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-calculated from question types
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="questionsPerStudent" className="text-sm font-medium">
                      Questions per Student
                    </Label>
                    <Input
                        id="questionsPerStudent"
                        type="number"
                        value={questionsPerStudent}
                        onChange={(e) => setQuestionsPerStudent(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        min="1"
                        max={poolSize}
                        disabled={isGenerating}
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Each student gets a random subset
                    </p>
                  </div>
                </div>

                {/* Pool Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Pool Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Total Pool Size:</strong> {totalQuestions} questions</p>
                      <p className="text-gray-600 mt-1">
                        MCQ: {targetMcq} | Short: {targetShort} | Long: {targetLong}
                      </p>
                    </div>
                    <div>
                      <p><strong>Total Marks Range:</strong> {targetMcq * 1 + targetShort * 2 + targetLong * 5} marks</p>
                      <p className="text-gray-600 mt-1">
                        Per student: ~{Math.round((targetMcq * 1 + targetShort * 2 + targetLong * 5) * (questionsPerStudent / totalQuestions))} marks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <Info className="inline h-4 w-4 mr-1" />
                    Generating Question Pool can take up to 2 minutes.
                  </p>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!aiPrompt && !contextText && !contextFile) || totalQuestions === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                >
                  {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Question Pool...
                      </>
                  ) : (
                      `Generate Pool of ${totalQuestions} Questions with AI`
                  )}
                </Button>
              </div>
            </>
        )}

        {/* Show ManualQuizEditor when questions are generated - same pattern as AIFixedQuizGenerator */}
        {hasGeneratedQuestions && (
            <div className="mt-8">
              {/*<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">*/}
              {/*  <p className="text-green-800 font-medium">*/}
              {/*    ✅ Generated {quizData.questions.length} questions successfully!*/}
              {/*  </p>*/}
              {/*  <p className="text-green-600 text-sm mt-1">*/}
              {/*    Question pool created with {quizData.poolSize} total questions. Each student will receive {quizData.questionsPerStudent} randomly selected questions. You can edit the questions below.*/}
              {/*  </p>*/}
              {/*</div>*/}
              <ManualQuizEditor quizData={quizData} setQuizData={setQuizData} />
            </div>
        )}
      </div>
  );
};