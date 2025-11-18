//reusable http service to parse Api responses
const parse = async (res) => {
  //no content status = 204
  if(res.status === 204) return null;
  
  const text = await res.text()
  //empty response if not text
  if(!text) return null;

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

//attempt to refresh token when expired
const attemptTokenRefresh = async (expiredToken) => {
  try {
    const { AuthService } = await import('./auth.service')
    const { authStore } = await import('../utils/authStore')
    
    //try to refresh the token
    const response = await AuthService.refresh(expiredToken)
    
    //if refresh successful, save new token
    if (response && response.token) {
      authStore.set(response.token)
      //update user data if provided
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
    //refresh failed
    return null
  }
}

//handle token expiration - try refresh first, then redirect to login
const handleTokenExpiration = async (expiredToken) => {
  const { authStore } = await import('../utils/authStore')
  
  //try to refresh token first
  const newToken = await attemptTokenRefresh(expiredToken)
  
  if (newToken) {
    //token refreshed successfully, notify components
    window.dispatchEvent(new CustomEvent('token-refreshed', { detail: { token: newToken } }))
    return newToken
  } else {
    //refresh failed, clear token and redirect to login
    authStore.clear()
    window.dispatchEvent(new CustomEvent('token-expired'))
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return null
  }
}

//reusable Api request service
export const http = async (path, { method='GET', body, token, headers, retryOn401 = true }) => {
  //configure the request
  const apiUrl = import.meta.env.VITE_API_URL || ''
  const res = await fetch(`${apiUrl}${path}`,{
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  //handle response data
  const data = await parse(res)
  if(!res.ok) {
    //if token expired (401), try to refresh it
    if(res.status === 401 && token && retryOn401) {
      const newToken = await handleTokenExpiration(token)
      
      //if token was refreshed, retry the original request
      if (newToken) {
        return http(path, { method, body, token: newToken, headers, retryOn401: false })
      }
    }
    
    const message = (data && (data.err || data.message) || `Error ${res.status}`)
    throw new Error(message);
  }

  //return parsed 
  return data
}
