import MovieCard from '../components/MovieCard'
import type { Movie } from '../types'

interface ResultsPageProps {
  movies: Movie[]
  onSelectMovie: (movie: Movie) => void
  onRestart: () => void
}

const ResultsPage = ({ movies, onSelectMovie, onRestart }: ResultsPageProps) => {
  return (
    <div className="results">
      <header className="brand-header">
        <div className="brand-title">FilmQuest</div>
        <p className="brand-sub">Your personalized double feature awaits.</p>
      </header>

      <div className="results-header">
        <div>
          <h2>Tonight’s Picks</h2>
          <p>Curated from your answers and a little cinematic intuition.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onRestart}>
          Play again
        </button>
      </div>

      {movies.length === 0 ? (
        <div className="empty-state">
          <h3>No matches this round</h3>
          <p>Try a different mood and we’ll reshuffle the deck.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={`${movie.title}-${movie.year ?? 'n/a'}`} movie={movie} onSelect={onSelectMovie} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ResultsPage
