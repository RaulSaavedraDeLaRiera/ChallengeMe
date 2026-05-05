//reusable HTTP service with automatic token injection and refresh
import { authStore } from '../utils/authStore'

const parse = async (res) => {
  //no content status = 204
  if (res.status === 204) return null

  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

//global reference to auth context (set by App.jsx)
let authContextRef = null

export const setAuthContextRef = (ref) => {
  authContextRef = ref
}

//attempt to refresh the current token
const attemptTokenRefresh = async () => {
  try {
    const { AuthService } = await import('./auth.service')

    const response = await AuthService.refresh()

    if (response?.token) {
      authStore.set(response.token)
      if (response.user) {
        try {
          localStorage.setItem('user', JSON.stringify(response.user))
        } catch {
          //ignore storage errors
        }
      }
      return response.token
    }

    return null
  } catch {
    return null
  }
}

//handle token expiration: try refresh, then expire session if it fails
const handleTokenExpiration = async () => {
  const newToken = await attemptTokenRefresh()

  if (newToken) {
    if (authContextRef?.refreshToken) {
      authContextRef.refreshToken(newToken)
    }
    return newToken
  } else {
    authStore.clear()
    if (authContextRef?.expireToken) {
      authContextRef.expireToken()
    }
    return null
  }
}

//reusable API request — token is obtained internally from authStore
export const http = async (path, { method = 'GET', body, headers, retryOn401 = true } = {}) => {
  const token = authStore.get()
  const apiUrl = import.meta.env.VITE_API_URL || ''

  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await parse(res)

  if (!res.ok) {
    //if token expired (401), try to refresh and retry once
    if (res.status === 401 && token && retryOn401) {
      const newToken = await handleTokenExpiration()

      if (newToken) {
        return http(path, { method, body, headers, retryOn401: false })
      }
    }

    const message = (data && (data.err || data.message)) || `Error ${res.status}`
    throw new Error(message)
  }

  return data
}
