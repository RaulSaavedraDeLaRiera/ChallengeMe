import { Link } from 'react-router-dom'

//welcome page: simple lading page to redirect to login or register
const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">ChallengeMe</h1>
        <p className="welcome-subtitle">
          Join the most motivating fitness community. 
          Propose challenges, participate in challenges and share your progress 
          with other fitness enthusiasts.
        </p>
        <div className="welcome-buttons">
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Welcome

