import { useState, useEffect } from 'react'
import { FaPlus, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import styles from './Dashboard.module.css'
import CreateModal from '../create/CreateModal'
import { PostService } from '../../services/post.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { authStore } from '../../utils/authStore'
import { PostCard, UserChallengeCard } from '../../components/shared'

//home feed: your active challenges and posts from people you follow 

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isChallengesExpanded, setIsChallengesExpanded] = useState(() => {
    return sessionStorage.getItem('challengesExpanded') !== 'false'
  })
  const [posts, setPosts] = useState([])
  const [myChallenges, setMyChallenges] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  //save expanded state to session storage
  useEffect(() => {
    sessionStorage.setItem('challengesExpanded', isChallengesExpanded)
  }, [isChallengesExpanded]) 

  //load feed and my challenges
  useEffect(() => {
    const load = async () => {
      const token = authStore.get()
      try {
        let data = []
        if (token) {
          try { data = await PostService.feed(token) } catch {/* ignore */}
        }
        if (!data || data.length === 0) {
          data = await PostService.all()
        }
        setPosts(Array.isArray(data) ? data : [])
      } finally {
        setLoadingFeed(false)
      }
      try {
        if (token) {
          const m = await UserChallengeService.mine(token)
          setMyChallenges(Array.isArray(m) ? m : [])
        } else {
          setMyChallenges([])
        }
      } catch {
        setMyChallenges([])
      }
    }
    load()
  }, [])

  const toggleLike = async (postId) => {
    const token = authStore.get()
    if (!token) return
    try {
      const updated = await PostService.like(postId, token)
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
    } catch { /* ignore like error */}
  }

  // get current user id from localStorage
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  }



  const toggleChallenges = () => {
    setIsChallengesExpanded(!isChallengesExpanded)
  }

  //refresh challenges after progress update
  const handleProgressUpdate = async (challengeId) => {
    const token = authStore.get()
    if (!token) return
    
    try {
      const m = await UserChallengeService.mine(token)
      setMyChallenges(Array.isArray(m) ? m : [])
    } catch {
      //ignore error
    }
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
            <div>
              {myChallenges.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>No active challenges</p>
                  <p className={styles.emptySubtext}>Start a challenge to track your progress</p>
                </div>
              ) : (
                <div className={styles.challengesList}>
                  {myChallenges.map((userChallenge) => (
                    <UserChallengeCard 
                      key={userChallenge._id} 
                      userChallenge={userChallenge}
                      currentUserId={getCurrentUserId()}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.postsSection}>
          {loadingFeed ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Loading feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No posts yet</p>
              <p className={styles.emptySubtext}>Follow people to see their posts and challenges</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {posts.map((p) => (
                <PostCard 
                  key={p._id} 
                  post={p} 
                  onLike={toggleLike}
                  currentUserId={getCurrentUserId()}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        className={styles.createButton}
        onClick={() => setShowCreateModal(true)}
      >
        <FaPlus />
      </button>

      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            //refresh feed and challenges after creation
            (async () => {
              const token = authStore.get() 
              try {
                let data = []
                if (token) { try { data = await PostService.feed(token) } catch { /* ignore feed error */ } }
                if (!data || data.length === 0) { data = await PostService.all() }
                setPosts(Array.isArray(data) ? data : [])
              } catch { /* ignore refresh  */ }
              try {
                if (token) {
                  const m = await UserChallengeService.mine(token)
                  setMyChallenges(Array.isArray(m) ? m : [])
                }
              } catch { /* ignore*/ }
            })()
          }}
        />
      )}
    </div>
  )
}
 
export default Dashboard
