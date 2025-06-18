"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Info, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Fixed Mock API with correct field structure matching Prisma schema
const generatePoolQuizAPI = async (quizId, data) => {
  console.log("Generating pool AI quiz:", quizId, data);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const questions = Array.from({ length: data.poolSize }, (_, i) => ({
    id: `ai-pool-q${i + 1}`,
    type: i % 3 === 0 ? "mcq" : (i % 3 === 1 ? "short_answer" : "mcq"),
    text: `AI Pool Question ${i + 1}: What is concept ${i + 1} in the provided context?`, // Fixed: using 'text' instead of 'prompt'
    options: i % 3 === 0 ? [
      { label: `Concept ${i + 1} definition A`, isCorrect: true },
      { label: `Concept ${i + 1} definition B`, isCorrect: false },
      { label: `Concept ${i + 1} definition C`, isCorrect: false },
      { label: `None of the above`, isCorrect: false }
    ] : undefined, // Only MCQ questions have options
    correctAnswer: i % 3 === 0 ? "A" : `Answer for concept ${i + 1}`,
    explanation: `Explanation for pool question ${i + 1}`,
    isFromPool: true,
    mark: 1,
    order: i
  }));

  return {
    poolSize: data.poolSize,
    questionsPerStudent: data.questionsPerStudent,
    questions
  };
};

export const AIPoolQuizGenerator = ({ quizData, setQuizData }) => {
  const [aiPrompt, setAiPrompt] = useState(quizData.aiPrompt || "");
  const [contextText, setContextText] = useState("");
  const [contextFile, setContextFile] = useState(null);
  const [poolSize, setPoolSize] = useState(quizData.poolSize || 20);
  const [questionsPerStudent, setQuestionsPerStudent] = useState(quizData.questionsPerStudent || 5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPoolPreview, setShowPoolPreview] = useState(false);

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
    
    if (poolSize < questionsPerStudent) {
      toast.error("Total questions in pool must be greater than or equal to questions per student.");
      return;
    }

    if (poolSize < 1 || questionsPerStudent < 1) {
      toast.error("Pool size and questions per student must be at least 1.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generatePoolQuizAPI(quizData.id, {
        aiPrompt, 
        contextText, 
        contextFile, 
        poolSize, 
        questionsPerStudent
      });

      // Update quiz data with correct field structure
      setQuizData(prev => ({
        ...prev,
        questions: result.questions,
        poolSize: result.poolSize,
        questionsPerStudent: result.questionsPerStudent,
        aiPrompt: aiPrompt,
        generationType: 'ai_pool', // Ensure correct generation type
        status: prev.status || 'draft' // Maintain existing status or default to draft
      }));
      
      toast.success(`Question pool of ${result.poolSize} questions generated successfully!`);
      setShowPoolPreview(true); // Auto-show preview after generation
    } catch (error) {
      toast.error("AI pool generation failed. " + (error.response?.data?.message || error.message));
      console.error("Pool generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice";
      case "short_answer":
        return "Short Answer";
      case "long_answer":
        return "Long Answer";
      default:
        return "Question";
    }
  };

  const getQuestionTypeCounts = () => {
    if (!quizData.questions || quizData.questions.length === 0) return {};
    
    return quizData.questions.reduce((counts, question) => {
      counts[question.type] = (counts[question.type] || 0) + 1;
      return counts;
    }, {});
  };

  const questionTypeCounts = getQuestionTypeCounts();
  const hasGeneratedQuestions = quizData.questions && quizData.questions.length > 0 && quizData.generationType === 'ai_pool';

  return (
    <div className="mt-6 border rounded-lg p-6 space-y-6 ">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI-Generated Quiz Pool</h3>
        <div className="text-sm text-gray-600  px-3 py-1 rounded-full border">
          Pool: {poolSize} → {questionsPerStudent} per student
        </div>
      </div>

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
          <div className="text-sm text-gray-500  px-4 py-1 rounded-full border">
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
              ✓ Selected: {contextFile.name}
            </p>
          )}
        </div>

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
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Larger pools provide more variety for students
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

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || (!aiPrompt && !contextText && !contextFile)} 
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Question Pool...
            </>
          ) : (
            "Generate Question Pool with AI"
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {hasGeneratedQuestions && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Question pool generated!</strong> Created {quizData.poolSize} questions. 
            Each student will receive {quizData.questionsPerStudent} randomly selected questions.
            {Object.keys(questionTypeCounts).length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Question Types:</strong>{' '}
                {Object.entries(questionTypeCounts).map(([type, count]) => 
                  `${getQuestionTypeLabel(type)}: ${count}`
                ).join(', ')}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Pool Preview */}
      {hasGeneratedQuestions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">Question Pool Preview</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPoolPreview(!showPoolPreview)}
              className="flex items-center gap-2"
            >
              {showPoolPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          </div>

          {showPoolPreview && (
            <div className="bg-white rounded-lg border p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {quizData.questions.slice(0, 10).map((question, index) => (
                  <div key={question.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Question {index + 1} • {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {question.mark} mark{question.mark !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{question.text}</p>
                    {question.options && (
                      <div className="ml-4 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-xs">
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              option.isCorrect ? 'bg-green-100 border-green-400 text-green-600' : 'border-gray-300'
                            }`}>
                              {option.isCorrect ? '✓' : String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}>
                              {option.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.explanation && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Explanation: {question.explanation}
                      </p>
                    )}
                  </div>
                ))}
                {quizData.questions.length > 10 && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    ... and {quizData.questions.length - 10} more questions in the pool
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};