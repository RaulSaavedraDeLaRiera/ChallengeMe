import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authStore } from '../utils/authStore'

//create auth context for token management and navigation
const AuthContext = createContext(null)

//auth provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setTokenState] = useState(authStore.get())
  const [isExpired, setIsExpired] = useState(false)

  //function to update token state and storage
  const setToken = useCallback((newToken) => {
    if (newToken) {
      authStore.set(newToken)
      setTokenState(newToken)
      setIsExpired(false)
    } else {
      authStore.clear()
      setTokenState(null)
      setIsExpired(true)
    }
  }, [])

  //refresh token handler
  const handleTokenRefreshed = useCallback((newToken) => {
    //ensure token is saved in store, second check
    if (authStore.get() !== newToken) {
      authStore.set(newToken)
    }
    setTokenState(newToken)
    setIsExpired(false)
  }, [])

  //token expiration handler
  const handleTokenExpired = useCallback(() => {
    authStore.clear()
    setTokenState(null)
    setIsExpired(true)
    //navigate using react-router-dom instead of BOM
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [navigate, location.pathname])

  //expose methods for http service to call
  const refreshToken = useCallback((newToken) => {
    handleTokenRefreshed(newToken)
  }, [handleTokenRefreshed])

  const expireToken = useCallback(() => {
    handleTokenExpired()
  }, [handleTokenExpired])

  //check token on mount and periodically 
  useEffect(() => {
    //initial sync on mount, if token is out
    const currentToken = authStore.get()
    if (currentToken !== token) {
      if (currentToken) {
        setTokenState(currentToken)
        setIsExpired(false)
      } else if (token) {
        //token was removed externally
        setTokenState(null)
        setIsExpired(true)
      }
    }

    //periodic check every 30 seconds
    const checkToken = () => {
      const storeToken = authStore.get()
      //only update if token was removed external
      if (!storeToken && token) {
        setIsExpired(true)
        setTokenState(null)
      } else if (storeToken && !token) {
        //token was added externally, sync it
        setTokenState(storeToken)
        setIsExpired(false)
      }
    }

    const interval = setInterval(checkToken, 30000)

    return () => clearInterval(interval)
  }, [token])

  const value = {
    token,
    isExpired,
    refreshToken,
    expireToken,
    setToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

//hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

