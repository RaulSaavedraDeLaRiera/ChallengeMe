import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaSignOutAlt, FaUserFriends, FaUsers, FaMedal, FaRunning, FaChartLine } from 'react-icons/fa'
import styles from './Profile.module.css'
import { useEffect, useState } from 'react'
import { AuthService } from '../../services/auth.service'
import { authStore } from '../../utils/authStore'
import { FollowService } from '../../services/follow.service'
import { PostService } from '../../services/post.service'
import { ChallengeService } from '../../services/challenge.service'
import { UserChallengeService } from '../../services/userChallenge.service'
import { Avatar } from '../../components/shared'

//profile page: stats and navigation to subpages
const Profile = () => {
  const navigate = useNavigate() 
  const [me, setMe] = useState(null) 
  const [followersCount, setFollowersCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)
  const [contentCount, setContentCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  //load current user and counts
  useEffect(() => {
    const load = async () => {
      const token = authStore.get()
      if (!token) return
      try {
        const user = await AuthService.profile(token)
        setMe(user)
        //mirror in localStorage
        try { localStorage.setItem('user', JSON.stringify(user)) } catch {}
        
        const myId = user._id || user.id
        if (!myId) return
        
        //load counts
        try {
          const [followers, following] = await Promise.all([
            FollowService.getFollowers(myId),
            FollowService.getFollowing(myId)
          ])
          const followersList = Array.isArray(followers) ? followers : []
          const followingList = Array.isArray(following) ? following : []
          
          //count mutual follows (contacts)
          const followersMap = new Map(followersList.map(u => [(u._id || u.id)?.toString(), true]))
          const contactsList = followingList.filter(u => followersMap.has((u._id || u.id)?.toString()))
          
          setFollowersCount(followersList.length)
          setContactsCount(contactsList.length)
        } catch {}
        
        //load content count
        try {
          const [posts, challenges] = await Promise.all([
            PostService.all(),
            ChallengeService.all()
          ])
          const myPosts = Array.isArray(posts) ? posts.filter(p => (p.user?._id || p.user)?.toString() === myId.toString()) : []
          const myChallenges = Array.isArray(challenges) ? challenges.filter(c => (c.creator?._id || c.creator)?.toString() === myId.toString()) : []
          setContentCount(myPosts.length + myChallenges.length)
        } catch {}
        
        //load all user challenges for stats
        try {
          const allUC = await UserChallengeService.all(token)
          const challengesList = Array.isArray(allUC) ? allUC : []
          
          //calculate active and completed
          const active = challengesList.filter(uc => uc.status === 'active').length
          const completed = challengesList.filter(uc => uc.status === 'completed').length
          setActiveCount(active)
          setCompletedCount(completed)
        } catch {}
      } catch {}
    }
    load()
  }, [])

  //handle logout
  const handleLogout = () => {
    localStorage.removeItem('user')
    try { localStorage.removeItem('token') } catch {}
    try { authStore.clear() } catch {}
    navigate('/login')
  }
  
  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatarContainer}>
            <Avatar name={me?.name} className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.username}>{me?.name || 'Your Name'}</h2>
            <p className={styles.userEmail}>{me?.email || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButtonIcon}>
          <FaSignOutAlt />
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <FaMedal className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaRunning className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{activeCount}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link to="contacts" className={styles.actionButton}>
          <FaUserFriends />
          <span>Contacts</span>
          <span className={styles.actionCount}>{contactsCount}</span>
        </Link>

        <Link to="followers" className={styles.actionButton}>
          <FaUsers />
          <span>Followers</span>
          <span className={styles.actionCount}>{followersCount}</span>
        </Link>

        <Link to="content" className={styles.actionButton}>
          <FaRunning />
          <span>Your Content</span>
          <span className={styles.actionCount}>{contentCount}</span>
        </Link>

        <Link to="metrics" className={styles.actionButton}>
          <FaChartLine />
          <span>Metrics</span>
        </Link>
      </div>
    </div>
  )
}

export default Profile
