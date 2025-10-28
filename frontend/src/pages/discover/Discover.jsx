import { useEffect, useState } from 'react'
import { FaMedal, FaUsers } from 'react-icons/fa'
import styles from './Discover.module.css'
import { PostService } from '../../services/post.service'
import { authStore } from '../../utils/authStore'
import { ChallengeService } from '../../services/challenge.service'
import { PostCard } from '../../components/shared'

//discover page: find challenges, posts and people
const Discover = () => {
  //all, challenges, posts people
  const [filter, setFilter] = useState('all') 
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
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
      } catch {
        setChallenges([])
      }
    }
    load()
  }, [])

  const joinChallenge = async (id) => {
    const token = authStore.get()
    if (!token) { return }
    try {
      await ChallengeService.join(id, token)
      // joined
    } catch (e) {
      // ignore error
    }
  }

  const toggleLike = async (postId) => {
    const token = authStore.get()
    if (!token) return
    try {
      const updated = await PostService.like(postId, token)
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
    } catch { /* ignore like error */ }
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
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {challenges.map((c) => (
                  <li key={c._id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{c.title}</span>
                      <span className={styles.itemMeta}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.description && <div className={styles.itemBody}>{c.description}</div>}
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-primary" onClick={() => joinChallenge(c._id)}>Join</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover

