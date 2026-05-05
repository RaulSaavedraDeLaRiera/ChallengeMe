//social posts API calls
import { http } from './http'

export const PostService = {
  //create a new post
  create: ({ title, content, challengeId }) => {
    if (!content?.trim()) throw new Error('Post content is required')

    const payload = {
      ...(title ? { title } : {}),
      content,
      challenge: challengeId || null
    }
    return http('/api/posts', { method: 'POST', body: payload })
  },

  //get feed posts from followed users
  feed: () => http('/api/posts/feed', { method: 'GET' }),

  //get all posts
  all: () => http('/api/posts', { method: 'GET' }),

  //toggle like for a post
  like: (postId) => http(`/api/posts/${postId}/like`, { method: 'PUT' })
}
