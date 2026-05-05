import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCamera, FaRunning, FaTimes } from 'react-icons/fa'
import styles from './Content.module.css'
import { PostService } from '../../../services/post.service'
import { ChallengeService } from '../../../services/challenge.service'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { PostCard } from '../../../components/shared/PostCard/PostCard'
import { ChallengeCard } from '../../../components/shared/ChallengeCard/ChallengeCard'

// Content subpage: user's posts and challenges with category filter
const Content = () => {
  const navigate = useNavigate()
  const [contentFilter, setContentFilter] = useState('all')
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [challengeStatuses, setChallengeStatuses] = useState({})

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const myId = getCurrentUserId()
        if (!myId) {
          setPosts([]); setChallenges([]); setLoading(false); return
        }

        const [myPosts, myChallenges, myUserChallenges] = await Promise.all([
          PostService.all().then(arr => Array.isArray(arr) ? arr.filter(p => (p.user?._id || p.user)?.toString() === myId.toString()) : []),
          ChallengeService.all().then(arr => Array.isArray(arr) ? arr.filter(c => (c.creator?._id || c.creator)?.toString() === myId.toString()) : []),
          UserChallengeService.all().catch(() => [])
        ])

        const statusMap = Array.isArray(myUserChallenges)
          ? myUserChallenges.reduce((acc, uc) => {
              const challengeId = uc?.challenge?._id || uc?.challenge
              if (challengeId) acc[challengeId.toString()] = uc.status
              return acc
            }, {})
          : {}

        setPosts(myPosts)
        setChallenges(myChallenges)
        setChallengeStatuses(statusMap)
      } catch {
        setPosts([]); setChallenges([]); setChallengeStatuses({})
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLike = async (id) => {
    try {
      const upd = await PostService.like(id)
      setPosts(prev => prev.map(x => x._id === upd._id ? upd : x))
    } catch {}
  }

  return (
    <div className={styles.contentContainer}>
      <button className={styles.closeButton} onClick={() => navigate('/profile')}>
        <FaTimes />
      </button>

      <div className={styles.content}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${contentFilter === 'all' ? styles.active : ''}`}
            onClick={() => setContentFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterTab} ${contentFilter === 'posts' ? styles.active : ''}`}
            onClick={() => setContentFilter('posts')}
          >
            <FaCamera />
            Posts
          </button>
          <button
            className={`${styles.filterTab} ${contentFilter === 'challenges' ? styles.active : ''}`}
            onClick={() => setContentFilter('challenges')}
          >
            <FaRunning />
            Challenges
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading...</p>
          </div>
        ) : (
          <>
            {(contentFilter === 'all' || contentFilter === 'posts') && (
              posts.length === 0 ? (
                <div className={styles.emptyState}><p className={styles.emptyText}>No posts yet</p></div>
              ) : (
                <div className={styles.list}>
                  {posts.map(p => (
                    <PostCard
                      key={p._id}
                      post={p}
                      currentUserId={getCurrentUserId()}
                      onLike={handleLike}
                    />
                  ))}
                </div>
              )
            )}

            {(contentFilter === 'all' || contentFilter === 'challenges') && (
              challenges.length === 0 ? (
                <div className={styles.emptyState}><p className={styles.emptyText}>No challenges yet</p></div>
              ) : (
                <div className={styles.list}>
                  {challenges.map(c => (
                    <ChallengeCard
                      key={c._id}
                      challenge={c}
                      currentUserId={getCurrentUserId()}
                      onJoin={() => undefined}
                      isJoined={true}
                      challengeStatus={challengeStatuses[c._id?.toString()]}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Content
