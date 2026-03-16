const QuestionnaireSkeleton = () => {
  return (
    <div className="questionnaire">
      <header className="brand-header">
        <div className="brand-title">PlotTwist</div>
        <p className="brand-sub">Warming up the projector...</p>
      </header>
      <div className="panel">
        <div className="progress">
          <div className="progress-label">
            <span className="skeleton shimmer short" />
            <span className="skeleton shimmer short" />
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '20%' }} />
          </div>
        </div>
        <div className="question-card">
          <div className="skeleton shimmer title" />
          <div className="options-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton shimmer option" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionnaireSkeleton
