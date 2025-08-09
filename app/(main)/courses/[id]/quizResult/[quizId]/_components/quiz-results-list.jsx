import { QuestionResult } from "./question-result";

export function QuestionResultsList({ answers }) {
  return (
    <section className="space-y-6">
      <h2 className="font-poppins font-bold text-xl text-foreground">
        Detailed Results
      </h2>
      
      <div className="space-y-4">
        {answers.map((answer, index) => (
          <QuestionResult 
            key={answer.id}
            answer={answer}
            questionNumber={index + 1}
          />
        ))}
      </div>
    </section>
  )
}