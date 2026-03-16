interface ProgressBarProps {
  current: number
  total: number
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const safeTotal = Math.max(total, 1)
  const progress = Math.min(100, Math.round((current / safeTotal) * 100))

  return (
    <div className="progress">
      <div className="progress-label" aria-live="polite">
        <span>Question {current}</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
