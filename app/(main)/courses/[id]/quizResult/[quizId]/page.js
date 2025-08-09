import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuizResultsOverview } from './_components/quiz-results-overview'
import { QuestionResultsList } from './_components/quiz-results-list'
import { QuizResultsHeader } from './_components/quiz-results-header'
import {getQuizSubmissionDetails} from "@/app/actions/quiz";




function formatTimeSpent(timeInSeconds) {
  if (timeInSeconds < 60) {
    return `${timeInSeconds} seconds`
  }

  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60

  if (seconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
}

export async function generateMetadata({ params }) {
  try {
    const submissionData = await getQuizSubmissionDetails(params.submissionId)
    const { submission, answers } = submissionData.data
    const percentage = Math.round((submission.score / answers.length) * 100)

    return {
      title: `Quiz Results - ${submission.score}/${answers.length} (${percentage}%)`,
      description: `Quiz attempt ${submission.attemptNumber} completed with ${submission.score} out of ${answers.length} questions correct.`,
    }
  } catch {
    return {
      title: 'Quiz Results',
      description: 'View your quiz results and performance details.',
    }
  }
}

export default async function QuizResultsPage({ params }) {
  let submissionData

  try {

    submissionData = await getQuizSubmissionDetails({userId:"6842e2f52433a7219fcb76e1",courseId:"686bd330132d72f488155d02", quizId:"686be8d4981bb26d863af82a"});
  } catch (error) {
    console.error('Failed to load quiz results:', error)
    notFound()
  }

  const { submission, answers } = submissionData.data

  // Validate that we have the required data
  if (!submission || !answers || answers.length === 0) {
    notFound()
  }

  // Sort answers by question order to maintain consistency
  const sortedAnswers = answers.sort((a, b) => a.question.order - b.question.order)

  const formattedTimeSpent = formatTimeSpent(submission.timeSpent)
  const totalQuestions = sortedAnswers.length

  return (
      <div className="min-h-screen bg-background">
        {/* Results Header with Score Display */}
       <div className="flex gap-4 flex-col md:flex-row justify-center mx-auto mt-2 md:mt-10">
         <QuizResultsHeader
             score={submission.score}
             totalQuestions={totalQuestions}
             timeSpent={formattedTimeSpent}
             attemptNumber={submission.attemptNumber}
         />
         <QuizResultsOverview answers={sortedAnswers} />

       </div>
        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Performance Overview Section */}


          {/* Detailed Question Results */}
          <QuestionResultsList answers={sortedAnswers} />

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 pt-8 border-t border-border">
            <Button asChild variant="default" size="lg">
              <Link href={`/course/${params.courseId}`}>
                Return to Course
              </Link>
            </Button>


          </div>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-card rounded-lg border border-border">
            <h3 className="font-poppins font-bold text-sm text-foreground mb-2">
              Submission Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Started:</span>
                <div>{new Date(submission.startTime).toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Completed:</span>
                <div>{new Date(submission.endTime).toLocaleString()}</div>
              </div>
              <div>
                <span className="font-medium">Submission:</span>
                <div className="capitalize">{submission.submissionReason.replace('_', ' ')}</div>
              </div>
              <div>
                <span className="font-medium">Warnings:</span>
                <div>{submission.warningCount} violation{submission.warningCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}