import { useState, useEffect } from 'react'
import { FaPlus, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import styles from './Dashboard.module.css'
import CreateModal from '../create/CreateModal'
import { PostService } from '../../services/post.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { ChallengeService } from '../../services/challenge.service'
import { FollowService } from '../../services/follow.service'
import { authStore } from '../../utils/authStore'
import { PostCard, UserChallengeCard, ChallengeCard } from '../../components/shared'

// Home feed: active challenges and posts from people you follow

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isChallengesExpanded, setIsChallengesExpanded] = useState(() => {
    return sessionStorage.getItem('challengesExpanded') !== 'false'
  })
  const [posts, setPosts] = useState([])
  const [friendChallenges, setFriendChallenges] = useState([])
  const [myChallenges, setMyChallenges] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  // Save expanded state to session storage
  useEffect(() => {
    sessionStorage.setItem('challengesExpanded', isChallengesExpanded)
  }, [isChallengesExpanded])

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  }

  const loadFeed = async () => {
    const hasToken = !!authStore.get()
    const currentUserId = getCurrentUserId()

    try {
      if (hasToken) {
        try {
          const data = await PostService.feed()
          const filtered = Array.isArray(data)
            ? data.filter(p => {
                const postUserId = p.user?._id || p.user
                return postUserId?.toString() !== currentUserId?.toString()
              })
            : []
          setPosts(filtered)
        } catch {
          setPosts([])
        }

        try {
          const following = await FollowService.getFollowing(currentUserId)
          const followingIds = Array.isArray(following)
            ? following.map(f => (f._id || f.id || f)?.toString()).filter(Boolean)
            : []

          if (followingIds.length > 0) {
            const allChallenges = await ChallengeService.all()
            const filtered = Array.isArray(allChallenges)
              ? allChallenges.filter(c => {
                  const creatorId = (c.creator?._id || c.creator)?.toString()
                  return followingIds.includes(creatorId) && creatorId !== currentUserId?.toString()
                })
              : []
            setFriendChallenges(filtered)
          } else {
            setFriendChallenges([])
          }
        } catch {
          setFriendChallenges([])
        }
      } else {
        setPosts([])
        setFriendChallenges([])
      }
    } finally {
      setLoadingFeed(false)
    }

    try {
      if (hasToken) {
        const m = await UserChallengeService.mine()
        const filtered = Array.isArray(m) ? m.filter(uc => uc.status === 'active') : []
        setMyChallenges(filtered)
      } else {
        setMyChallenges([])
      }
    } catch {
      setMyChallenges([])
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  const toggleLike = async (postId) => {
    if (!authStore.get()) return
    try {
      const updated = await PostService.like(postId)
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
    } catch { /* ignore like error */ }
  }

  const handleJoinChallenge = async (challengeId) => {
    if (!authStore.get()) return
    try {
      await UserChallengeService.join(challengeId)
      const m = await UserChallengeService.mine()
      const filtered = Array.isArray(m) ? m.filter(uc => uc.status === 'active') : []
      setMyChallenges(filtered)
      setFriendChallenges(prev => prev.filter(c => c._id !== challengeId))
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const isChallengeJoined = (challengeId) => {
    return myChallenges.some(uc => uc?.challenge?._id === challengeId)
  }

  const toggleChallenges = () => {
    setIsChallengesExpanded(!isChallengesExpanded)
  }

  const handleProgressUpdate = async () => {
    if (!authStore.get()) return
    try {
      const m = await UserChallengeService.mine()
      const filtered = Array.isArray(m) ? m.filter(uc => uc.status === 'active') : []
      setMyChallenges(filtered)
    } catch {
      // ignore error
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
          ) : posts.length === 0 && friendChallenges.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No posts yet</p>
              <p className={styles.emptySubtext}>Follow people to see their posts and challenges</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {[...posts, ...friendChallenges]
                .sort((a, b) => {
                  const dateA = new Date(a.createdAt || a.created_at || 0)
                  const dateB = new Date(b.createdAt || b.created_at || 0)
                  return dateB - dateA
                })
                .map((item) => {
                  if (item.user || item.author) {
                    return (
                      <PostCard
                        key={item._id}
                        post={item}
                        onLike={toggleLike}
                        currentUserId={getCurrentUserId()}
                      />
                    )
                  } else {
                    return (
                      <ChallengeCard
                        key={item._id}
                        challenge={item}
                        currentUserId={getCurrentUserId()}
                        onJoin={handleJoinChallenge}
                        isJoined={isChallengeJoined(item._id)}
                        challengeStatus={item.status}
                      />
                    )
                  }
                })}
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
            loadFeed()
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
