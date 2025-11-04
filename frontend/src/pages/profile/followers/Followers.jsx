import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaTimes, FaUserCircle } from 'react-icons/fa'
import styles from './Followers.module.css'
import { FollowService } from '../../../services/follow.service'
import { Avatar } from '../../../components/shared'

//followers subpage: list of people who follow you
const Followers = () => {
  const navigate = useNavigate()
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const me = JSON.parse(localStorage.getItem('user') || '{}')
        const myId = me._id || me.id
        if (!myId) return setFollowers([])
        const list = await FollowService.getFollowers(myId)
        setFollowers(Array.isArray(list) ? list : [])
      } catch {
        setFollowers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  //handle user click to view profile
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
  }

  return (
    <div className={styles.followersContainer}>
      <button className={styles.closeButton} onClick={() => navigate('/profile')}>
        <FaTimes />
      </button>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading...</p>
          </div>
        ) : followers.length === 0 ? (
          <div className={styles.emptyState}>
            <FaUsers className={styles.emptyIcon} />
            <p className={styles.emptyText}>No followers yet</p>
            <p className={styles.emptySubtext}>Share your profile to get followers</p>
          </div>
        ) : (
          <div className={styles.list}>
            {followers.map(u => {
              const userId = u._id || u.id
              return (
                <div 
                  key={userId} 
                  className={styles.item}
                  onClick={() => handleUserClick(userId)}
                >
                  <Avatar name={u.name} className={styles.itemAvatar} />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{u.name || 'User'}</span>
                    <span className={styles.itemEmail}>{u.email || ''}</span>
                  </div>
                </div>
              )
            })} 
          </div>
        )}
      </div>
    </div>
  )
}

export default Followers
