const LoadingScreen = () => {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-orb" aria-hidden="true" />
      <div className="loading-text">
        <p>Scanning your cinematic aura...</p>
        <span>Summoning the perfect lineup.</span>
      </div>
    </div>
  )
}

export default LoadingScreen
