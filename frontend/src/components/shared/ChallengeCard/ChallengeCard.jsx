//challenge card component for discover page, shows challenge details and join button
import { useState, useCallback, useEffect } from 'react'
import { FaFlag, FaUser, FaUsers, FaCalendarAlt, FaPlay } from 'react-icons/fa'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { authStore } from '../../../utils/authStore'
import styles from './ChallengeCard.module.css'

export const ChallengeCard = ({ 
  challenge, 
  currentUserId, 
  onJoin,
  isJoined = false
}) => {
  const [loading, setLoading] = useState(false)
  const [participantsCount, setParticipantsCount] = useState(
    Array.isArray(challenge.participants) ? challenge.participants.length : 0
  )

  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)
  const isCreator = challenge?.creator?._id === currentUserId

  //fetch accurate participants count (only active)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await UserChallengeService.getParticipantsCount(challenge._id)
        setParticipantsCount(result.count || 0)
      } catch (error) {
        console.error('Error fetching participants count:', error)
        //fallback to challenge.participants length
        setParticipantsCount(Array.isArray(challenge.participants) ? challenge.participants.length : 0)
      }
    }
    
    fetchCount()
  }, [challenge._id, challenge.participants, isJoined])

  //calculate days remaining
  const getDaysRemaining = () => {
    const now = new Date()
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  //handle join challenge
  const handleJoin = useCallback(() => {
    if (!onJoin || isJoined || loading) return
    setLoading(true)
    try {
      onJoin(challenge._id)
    } finally {
      setLoading(false)
    }
  }, [onJoin, isJoined, loading, challenge._id])

  return (
    <div className={styles.challengeCard}>
      <div className={styles.challengeHeader}>
        <div className={styles.challengeTitle}>
          <FaFlag className={styles.challengeIcon} />
          <span>{challenge.title}</span>
        </div>
        <div className={styles.challengeMeta}>
          <div className={styles.creatorInfo}>
            <FaUser className={styles.creatorIcon} />
            <span className={styles.creatorName}>
              {isCreator ? 'YOU' : challenge.creator?.name || 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {challenge.description && (
        <div className={styles.challengeDescription}>
          {challenge.description}
        </div>
      )}

      {/*activities list */}
      <div className={styles.activitiesSection}>
        <h4 className={styles.activitiesTitle}>CHALLENGES:</h4>
        <div className={styles.activitiesList}>
          {challenge.activities?.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <span className={styles.activityName}>{activity.name.toUpperCase()}</span>
                <span className={styles.activityTarget}>
                  {activity.target} {activity.unit}
                </span>
              </div>
            </div> 
          ))}
        </div>
      </div>

      {/* challenge dates*/}
      <div className={styles.challengeDates}>
        <div className={styles.daysRemaining}>
          <FaCalendarAlt className={styles.dateIcon} />
          <span>{getDaysRemaining()} Days remaining</span>
        </div>
        <div className={styles.duration}>
          <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* separator line after dates */}
      <div className={styles.separatorLine}></div>

      {/*participants info */}
      <div className={styles.participantsInfo}>
        <FaUsers className={styles.participantsIcon} />
        <span className={styles.participantsCount}>{participantsCount} Participants</span>
      </div>

      {/* challenge actions */}
      <div className={styles.challengeActions}>
        {isJoined ? (
          <button 
            className={`${styles.joinButton} ${styles.joinedButton}`}
            disabled
          >
            <FaPlay className={styles.buttonIcon} />
            ALREADY JOINED
          </button>
        ) : (
          <button 
            className={styles.joinButton}
            onClick={handleJoin}
            disabled={loading}
          >
            <FaPlay className={styles.buttonIcon} />
            JOIN CHALLENGE
          </button>
        )}
      </div>
    </div>
  )
}