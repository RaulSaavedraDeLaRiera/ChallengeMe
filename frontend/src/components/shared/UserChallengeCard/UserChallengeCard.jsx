import { useState, useEffect } from 'react'
import { FaFlag, FaUser, FaUsers, FaCalendarAlt, FaArrowUp, FaSignOutAlt, FaMedal } from 'react-icons/fa'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { AuthService } from '../../../services/auth.service'
import { authStore } from '../../../utils/authStore'
import styles from './UserChallengeCard.module.css'

//extract challenge data from userChallenge to show in dashborad

export const UserChallengeCard = ({ 
  userChallenge, 
  currentUserId,  
  onProgressUpdate  
}) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [abandoning, setAbandoning] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [creator, setCreator] = useState(null)
  const [participantsCount, setParticipantsCount] = useState(0)
  //local state for userChallenge to update immediately
  const [localUserChallenge, setLocalUserChallenge] = useState(userChallenge)

  //update local state when prop changes
  useEffect(() => {
    setLocalUserChallenge(userChallenge)
  }, [userChallenge])

  const challenge = localUserChallenge?.challenge || localUserChallenge || userChallenge?.challenge || userChallenge
  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)

  //get progress from localUserChallenge.activitiesProgress
  function getActivityProgress(activityName) {
    if (!localUserChallenge?.activitiesProgress) return 0
    const activityProgress = localUserChallenge.activitiesProgress.find(
      ap => ap.activityId === activityName
    )
    return activityProgress?.progress || 0
  }

  //calculate overall progress from activitiesProgress
  function calculateOverallProgress() {
    if (!challenge.activities?.length || !localUserChallenge?.activitiesProgress) return 0
    
    let totalProgress = 0
    let totalTarget = 0
    
    challenge.activities.forEach(activity => {
      const activityProgress = getActivityProgress(activity.name)
      totalProgress += activityProgress
      totalTarget += activity.target
    })
    
    return totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0
  }

  const isCreator = creator?._id === currentUserId || challenge?.creator === currentUserId
  const isActive = localUserChallenge?.status === 'active'
  const overallProgress = calculateOverallProgress()
  const canComplete = isActive && overallProgress === 100

  //fetch creator info if creator is just an id
  useEffect(() => {
    const fetchCreator = async () => {
      if (typeof challenge.creator === 'string') {
        try {
          const creatorData = await AuthService.getUserById(challenge.creator)
          setCreator(creatorData)
        } catch (error) {
          console.error('Error fetching creator:', error)
        }
      } else if (challenge.creator) {
        setCreator(challenge.creator)
      }
    }
    
    fetchCreator()
  }, [challenge.creator])

  //fetch participants count
  useEffect(() => {
    const fetchParticipantsCount = async () => {
      try {
        const result = await UserChallengeService.getParticipantsCount(challenge._id)
        setParticipantsCount(result.count || 0)
      } catch (error) {
        console.error('Error fetching participants count:', error)
        setParticipantsCount(0)
      }
    }
    
    fetchParticipantsCount()
  }, [challenge._id])

  //calculate days remaining
  const getDaysRemaining = () => {
    const now = new Date()
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }


  //handle activity edit
  const handleActivityEdit = async (activity) => {
    setEditingActivity(activity)
    setEditingValue(getActivityProgress(activity.name).toString())
    setShowEditModal(true)
  }

  //handle complete challenge
  const handleCompleteChallenge = async () => {
    const token = authStore.get()
    if (!token) return
    
    setCompleting(true)
    try {
      await UserChallengeService.updateStatus(challenge._id, 'completed', token)
      
      //update local state
      setLocalUserChallenge(prev => ({
        ...prev,
        status: 'completed',
        completedAt: new Date()
      }))
      
      //call parent callback to refresh data
      if (onProgressUpdate) {
        onProgressUpdate()
      }
      
      setShowCompleteModal(false)
    } catch (error) {
      console.error('Error completing challenge:', error)
    } finally {
      setCompleting(false)
    }
  }

  //handle save progress
  const handleSaveProgress = async () => {
    const numericValue = parseInt(editingValue) || 0
    const maxValue = editingActivity.target
    const clampedValue = Math.max(0, Math.min(numericValue, maxValue))
    
    const token = authStore.get()
    if (!token) return
    
    setLoading(true)
    try {
      //update progress in backend and get updated userchallenge
      const updated = await UserChallengeService.updateProgress(
        challenge._id, 
        editingActivity.name, 
        clampedValue, 
        token
      )
      
      //update local state immediately for instant ypdate
      if (updated) {
        setLocalUserChallenge(updated)
      } else {
        //fallback: update local state manually
        setLocalUserChallenge(prev => {
          if (!prev || !prev.activitiesProgress) return prev
          const updatedProgress = [...prev.activitiesProgress]
          const index = updatedProgress.findIndex(ap => ap.activityId === editingActivity.name)
          if (index >= 0) {
            updatedProgress[index] = {
              ...updatedProgress[index],
              progress: clampedValue,
              lastUpdated: new Date()
            }
          } else {
            updatedProgress.push({
              activityId: editingActivity.name,
              progress: clampedValue,
              lastUpdated: new Date()
            })
          }
          return { ...prev, activitiesProgress: updatedProgress }
        })
      }
      
      //call parent callback to refresh data from backend
      if (onProgressUpdate) {
        onProgressUpdate(challenge._id)
      }
      
      setShowEditModal(false)
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setLoading(false)
    }
  }

  //handle abandon challenge
  const handleAbandonChallenge = async () => {
    const token = authStore.get()
    if (!token) return
    
    setAbandoning(true)
    try {
      await UserChallengeService.updateStatus(challenge._id, 'abandoned', token)
      
      //call parent callback to refresh data
      if (onProgressUpdate) {
        onProgressUpdate()
      }
      
      setShowAbandonModal(false)
      //reload page to immediately reflect removal
      window.location.reload()
    } catch (error) {
      console.error('Error abandoning challenge:', error)
    } finally {
      setAbandoning(false)
    }
  }

  return (
    <>
      <div className={styles.challengeCard}>
        {/* header: title + progress */}
        <div className={styles.challengeHeader}>
          <div className={styles.challengeTitle}>
            <FaFlag className={styles.challengeIcon} />
            <span>{challenge.title}</span>
          </div>
          <div className={styles.challengeMeta}>
            <div className={styles.progressWrapper}>
              <span className={styles.progressPercentage}>{overallProgress}%</span>
              {isActive && canComplete && (
                <button 
                  className={styles.completeButtonSmall}
                  onClick={() => setShowCompleteModal(true)}
                  title="Mark as completed"
                >
                  <FaMedal className={styles.completeIconSmall} />
                </button>
              )}
              {isActive && !canComplete && (
                <button 
                  className={styles.abandonButtonSmall}
                  onClick={() => setShowAbandonModal(true)}
                  title="Abandon challenge"
                >
                  <FaSignOutAlt className={styles.abandonIconSmall} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* description */}
        {challenge.description && (
          <div className={styles.challengeDescription}>
            {challenge.description}
          </div>
        )}

        {/* activities */}
        <div className={styles.activitiesSection}>
          <h4 className={styles.activitiesTitle}>CHALLENGES:</h4>
          <div className={styles.activitiesList}>
            {challenge.activities?.map((activity, index) => {
              const currentProgress = getActivityProgress(activity.name)
              const progressPercentage = Math.min(100, (currentProgress / activity.target) * 100)
              
              return (
                <div 
                  key={index} 
                  className={styles.activityItem}
                  onClick={() => handleActivityEdit(activity)}
                >
                  <div className={styles.activityHeader}>
                    <span className={styles.activityName}>{activity.name.toUpperCase()}</span>
                    <span className={styles.activityTarget}>
                      {activity.target} {activity.unit}
                    </span>
                  </div>
                  
                  <div className={styles.activityProgressContainer}>
                    <div className={styles.activityProgressBar}>
                      <div 
                        className={styles.activityProgressFill}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* separator line before dates */}
        <div className={styles.separatorLine}></div>

        {/* dates */}
        <div className={styles.challengeDates}>
          <div className={styles.daysRemaining}>
            <FaCalendarAlt className={styles.dateIcon} />
            <span>{getDaysRemaining()} Days remaining</span>
          </div>
          <div className={styles.duration}>
            <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* separator line before participants */}
        <div className={styles.separatorLine}></div>

        {/* participants and creator - no separators */}
        <div className={styles.participantsCreatorInfo}>
          <div className={styles.participantsInfo}>
            <FaUsers className={styles.participantsIcon} />
            <span className={styles.participantsCount}>{participantsCount} Participants</span>
          </div>
          <div className={styles.creatorInfo}>
            <FaUser className={styles.creatorIcon} />
            <span className={styles.creatorName}>
              {isCreator ? 'YOU' : creator?.name || 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* edit progress modal */}
      {showEditModal && editingActivity && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.activityNameLeft}>
                <h3>{editingActivity.name.toUpperCase()}</h3>
              </div>
              <div className={styles.activityTargetRight}>
                <h3>{editingActivity.target} {editingActivity.unit.toUpperCase()}</h3>
              </div>
            </div>

            <div className={styles.editSection}>
              <div className={styles.progressEdit}>
                <input
                  type="number"
                  className={styles.progressInput}
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  min="0"
                  max={editingActivity.target}
                  placeholder="0"
                />
              </div>

              <div className={styles.saveSection}>
                <button 
                  className={styles.saveIconButton}
                  onClick={handleSaveProgress}
                  disabled={loading}
                >
                  <FaArrowUp className={styles.saveIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* abandon challenge confirmation modal */}
      {showAbandonModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAbandonModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalHeader}>
              <h3>Abandon Challenge</h3>
            </div>
            
            <div className={styles.confirmModalMessage}>
              <p>Are you sure?</p>
              <p className={styles.confirmModalSubtext}>If yes, remember that a timely withdrawal is a victory</p>
            </div>

            <div className={styles.confirmModalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowAbandonModal(false)}
                disabled={abandoning}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleAbandonChallenge}
                disabled={abandoning}
              >
                {abandoning ? 'Abandoning...' : 'Yes, abandon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* complete challenge confirmation modal */}
      {showCompleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCompleteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalHeader}>
              <h3>Complete Challenge</h3>
            </div>
            
            <div className={styles.confirmModalMessage}>
              <p>Do you want to mark "{challenge.title}" as completed?</p>
              <p className={styles.confirmModalSubtext}>All goals achieved!</p>
            </div>

            <div className={styles.confirmModalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowCompleteModal(false)}
                disabled={completing}
              >
                Cancel
              </button>
              <button 
                className={`${styles.confirmButton} ${styles.completeConfirmButton}`}
                onClick={handleCompleteChallenge}
                disabled={completing}
              >
                {completing ? 'Completing...' : 'Yes, complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
