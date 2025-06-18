// ./_components/ai-pool-quiz-generator.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
// import axios from "axios";
import { Loader2, Info } from "lucide-react";
import AlertBanner from "@/components/alert-banner";

// Mock API
const generatePoolQuizAPI = async (quizId, data) => {
  console.log("Generating pool AI quiz:", quizId, data);
  // const response = await axios.post(`/api/quiz-sets/${quizId}/generate-pool`, data);
  // return response.data; // Assuming API returns { poolSize, questionsPerStudent, questions: [...] }
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
  return {
    poolSize: data.poolSize,
    questionsPerStudent: data.questionsPerStudent,
    questions: Array.from({ length: data.poolSize }, (_, i) => ({
      id: `ai-pool-q${i+1}`,
      type: "mcq",
      prompt: `AI Pool Question ${i+1}: What is a variable?`,
      options: [{label: "A container", isCorrect: true}, {label: "A function", isCorrect: false}],
      explanation: "It stores data.",
      isFromPool: true,
      mark:1, order:i
    }))
  };
}


export const AIPoolQuizGenerator = ({ quizData, setQuizData }) => {
  const [aiPrompt, setAiPrompt] = useState(quizData.aiPrompt || "");
  const [contextText, setContextText] = useState("");
  const [contextFile, setContextFile] = useState(null);
  const [poolSize, setPoolSize] = useState(quizData.poolSize || 20);
  const [questionsPerStudent, setQuestionsPerStudent] = useState(quizData.questionsPerStudent || 5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (event) => {
    setContextFile(event.target.files[0]);
  };

  const handleGenerate = async () => {
     if (!aiPrompt && !contextText && !contextFile) {
      toast.error("Please provide a prompt or context data.");
      return;
    }
    if (poolSize < questionsPerStudent) {
      toast.error("Total questions in pool must be greater than or equal to questions per student.");
      return;
    }
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("quizId", quizData.id);
      formData.append("aiPrompt", aiPrompt);
      formData.append("poolSize", poolSize);
      formData.append("questionsPerStudent", questionsPerStudent);

      if (contextFile) {
        formData.append("contextFile", contextFile);
      } else if (contextText) {
        formData.append("contextText", contextText);
      }

      // const result = await axios.post(`/api/quiz-sets/${quizData.id}/generate-pool`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const result = await generatePoolQuizAPI(quizData.id, {
        aiPrompt, contextText, contextFile, poolSize, questionsPerStudent
      });

      setQuizData(prev => ({
        ...prev,
        questions: result.questions, // Store all generated pool questions
        poolSize: result.poolSize,
        questionsPerStudent: result.questionsPerStudent,
        source: 'ai_instructor_generated' // Or a specific pool source
      }));
      toast.success(`Question pool of ${result.poolSize} questions generated!`);
    } catch (error) {
      toast.error("AI pool generation failed. " + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-6 border  rounded-md p-4 space-y-6">
      <div>
        <Label htmlFor="aiPoolPrompt">Custom Prompt (Optional)</Label>
        <Textarea
          id="aiPoolPrompt"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., Generate a diverse set of questions about..."
          rows={3}
          disabled={isGenerating}
        />
      </div>
      <div>
        <Label htmlFor="poolContextText">Context Data (Paste Text)</Label>
        <Textarea
          id="poolContextText"
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          placeholder="Paste your document text here..."
          rows={8}
          disabled={isGenerating || !!contextFile}
        />
      </div>
      <div className="text-sm text-center my-2">OR</div>
      <div>
        <Label htmlFor="poolContextFile">Context Data (Upload PDF, DOCX, TXT)</Label>
        <Input
          id="poolContextFile"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={isGenerating || !!contextText}
        />
        {contextFile && <p className="text-xs mt-1">Selected: {contextFile.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="poolSize">Total Questions to Generate for Pool</Label>
          <Input
            id="poolSize"
            type="number"
            value={poolSize}
            onChange={(e) => setPoolSize(parseInt(e.target.value, 10))}
            min="1"
            disabled={isGenerating}
          />
        </div>
        <div>
          <Label htmlFor="questionsPerStudent">Questions Each Student Receives</Label>
          <Input
            id="questionsPerStudent"
            type="number"
            value={questionsPerStudent}
            onChange={(e) => setQuestionsPerStudent(parseInt(e.target.value, 10))}
            min="1"
            disabled={isGenerating}
          />
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Question Pool with AI"}
      </Button>

      {quizData.poolSize > 0 && quizData.generationType === 'ai_pool' && (
         <AlertBanner
            variant="success"
            label={`Question pool generated with ${quizData.poolSize} questions. Each student will receive ${quizData.questionsPerStudent} questions.`}
            icon={<Info className="h-4 w-4" />}
        />
      )}
       {/* Optionally, display a sample or list of generated pool questions (read-only or limited edit) */}
       {quizData.generationType === 'ai_pool' && quizData.questions && quizData.questions.length > 0 && (
        <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Sample Pool Questions (First 5):</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
                {quizData.questions.slice(0,5).map(q => <li key={q.id}>{q.prompt}</li>)}
            </ul>
            {quizData.questions.length > 5 && <p className="text-xs mt-1">...and {quizData.questions.length - 5} more.</p>}
        </div>
       )}
    </div>
  );
};