//user service: handle user operations
import { http } from './http'

export const UserService = {
  //search users by name /email
  search: (query) => http(`/api/users/search?query=${encodeURIComponent(query)}`, { method: 'GET' }),
  
  //get user by id
  getById: (userId) => http(`/api/users/${userId}`, { method: 'GET' }),
  
  //get user posts
  getPosts: (userId) => http(`/api/posts?author=${userId}`, { method: 'GET' }),
  
  //get user challenges
  getChallenges: (userId) => http(`/api/challenges?creator=${userId}`, { method: 'GET' })
}

