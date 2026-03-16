export type Question = {
  id: number
  text: string
  options: string[]
}

export type Answer = {
  question: string
  answer: string
}

export type Movie = {
  title: string
  year?: number
  overview?: string
  poster_url?: string
  rating?: number
  release_date?: string
}
