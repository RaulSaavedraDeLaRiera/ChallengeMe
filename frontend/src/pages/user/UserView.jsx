import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCamera, FaRunning, FaUserPlus, FaUserCheck, FaArrowLeft } from 'react-icons/fa'
import { UserService } from '../../services/user.service'
import { FollowService } from '../../services/follow.service'
import { PostService } from '../../services/post.service'
import { ChallengeService } from '../../services/challenge.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { authStore } from '../../utils/authStore'
import { PostCard, Avatar } from '../../components/shared' 
import { ChallengeCard } from '../../components/shared/ChallengeCard/ChallengeCard'
import styles from './UserView.module.css'
//user view page: public user profile with content feed and follow button

const UserView = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
  const [contentFilter, setContentFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followingLoading, setFollowingLoading] = useState(false)

  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  })()

  //load user data and check follow status
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const token = authStore.get()
        
        //load user
        const userData = await UserService.getById(userId)
        setUser(userData)
        
        //load posts and challenges
        const [postsData, challengesData] = await Promise.all([
          UserService.getPosts(userId),
          UserService.getChallenges(userId)
        ])
        setPosts(Array.isArray(postsData) ? postsData : [])
        setChallenges(Array.isArray(challengesData) ? challengesData : [])
        
        //check if current user follows this user
        if (token && currentUserId && currentUserId !== userId) {
          const following = await FollowService.checkFollowing(userId, currentUserId, token)
          setIsFollowing(following)
        }
      } catch (error) {
        console.error('Error loading user view:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      load()
    }
  }, [userId, currentUserId])

  //handle follow unfollow
  const handleFollowToggle = async () => {
    const token = authStore.get()
    if (!token || !currentUserId || currentUserId === userId) return
    
    setFollowingLoading(true)
    try {
      if (isFollowing) {
        await FollowService.unfollow(userId, token)
        setIsFollowing(false)
      } else {
        await FollowService.follow(userId, token)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowingLoading(false)
    }
  }

  //handle back navigation
  const handleBack = () => {
    navigate(-1)
  }

  //join a challenge from user view
  const handleJoinChallenge = async (challengeId) => {
    const token = authStore.get()
    if (!token) return
    try {
      const response = await UserChallengeService.join(challengeId, token)
      const userChallenge = response.userChallenge || response
      //update participants locally
      setChallenges(prev => prev.map(ch => {
        if (ch._id !== challengeId) return ch
        const participants = ch.participants || []
        const addedId = userChallenge.user?._id || userChallenge.user
        if (!participants.some(p => (p._id || p).toString() === addedId?.toString())) {
          return { ...ch, participants: [...participants, addedId] }
        }
        return ch
      }))
    } catch (err) {
      console.error('Error joining challenge from user view:', err)
    }
  }

  //filter content based on selected tab
  const filteredPosts = contentFilter === 'challenges' ? [] : posts
  const filteredChallenges = contentFilter === 'posts' ? [] : challenges

  if (loading) {
    return (
      <div className={styles.userViewContainer}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.userViewContainer}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.userViewContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        <FaArrowLeft />
      </button>
      
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <Avatar name={user?.name} className={styles.avatar} />
          <div className={styles.userDetails}>
            <h2 className={styles.username}>{user.name || 'User'}</h2>
            <p className={styles.userEmail}>{user.email || ''}</p>
          </div>
        </div>
        
        {currentUserId && currentUserId !== userId && (
          <button 
            className={styles.followButton}
            onClick={handleFollowToggle}
            disabled={followingLoading}
          >
            {isFollowing ? (
              <>
                <FaUserCheck />
                <span>Unfollow</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

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

        {(contentFilter === 'all' || contentFilter === 'posts') && filteredPosts.length > 0 && (
          <div className={styles.postsList}>
            {filteredPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onLike={async (postId) => {
                  const token = authStore.get()
                  if (!token) return
                  try {
                    const updated = await PostService.like(postId, token)
                    setPosts(prev => prev.map(p => p._id === updated._id ? updated : p))
                  } catch {}
                }}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}

        {(contentFilter === 'all' || contentFilter === 'challenges') && filteredChallenges.length > 0 && (
          <div className={styles.challengesList}>
            {filteredChallenges.map((challenge) => (
              <ChallengeCard 
                key={challenge._id} 
                challenge={challenge}
                currentUserId={currentUserId}
                onJoin={() => handleJoinChallenge(challenge._id)}
                isJoined={false}
                challengeStatus={challenge.status}
              />
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && filteredChallenges.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No content yet</p>
            <p className={styles.emptySubtext}>This user has not created any posts or challenges</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserView

