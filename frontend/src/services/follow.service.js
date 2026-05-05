//follow service: handle user follow/unfollow actions
import { http } from './http'

export const FollowService = {
  //follow a user
  follow: (userId) => http(`/api/follow/${userId}`, { method: 'POST' }),

  //unfollow a user
  unfollow: (userId) => http(`/api/follow/${userId}`, { method: 'DELETE' }),

  //get followers of a user
  getFollowers: (userId) => http(`/api/follow/followers/${userId}`, { method: 'GET' }),

  //get users that a user is following
  getFollowing: (userId) => http(`/api/follow/following/${userId}`, { method: 'GET' }),

  //check if current user follows a given user
  checkFollowing: async (targetUserId, currentUserId) => {
    try {
      if (!currentUserId) return false
      const following = await http(`/api/follow/following/${currentUserId}`, { method: 'GET' })
      return Array.isArray(following) && following.some(u =>
        (u._id || u)?.toString() === targetUserId.toString()
      )
    } catch {
      return false
    }
  }
}
