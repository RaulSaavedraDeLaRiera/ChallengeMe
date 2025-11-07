import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMedal, FaUsers } from 'react-icons/fa'
import styles from './Discover.module.css'
import { PostService } from '../../services/post.service'
import { authStore } from '../../utils/authStore'
import { ChallengeService } from '../../services/challenge.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { UserService } from '../../services/user.service'
import { PostCard } from '../../components/shared/PostCard/PostCard'
import { ChallengeCard } from '../../components/shared/ChallengeCard/ChallengeCard'
import { Avatar } from '../../components/shared'
 
//discover page: find challenges, posts and people
const Discover = () => {
  const navigate = useNavigate()
  //all, challenges posts, people
  const [filter, setFilter] = useState('all') 
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  //get current user id
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user._id || user.id
    } catch {
      return null
    }
  }

  const currentUserId = getCurrentUserId()

  //load all posts and challenges excluding current users content sorted by newest first
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        //load all posts (newest first)
        const allPosts = await PostService.all()
        //filter out current user's posts
        const filteredPosts = Array.isArray(allPosts) 
          ? allPosts.filter(p => {
              const postUserId = p.user?._id || p.user
              return postUserId?.toString() !== currentUserId?.toString()
            }).sort((a, b) => {
              //sort by newest first
              const dateA = new Date(a.createdAt || a.created_at || 0)
              const dateB = new Date(b.createdAt || b.created_at || 0)
              return dateB - dateA
            })
          : []
        setPosts(filteredPosts)
        
        //load all challenges priorize olders
        const allChallenges = await ChallengeService.all()
        //filter out current users challenges
        const now = new Date()
        const filteredChallenges = Array.isArray(allChallenges)
          ? allChallenges.filter(c => {
              const challengeCreatorId = c.creator?._id || c.creator
              const endDate = new Date(c.endDate)
              const isEnded = !Number.isNaN(endDate.getTime()) && endDate < now
              return challengeCreatorId?.toString() !== currentUserId?.toString() && !isEnded
            }).sort((a, b) => {
              //sort by newest first
              const dateA = new Date(a.createdAt || a.created_at || 0)
              const dateB = new Date(b.createdAt || b.created_at || 0)
              return dateB - dateA
            })
          : []
        setChallenges(filteredChallenges)
        
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
      } catch (error) {
        console.error('Error loading discover content:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUserId])

  //search users
  useEffect(() => {
    const search = async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setSearchResults([])
        return
      }
      
      setSearchLoading(true)
      try {
        const results = await UserService.search(searchQuery)
        //filter out current user
        const filtered = Array.isArray(results) 
          ? results.filter(u => (u._id || u.id)?.toString() !== currentUserId?.toString())
          : []
        setSearchResults(filtered)
      } catch (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }
    
    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentUserId])

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

  //handle user click to view profile
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
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
        {filter === 'all' && (
          <>
            {loading ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : posts.length === 0 && challenges.length === 0 ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>No content yet</p>
              </div>
            ) : (
              <>
                {posts.length > 0 && (
                  <div className={styles.postsList}>
                    {posts.map((p) => (
                      <PostCard 
                        key={p._id} 
                        post={p} 
                        onLike={toggleLike}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                )}
                {challenges.length > 0 && (
                  <div className={styles.challengesList} style={{ marginTop: posts.length > 0 ? 16 : 0 }}>
                    {challenges.map((challenge) => (
                      <ChallengeCard 
                        key={challenge._id} 
                        challenge={challenge}
                        currentUserId={currentUserId}
                        onJoin={handleJoinChallenge}
                        isJoined={isChallengeJoined(challenge._id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {filter === 'people' && (
          <>
            {searchLoading ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Searching...</p>
              </div>
            ) : !searchQuery ? (
              <div className={styles.emptyState}>
                <FaUsers className={styles.emptyIcon} />
                <p className={styles.emptyText}>Search for people</p>
                <p className={styles.emptySubtext}>Type a name or username</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className={styles.emptyState}>
                <FaUsers className={styles.emptyIcon} />
                <p className={styles.emptyText}>No results found</p>
                <p className={styles.emptySubtext}>Try a different search term</p>
              </div>
            ) : (
              <div className={styles.usersList}>
                {searchResults.map((user) => (
                  <div 
                    key={user._id || user.id} 
                    className={styles.userCard}
                    onClick={() => handleUserClick(user._id || user.id)}
                  >
                    <Avatar name={user.name} className={styles.userCardAvatar} />
                    <div className={styles.userCardInfo}>
                      <span className={styles.userCardName}>{user.name || 'User'}</span>
                      <span className={styles.userCardEmail}>{user.email || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {filter === 'posts' && (
          <>
            {loading ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>No posts yet</p>
              </div>
            ) : (
              <div className={styles.postsList}>
                {posts.map((p) => (
                  <PostCard 
                    key={p._id} 
                    post={p} 
                    onLike={toggleLike}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {filter === 'challenges' && (
          <>
            {loading ? (
              <div className={styles.emptyState}>
                <FaMedal className={styles.emptyIcon} />
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : challenges.length === 0 ? (
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
                    currentUserId={currentUserId}
                    onJoin={handleJoinChallenge}
                    isJoined={isChallengeJoined(challenge._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div> 
  )
}

export default Discover

