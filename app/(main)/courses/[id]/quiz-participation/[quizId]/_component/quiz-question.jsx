"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"


export default function QuizQuestion({ question, answer, onAnswerChange }) {
    const renderMCQQuestion = () => (
        <div className="space-y-4">
            <RadioGroup value={(answer) || ""} onValueChange={onAnswerChange} className="space-y-3">
                {question.options.map((option, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <RadioGroupItem value={option.label} id={`option-${index}`} />
                        <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer text-sm leading-relaxed text-card-foreground"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )

    const renderShortAnswerQuestion = () => (
        <div className="space-y-4">
            <Textarea
                placeholder="Enter your answer here..."
                value={(answer) || ""}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="min-h-[100px] resize-none bg-input border-border text-foreground"
                maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{((answer) || "").length}/500 characters</div>
        </div>
    )

    const renderLongAnswerQuestion = () => (
        <div className="space-y-4">
            <Textarea
                placeholder="Enter your detailed answer here..."
                value={(answer) || ""}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="min-h-[200px] resize-none bg-input border-border text-foreground"
                maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
                {((answer) || "").length}/2000 characters
            </div>
        </div>
    )

    const getQuestionTypeLabel = (type) => {
        switch (type) {
            case "mcq":
                return "Multiple Choice"
            case "short_answer":
                return "Short Answer"
            case "long_answer":
                return "Long Answer"
            default:
                return "Question"
        }
    }

    const getQuestionTypeColor = (type) => {
        switch (type) {
            case "mcq":
                return "default"
            case "short_answer":
                return "secondary"
            case "long_answer":
                return "outline"
            default:
                return "default"
        }
    }

    return (
        <Card className="border-2 bg-card border-border">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-relaxed flex-1 font-poppins font-bold text-card-foreground">
                        {question.text}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getQuestionTypeColor(question.type)}>{getQuestionTypeLabel(question.type)}</Badge>
                        <Badge variant="outline" className="border-border text-card-foreground">
                            {question.mark} {question.mark === 1 ? "mark" : "marks"}
                        </Badge>
                    </div>
                </div>

                {question.image && (
                    <div className="mt-4">
                        <img
                            src={question.image || "/placeholder.svg"}
                            alt="Question image"
                            className="max-w-full h-auto rounded-lg border border-border"
                        />
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {question.type === "mcq" && renderMCQQuestion()}
                {question.type === "short_answer" && renderShortAnswerQuestion()}
                {question.type === "long_answer" && renderLongAnswerQuestion()}

                {question.explanation && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="font-poppins font-bold text-sm mb-2 text-card-foreground">Note:</h4>
                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
