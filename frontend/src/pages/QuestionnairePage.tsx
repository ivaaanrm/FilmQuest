import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import InlineError from '../components/InlineError'
import type { Question } from '../types'

interface QuestionnairePageProps {
  questions: Question[]
  currentIndex: number
  selectedAnswer?: string
  onSelectAnswer: (answer: string) => void
  onSubmit: () => void
  canSubmit: boolean
  recommendationError?: string | null
  onSignOut?: () => void
}

const QuestionnairePage = ({
  questions,
  currentIndex,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  canSubmit,
  recommendationError,
  onSignOut,
}: QuestionnairePageProps) => {
  const question = questions[currentIndex]

  if (!question) {
    return null
  }

  return (
    <div className="questionnaire">
      <header className="brand-header">
        <div className="brand-title-row">
          <div className="brand-title">FilmQuest</div>
          {onSignOut && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
        <p className="brand-sub">
          A cinematic mood quiz for the perfect watchlist.
        </p>
      </header>

      <div className="panel">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
        <QuestionCard
          question={question}
          selectedAnswer={selectedAnswer}
          onSelect={onSelectAnswer}
        />
        <div className="submit-row">
          <div className="submit-copy">
            <p>Answer all ten to unlock your lineup.</p>
            {recommendationError ? (
              <InlineError message={recommendationError} />
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            See my movies
          </button>
        </div>
      </div>
      <div className="footer-hint">
        Tip: Choose the option that matches your mood, not your habits.
      </div>
    </div>
  )
}

export default QuestionnairePage
