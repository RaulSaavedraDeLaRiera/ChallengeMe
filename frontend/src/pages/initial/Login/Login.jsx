import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import { AuthService } from '../../../services/auth.service'
import { authStore } from '../../../utils/authStore'
import { storage } from '../../../utils/storage'
import { Container, Card, Input, Button } from '../../../components/shared'
import styles from './Login.module.css'

//login page: user authentication, validates credentials and stores the token in localStorage
export const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  //handle input changes
  const onChange = (e) => setForm((prev) => ({...prev, [e.target.name]: e.target.value}))

  //handle form submission
  const onSubmit = async (e) => {
    e.preventDefault() //prevent page reload
    setError(null) //clear error messages

    setLoading(true) //start api call

    try {
      //call login api
      const data = await AuthService.login({ 
        email: form.email.trim().toLowerCase(), 
        password: form.password 
      })
      //check if token exists
      const token = data.token ?? data?.data?.token;
      //check if user exists
      const user = data.user ?? data?.data?.user ?? data?.data;
      if(!token) throw new Error('Backend did not return token')
      //save in storage
      authStore.set(token)
      storage.set('user', user ?? null)
      //redirect to dashboard after login if exists
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error logging in')
    } finally {
      setLoading(false) 
    }
  }

  return (
    <Container>
      <div className={styles.loginWrapper}>
        <Card className={styles.card}>
          <div className={styles.loginHeader}>
            <div className={styles.iconContainer}>
              <FaSignInAlt />
            </div>
            <h1 className={styles.loginTitle}>Welcome Back!</h1>
            <p className={styles.loginSubtitle}>
              Make the difference.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            <div className={styles.inputWithIcon}>
              <FaEnvelope className={styles.icon} />
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className={styles.inputWithIcon}>
              <FaLock className={styles.icon} />
              <Input
                id="password"
                name="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className={styles.loginLink}>
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Container>
  )
}

