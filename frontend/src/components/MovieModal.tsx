import { useEffect } from 'react'
import type { Movie } from '../types'

interface MovieModalProps {
  movie: Movie
  onClose: () => void
}

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${movie.title} details`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-poster">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={`${movie.title} poster`} />
          ) : (
            <div className="poster-placeholder">No poster</div>
          )}
        </div>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2>{movie.title}</h2>
              <p className="modal-sub">
                {movie.year ? `${movie.year}` : 'Year n/a'}
                {movie.release_date ? ` • ${movie.release_date}` : ''}
              </p>
            </div>
            <button type="button" className="icon-button" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="modal-rating">
            <span>Rating</span>
            <strong>{movie.rating ? movie.rating.toFixed(1) : 'n/a'}</strong>
          </div>
          <p className="modal-overview">
            {movie.overview || 'No synopsis available yet.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MovieModal
