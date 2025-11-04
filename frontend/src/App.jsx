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

//guard for protected routes: redirects to /login when no token
const RequireAuth = () => {
  const token = authStore.get()
  if (!token) return <Navigate to="/login" replace />
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
