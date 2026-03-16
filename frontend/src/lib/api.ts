import type { Answer, Movie, Question } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const joinUrl = (base: string, path: string) => {
  if (!base) return path
  return `${base.replace(/\/$/, '')}${path}`
}

export const fetchQuestions = async (): Promise<Question[]> => {
  const response = await fetch(joinUrl(API_BASE, '/questions'))
  if (!response.ok) {
    throw new Error('Failed to load questions')
  }
  const data = (await response.json()) as { questions?: Question[] }
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid questions payload')
  }
  return data.questions
}

export const fetchRecommendations = async (
  answers: Answer[],
): Promise<Movie[]> => {
  const response = await fetch(joinUrl(API_BASE, '/recommendations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  })

  if (!response.ok) {
    throw new Error('Failed to load recommendations')
  }

  const data = (await response.json()) as { movies?: Movie[] }
  if (!data.movies || !Array.isArray(data.movies)) {
    throw new Error('Invalid recommendations payload')
  }
  return data.movies
}
