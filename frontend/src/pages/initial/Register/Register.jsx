import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaRunning, FaFlagCheckered } from 'react-icons/fa'
import { Container } from '../../../components/shared'
import styles from './Register.module.css'

//register page: new user registration with slider effect and validation
const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  //handle input changes and clear errors
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  //calculate progress based on filled 
  const calculateProgress = () => {
    let filled = 0
    if (formData.name) filled++
    if (formData.email) filled++
    if (formData.password) filled++
    if (formData.confirmPassword) filled++
    return filled * 25 //each field is 25%
  }

  //handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    //validate passwords match and length
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      //call register to api
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        //save token in storage
        localStorage.setItem('token', data.token) 
        //redirect to dashboard after registration
        navigate('/dashboard')
      } else {
        setError(data.message || 'Error creating account')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <div className={styles.progressTrack}>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressLine} style={{ width: `${calculateProgress()}%` }}></div>
                <FaRunning 
                  className={styles.iconRunning} 
                  style={{ left: `${Math.min(calculateProgress() - 2)}%` }}
                />
                <FaFlagCheckered className={styles.iconFinish} style={{ right: '0%' }} />
              </div>
            </div>
            <h1 className={styles.registerTitle}>Create Account</h1>
            <p className={styles.registerSubtitle}>
              Join the ChallengeMe community
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Minimum 6 characters"
                required
              /> 
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Repeat your password"
                required
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className={styles.registerFooter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" className={styles.registerLink}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Register

