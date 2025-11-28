import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/initial/Welcome'
import MoveMore from './pages/initial/MoveMore'
import CommunityShowcase from './pages/initial/CommunityShowcase'
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
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'
import { setAuthContextRef } from './services/http'

//guard for protected routes: redirects to /login when no token or token expired
const RequireAuth = () => {
  const { token, isExpired } = useAuth()

  //redirect to login if no token or token expired
  if (!token || isExpired) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

//inner app component that uses auth context
const AppContent = () => {
  const auth = useAuth()

  //register auth context methods with http service (only refreshToken and expireToken)
  useEffect(() => {
    setAuthContextRef({
      refreshToken: auth.refreshToken,
      expireToken: auth.expireToken
    })
  }, [auth.refreshToken, auth.expireToken])

  return (
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
      <Route path="/move-more" element={<MoveMore />} />
      <Route path="/community" element={<CommunityShowcase />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
