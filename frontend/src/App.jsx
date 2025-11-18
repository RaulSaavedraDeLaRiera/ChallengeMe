import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/initial/Welcome'
import { Login } from './pages/initial/Login/Login'
import Register from './pages/initial/Register/Register'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import Discover from './pages/discover/Discover'
import ProfileContacts from './pages/profile/contacts/Contacts'
import ProfileFollowers from './pages/profile/followers/Followers'
import ProfileContent from './pages/profile/content/Content'
import ProfileMetrics from './pages/profile/metrics/Metrics'
import UserView from './pages/user/UserView'
import './App.css'
import { Navigate, Outlet } from 'react-router-dom'
import { authStore } from './utils/authStore'
import { useEffect, useState } from 'react'

//guard for protected routes: redirects to /login when no token or token expired
const RequireAuth = () => {
  const [token, setToken] = useState(authStore.get())
  const [isExpired, setIsExpired] = useState(false)

  //listen for token expiration and refresh events
  useEffect(() => {
    const handleTokenExpired = () => {
      setIsExpired(true)
      setToken(null)
    }

    const handleTokenRefreshed = () => {
      //token was refreshed, update state
      const currentToken = authStore.get()
      setToken(currentToken)
      setIsExpired(false)
    }

    window.addEventListener('token-expired', handleTokenExpired)
    window.addEventListener('token-refreshed', handleTokenRefreshed)
    
    //also check token on mount and periodically
    const checkToken = () => {
      const currentToken = authStore.get()
      if (!currentToken && token) {
        setIsExpired(true)
      }
      setToken(currentToken)
    }

    //check immediately
    checkToken()
    
    //check periodically, like 30 seconds
    const interval = setInterval(checkToken, 30000)

    return () => {
      window.removeEventListener('token-expired', handleTokenExpired)
      window.removeEventListener('token-refreshed', handleTokenRefreshed)
      clearInterval(interval)
    }
  }, [token])

  //redirect to login if no token or token expired
  if (!token || isExpired) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<RequireAuth />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="discover" element={<Discover />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/contacts" element={<ProfileContacts />} />
              <Route path="profile/followers" element={<ProfileFollowers />} />
              <Route path="profile/content" element={<ProfileContent />} />
              <Route path="profile/metrics" element={<ProfileMetrics />} />
              <Route path="user/:userId" element={<UserView />} />
            </Route>
          </Route>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
