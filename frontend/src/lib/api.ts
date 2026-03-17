import type { Answer, Movie, Question } from '../types'
import { getIdToken } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const joinUrl = (base: string, path: string) => {
  if (!base) return path
  return `${base.replace(/\/$/, '')}${path}`
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken()
  if (!token) return {}
  return { Authorization: token }
}

export const fetchQuestions = async (): Promise<Question[]> => {
  const authHeaders = await getAuthHeaders()
  const response = await fetch(joinUrl(API_BASE, '/questions'), {
    headers: { ...authHeaders },
  })
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
  const authHeaders = await getAuthHeaders()
  const response = await fetch(joinUrl(API_BASE, '/recommendations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
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
