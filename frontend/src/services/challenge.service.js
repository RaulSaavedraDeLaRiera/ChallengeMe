//service for challenges api calls
import { http } from './http'

export const ChallengeService = {
  //create a new challenge with activities 
  create: ({ title, subtitle, description, activities, startDate, endDate }, token) =>
    http('/api/challenges', {
      method: 'POST',
      body: {
        title,
        subtitle,
        description,
        ...(activities ? { activities } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      },
      token
    }),

  //list challenges created and joined
  mine: (token) => http('/api/challenges/me', { method: 'GET', token }),

  //list all challenges
  all: () => http('/api/challenges', { method: 'GET' }),

  //join a challenge
  join: (challengeId, token) => http(`/api/challenges/${challengeId}/join`, { method: 'PUT', token })
}


