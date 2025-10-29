//service for user challenge management: users participation and progress in challenges
import { http } from './http'

export const UserChallengeService = {
  //get users active challenges with progress (for dashboard)
  mine: (token) => http('/api/user-challenges/my-challenges', { method: 'GET', token }),

  //join a challenge (creates UserChallenge record)
  join: (challengeId, token) => http(`/api/user-challenges/${challengeId}/join`, { method: 'POST', token }),

  //get progress for a specific challenge
  getProgress: (challengeId, token) => 
    http(`/api/user-challenges/${challengeId}/progress`, { method: 'GET', token }),

  //update progress for a specific activity
  updateProgress: (challengeId, activityId, progress, token) => 
    http(`/api/user-challenges/${challengeId}/progress`, {
      method: 'PUT',
      body: { activityId, progress },
      token
    }), 

  //get participants count for a challenge
  getParticipantsCount: (challengeId) => 
    http(`/api/user-challenges/${challengeId}/participants-count`, { method: 'GET' }),

  //update challenge status 
  updateStatus: (challengeId, status, token) =>
    http(`/api/user-challenges/${challengeId}/status`, {
      method: 'PUT',
      body: { status },
      token
    })
}
