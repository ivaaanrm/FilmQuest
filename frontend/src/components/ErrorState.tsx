interface ErrorStateProps {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}

const ErrorState = ({
  title,
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) => {
  return (
    <div className="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button type="button" className="btn btn-primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  )
}

export default ErrorState
