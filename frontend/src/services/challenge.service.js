//service for general challenges API calls
import { http } from './http'

export const ChallengeService = {
  //create a new challenge with activities
  create: ({ title, subtitle, description, activities, startDate, endDate }) => {
    if (!title?.trim()) throw new Error('Challenge title is required')
    if (!description?.trim()) throw new Error('Challenge description is required')
    if (!Array.isArray(activities) || activities.length === 0) throw new Error('At least one activity is required')

    return http('/api/challenges', {
      method: 'POST',
      body: {
        title,
        subtitle,
        description,
        ...(activities ? { activities } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      }
    })
  },

  //list all challenges (for discover)
  all: () => http('/api/challenges', { method: 'GET' }),

  //get challenge by id
  getById: (challengeId) => http(`/api/challenges/${challengeId}`, { method: 'GET' })
}
