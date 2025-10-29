//service for general challenges api calls
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

  //list all challenges (for discover)
  all: () => http('/api/challenges', { method: 'GET' }),

  //get challenge by id
  getById: (challengeId) => http(`/api/challenges/${challengeId}`, { method: 'GET' })
}


