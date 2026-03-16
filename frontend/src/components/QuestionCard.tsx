import type { Question } from '../types'

interface QuestionCardProps {
  question: Question
  selectedAnswer?: string
  onSelect: (answer: string) => void
}

const QuestionCard = ({
  question,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) => {
  return (
    <div className="question-card">
      <h2 className="question-title">{question.text}</h2>
      <div className="options-grid">
        {question.options.map((option) => {
          const isSelected = option === selectedAnswer
          return (
            <button
              key={option}
              type="button"
              className={`option-button${isSelected ? ' selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionCard
