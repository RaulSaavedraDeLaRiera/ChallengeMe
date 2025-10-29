import { useEffect, useState } from 'react'
import { FaMedal, FaUsers } from 'react-icons/fa'
import styles from './Discover.module.css'
import { PostService } from '../../services/post.service'
import { authStore } from '../../utils/authStore'
import { ChallengeService } from '../../services/challenge.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { PostCard } from '../../components/shared/PostCard/PostCard'
import { ChallengeCard } from '../../components/shared/ChallengeCard/ChallengeCard'

//discover page: find challenges, posts and people
const Discover = () => {
  //all, challenges, posts people
  const [filter, setFilter] = useState('all') 
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  //load followed feed first if empty, latest posts
  useEffect(() => {
    const load = async () => {
      try {
        const token = authStore.get()
        let data = []
        if (token) {
          try {
            data = await PostService.feed(token)
          } catch {
            data = []
          }
        }
        if (!data || data.length === 0) {
          data = await PostService.all()
        }
        setPosts(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
      try {
        const allChallenges = await ChallengeService.all()
        setChallenges(Array.isArray(allChallenges) ? allChallenges : [])
        
        //load user challenges to check join status
        const token = authStore.get()
        if (token) {
          try {
            const uc = await UserChallengeService.mine(token)
            setUserChallenges(Array.isArray(uc) ? uc : [])
          } catch {
            setUserChallenges([])
          }
        }
      } catch {
        setChallenges([])
      }
    }
    load()
  }, [])

  const isChallengeJoined = (challengeId) => {
    if (!Array.isArray(userChallenges)) return false
    return userChallenges.some(uc => 
      uc && 
      uc.challenge && 
      uc.challenge._id === challengeId && 
      uc.status === 'active'
    )
  }

  const handleJoinChallenge = async (challengeId) => {
    const token = authStore.get()
    if (!token) return
    
    try {
      const response = await UserChallengeService.join(challengeId, token)
      
      //get userChallenge (either from response or response.userChallenge)
      const userChallenge = response.userChallenge || response
      
      //check if user was already participating (active)
      if (response.alreadyJoined) {
        //update existing or add to local state
        setUserChallenges(prev => {
          const exists = prev.some(uc => 
            uc && uc.challenge && uc.challenge._id === challengeId
          )
          if (exists) {
            return prev.map(uc => 
              uc && uc.challenge && uc.challenge._id === challengeId 
                ? userChallenge 
                : uc
            )
          }
          return [...prev, userChallenge]
        })
        
        //update participant count in local state
        setChallenges(prev => prev.map(challenge => {
          if (challenge._id === challengeId) {
            const participants = challenge.participants || []
            const userId = userChallenge.user?._id || userChallenge.user
            if (!participants.some(p => (p._id || p).toString() === userId.toString())) {
              return { ...challenge, participants: [...participants, userId] }
            }
          }
          return challenge
        }))
        return
      }
      
      //new join or reactivation
      setUserChallenges(prev => {
        //remove any existing (abandoned) entry and add the new one
        const filtered = prev.filter(uc => 
          !(uc && uc.challenge && uc.challenge._id === challengeId)
        )
        return [...filtered, userChallenge]
      })
      
      //update participant count in local state
      setChallenges(prev => prev.map(challenge => {
        if (challenge._id === challengeId) {
          const participants = challenge.participants || []
          const userId = userChallenge.user?._id || userChallenge.user
          if (!participants.some(p => (p._id || p).toString() === userId.toString())) {
            return { ...challenge, participants: [...participants, userId] }
          }
        }
        return challenge
      }))
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }


  const toggleLike = async (postId) => {
    const token = authStore.get()
    if (!token) return
    try {
      const updated = await PostService.like(postId, token)
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
    } catch { /* ignore */ }
  }

  //get current user id from localStorage
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  }

  return (
    <div className={styles.discoverContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Discover</h1>
      </div>

      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'challenges' ? styles.active : ''}`}
          onClick={() => setFilter('challenges')}
        >
          Challenges
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'posts' ? styles.active : ''}`}
          onClick={() => setFilter('posts')}
        >
          Posts
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'people' ? styles.active : ''}`}
          onClick={() => setFilter('people')}
        >
          People
        </button>
      </div>

      {filter === 'people' && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className={styles.discoverList}>
        {filter === 'people' && searchQuery && (
          <div className={styles.emptyState}>
            <FaUsers className={styles.emptyIcon} />
            <p className={styles.emptyText}>No results found</p>
            <p className={styles.emptySubtext}>Try a different search term</p>
          </div>
        )}
        
        {filter === 'people' && !searchQuery && (
          <div className={styles.emptyState}>
            <FaUsers className={styles.emptyIcon} />
            <p className={styles.emptyText}>Search for people</p>
            <p className={styles.emptySubtext}>Type a name or username</p>
          </div>
        )}

        {filter !== 'people' && (
          <div>
            {loading ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>No content yet</p>
                <p className={styles.emptySubtext}>Follow people to see their content</p>
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
        )}

        {filter !== 'people' && (
          <div style={{ marginTop: 16 }}>
            <h2 className={styles.sectionTitle}>Challenges</h2>
            {challenges.length === 0 ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>No challenges yet</p>
              </div>
            ) : (
              <div className={styles.challengesList}>
                {challenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge._id} 
                      challenge={challenge}
                      currentUserId={getCurrentUserId()}
                      onJoin={handleJoinChallenge}
                      isJoined={isChallengeJoined(challenge._id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div> 
  )
}

export default Discover

