//authentication service: register and login
import { http } from './http'

export const AuthService = {
  register: (payload) => http('/api/auth/register', {
    method: 'POST',
    body: payload
  }),

  login: (payload) => http('/api/auth/login', {
    method: 'POST',
    body: payload
  }),

  profile: () => http('/api/users/me', { method: 'GET' }),

  getUserById: (userId) => http(`/api/users/${userId}`, { method: 'GET' }),

  //retryOn401: false to prevent infinite loop in the refresh flow
  refresh: () => http('/api/auth/refresh', {
    method: 'POST',
    retryOn401: false
  })
}
