interface InlineErrorProps {
  message: string
}

const InlineError = ({ message }: InlineErrorProps) => {
  return <div className="inline-error">{message}</div>
}

export default InlineError
