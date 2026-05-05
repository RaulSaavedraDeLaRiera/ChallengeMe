//service for user challenge management: participation and progress
import { http } from './http'

export const UserChallengeService = {
  //get user's active challenges with progress (for dashboard)
  mine: () => http('/api/user-challenges/my-challenges', { method: 'GET' }),

  //get all user challenges for profile
  all: () => http('/api/user-challenges/all-challenges', { method: 'GET' }),

  //join a challenge (creates UserChallenge record)
  join: (challengeId) => http(`/api/user-challenges/${challengeId}/join`, { method: 'POST' }),

  //get progress for a specific challenge
  getProgress: (challengeId) =>
    http(`/api/user-challenges/${challengeId}/progress`, { method: 'GET' }),

  //update progress for a specific activity
  updateProgress: (challengeId, activityId, progress) =>
    http(`/api/user-challenges/${challengeId}/progress`, {
      method: 'PUT',
      body: { activityId, progress }
    }),

  //get participants count for a challenge
  getParticipantsCount: (challengeId, { includeCompleted = false } = {}) =>
    http(`/api/user-challenges/${challengeId}/participants-count${includeCompleted ? '?includeCompleted=true' : ''}`, { method: 'GET' }),

  //update challenge status (completed or abandoned)
  updateStatus: (challengeId, status) =>
    http(`/api/user-challenges/${challengeId}/status`, {
      method: 'PUT',
      body: { status }
    })
}
