import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
  onSelect: (movie: Movie) => void
}

const MovieCard = ({ movie, onSelect }: MovieCardProps) => {
  return (
    <button
      type="button"
      className="movie-card"
      onClick={() => onSelect(movie)}
      aria-label={`Open details for ${movie.title}`}
    >
      <div className="poster-frame">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">No poster</div>
        )}
      </div>
      <div className="movie-meta">
        <h3>{movie.title}</h3>
        <div className="movie-sub">
          {movie.year ? <span>{movie.year}</span> : <span>Year n/a</span>}
          {movie.rating ? (
            <span className="rating">★ {movie.rating.toFixed(1)}</span>
          ) : (
            <span className="rating">★ n/a</span>
          )}
        </div>
      </div>
    </button>
  )
}

export default MovieCard
