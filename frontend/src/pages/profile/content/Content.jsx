import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCamera, FaRunning, FaTimes } from 'react-icons/fa'
import styles from './Content.module.css'
import { PostService } from '../../../services/post.service'
import { ChallengeService } from '../../../services/challenge.service'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { PostCard } from '../../../components/shared/PostCard/PostCard'
import { ChallengeCard } from '../../../components/shared/ChallengeCard/ChallengeCard'
import { authStore } from '../../../utils/authStore'

//content subpage: users posts and challenges with categories
const Content = () => {
  const navigate = useNavigate()
  //all, posts, challenges 

  const [contentFilter, setContentFilter] = useState('all')
  const [posts, setPosts] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [challengeStatuses, setChallengeStatuses] = useState({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const me = JSON.parse(localStorage.getItem('user') || '{}')
        const myId = me._id || me.id
        if (!myId) {
          setPosts([]); setChallenges([]); setLoading(false); return
        }
        const token = authStore.get()
        const [myPosts, myChallenges, myUserChallenges] = await Promise.all([
          PostService.all().then(arr => Array.isArray(arr) ? arr.filter(p => (p.user?._id || p.user)?.toString() === myId.toString()) : []),
          ChallengeService.all().then(arr => Array.isArray(arr) ? arr.filter(c => (c.creator?._id || c.creator)?.toString() === myId.toString()) : []),
          token ? UserChallengeService.all(token) : Promise.resolve([])
        ])
        const statusMap = Array.isArray(myUserChallenges)
          ? myUserChallenges.reduce((acc, uc) => {
              const challengeId = uc?.challenge?._id || uc?.challenge
              if (challengeId) {
                acc[challengeId.toString()] = uc.status
              }
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
                    <PostCard key={p._id} post={p} currentUserId={(JSON.parse(localStorage.getItem('user')||'{}')._id)} onLike={async (id)=>{
                      const token = authStore.get(); if(!token) return; try{ const upd=await PostService.like(id, token); setPosts(prev=>prev.map(x=>x._id===upd._id?upd:x)) }catch{}
                    }} />
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
                      currentUserId={(JSON.parse(localStorage.getItem('user')||'{}')._id)}
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
