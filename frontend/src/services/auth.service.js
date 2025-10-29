import { http } from './http'

//authentication service: register and login
export const AuthService = {
  register: (payload) => http('/api/auth/register', { 
    method: 'POST',
    body: payload
  }),
  login: (payload) => http('/api/auth/login', { 
    method: 'POST',
    body: payload
  }),
  profile: (token) => http('/api/users/me', { 
    method: 'GET',
    token
  }), 
  getUserById: (userId) => http(`/api/users/${userId}`, { method: 'GET' })
}
