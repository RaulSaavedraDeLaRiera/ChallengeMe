import { useState, useEffect } from 'react'
import { FaPlus, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import styles from './Dashboard.module.css'

//home feed: your active challenges and posts from people you follow 
const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isChallengesExpanded, setIsChallengesExpanded] = useState(() => {
    return sessionStorage.getItem('challengesExpanded') !== 'false'
  })

  //save expanded state to session storage
  useEffect(() => {
    sessionStorage.setItem('challengesExpanded', isChallengesExpanded)
  }, [isChallengesExpanded])

  const toggleChallenges = () => {
    setIsChallengesExpanded(!isChallengesExpanded)
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>Home</h1>

      <div className={styles.feed}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Active Challenges</h2>
            <button className={styles.toggleButton} onClick={toggleChallenges}>
              {isChallengesExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          
          {isChallengesExpanded && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No active challenges</p>
              <p className={styles.emptySubtext}>Start a challenge to track your progress</p>
            </div>
          )}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.postsSection}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No posts yet</p>
            <p className={styles.emptySubtext}>Follow people to see their posts and challenges</p>
          </div>
        </div>
      </div>

      <button 
        className={styles.createButton}
        onClick={() => setShowCreateModal(true)}
      >
        <FaPlus />
      </button>

      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Create</h3>
            <button onClick={() => setShowCreateModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default Dashboard
