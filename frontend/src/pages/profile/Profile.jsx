import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaSignOutAlt, FaUserFriends, FaUsers, FaMedal, FaRunning, FaArrowLeft } from 'react-icons/fa'
import styles from './Profile.module.css'

//profile page: stats and navigation to subpages
const Profile = () => {
  const navigate = useNavigate()

  //handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/login')
  }
  
  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatarContainer}>
            <FaUserCircle className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.username}>Your Name</h2>
            <p className={styles.userEmail}>your@email.com</p>
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
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaRunning className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link to="contacts" className={styles.actionButton}>
          <FaUserFriends />
          <span>Contacts</span>
          <span className={styles.actionCount}>0</span>
        </Link>

        <Link to="followers" className={styles.actionButton}>
          <FaUsers />
          <span>Followers</span>
          <span className={styles.actionCount}>0</span>
        </Link>

        <Link to="content" className={styles.actionButton}>
          <FaRunning />
          <span>Your Content</span>
          <span className={styles.actionCount}>0</span>
        </Link>
      </div>
    </div>
  )
}

export default Profile
