// for social posts api calls
import { http } from './http'

export const PostService = {
  //create a new post 
  create: ({ title, content, challengeId }, token) => {
    const payload = {
      ...(title ? { title } : {}),
      content,
      challenge: challengeId || null
    }
    return http('/api/posts', {
      method: 'POST',
      body: payload,
      token
    })
  },

  //get feed posts from followed users
  feed: (token) => http('/api/posts/feed', { method: 'GET', token }),

  //get all posts 
  all: () => http('/api/posts', { method: 'GET' }),

  //like for a post
  like: (postId, token) => http(`/api/posts/${postId}/like`, { method: 'PUT', token })
}


