import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaUser, FaSearch } from 'react-icons/fa'
import styles from './BottomNav.module.css'

//bottom navigation: fixed menu at bottom for main sections
const BottomNav = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.bottomNav}>
      <Link to="/discover" className={styles.navItem}>
        <FaSearch className={`${styles.navIcon} ${isActive('/discover') ? styles.active : ''}`} />
        <span className={`${styles.navLabel} ${isActive('/discover') ? styles.active : ''}`}>
          Discover
        </span>
      </Link>

      <Link to="/dashboard" className={styles.navItem}>
        <FaHome className={`${styles.navIcon} ${isActive('/dashboard') ? styles.active : ''}`} />
        <span className={`${styles.navLabel} ${isActive('/dashboard') ? styles.active : ''}`}>
          Home
        </span>
      </Link>

      <Link to="/profile" className={styles.navItem}>
        <FaUser className={`${styles.navIcon} ${isActive('/profile') ? styles.active : ''}`} />
        <span className={`${styles.navLabel} ${isActive('/profile') ? styles.active : ''}`}>
          Profile
        </span>
      </Link>
    </nav>
  )
}

export default BottomNav

