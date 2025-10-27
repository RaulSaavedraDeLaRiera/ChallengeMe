import { useNavigate } from 'react-router-dom'
import { FaUsers, FaTimes } from 'react-icons/fa'
import styles from './Followers.module.css'

//followers subpage: list of people who follow you
const Followers = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.followersContainer}>
      <button className={styles.closeButton} onClick={() => navigate('/profile')}>
        <FaTimes />
      </button>

      <div className={styles.content}>
        <div className={styles.emptyState}>
          <FaUsers className={styles.emptyIcon} />
          <p className={styles.emptyText}>No followers yet</p>
          <p className={styles.emptySubtext}>Share your profile to get followers</p>
        </div>
      </div>
    </div>
  )
}

export default Followers
