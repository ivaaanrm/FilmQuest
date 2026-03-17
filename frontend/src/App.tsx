import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import AuthPage from './components/AuthPage'
import ErrorState from './components/ErrorState'
import LoadingScreen from './components/LoadingScreen'
import MovieModal from './components/MovieModal'
import QuestionnaireSkeleton from './components/QuestionnaireSkeleton'
import { useAuth } from './context/AuthContext'
import { fetchQuestions, fetchRecommendations } from './lib/api'
import QuestionnairePage from './pages/QuestionnairePage'
import ResultsPage from './pages/ResultsPage'
import type { Answer, Movie, Question } from './types'

type Status = 'loading' | 'questionnaire' | 'submitting' | 'results' | 'error'

type AnswerEntry = Answer | null

function App() {
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerEntry[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  )
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null)

  const loadQuestions = useCallback(async () => {
    setStatus('loading')
    setQuestionError(null)
    setRecommendationError(null)
    setActiveMovie(null)

    try {
      const response = await fetchQuestions()
      setQuestions(response)
      setAnswers([])
      setMovies([])
      setCurrentIndex(0)
      setStatus('questionnaire')
    } catch {
      setQuestionError('The projector stalled. Let’s try that again.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions()
    }
  }, [isAuthenticated, loadQuestions])

  const completedAnswers = useMemo(
    () => answers.filter((answer): answer is Answer => Boolean(answer)),
    [answers],
  )

  const canSubmit =
    questions.length > 0 && completedAnswers.length === questions.length

  const selectedAnswer = answers[currentIndex]?.answer

  const handleSelectAnswer = (answer: string) => {
    const question = questions[currentIndex]
    if (!question) return

    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = { question: question.text, answer }
      return next
    })

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setRecommendationError(null)
    setStatus('submitting')

    try {
      const response = await fetchRecommendations(completedAnswers)
      setMovies(response)
      setStatus('results')
    } catch {
      setRecommendationError(
        'The recommendation engine dimmed. Tap to try again.',
      )
      setStatus('questionnaire')
    }
  }

  const handleRestart = () => {
    loadQuestions()
  }

  if (authLoading) {
    return (
      <div className="app-shell">
        <QuestionnaireSkeleton />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <AuthPage />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {status === 'loading' && <QuestionnaireSkeleton />}
      {status === 'error' && (
        <ErrorState
          title="We hit a snag"
          message={questionError ?? 'We could not load your questions.'}
          actionLabel="Try again"
          onAction={loadQuestions}
        />
      )}
      {status === 'questionnaire' && (
        <QuestionnairePage
          questions={questions}
          currentIndex={currentIndex}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSelectAnswer}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          recommendationError={recommendationError}
          onSignOut={signOut}
        />
      )}
      {status === 'results' && (
        <ResultsPage
          movies={movies}
          onSelectMovie={setActiveMovie}
          onRestart={handleRestart}
        />
      )}
      {status === 'submitting' && <LoadingScreen />}
      {activeMovie ? (
        <MovieModal movie={activeMovie} onClose={() => setActiveMovie(null)} />
      ) : null}
    </div>
  )
}

export default App
