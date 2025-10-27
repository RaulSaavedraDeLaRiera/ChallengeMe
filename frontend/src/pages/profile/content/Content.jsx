import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCamera, FaRunning, FaTimes } from 'react-icons/fa'
import styles from './Content.module.css'

//content subpage: users posts and challenges with categories
const Content = () => {
  const navigate = useNavigate()
  //all, posts, challenges 

  const [contentFilter, setContentFilter] = useState('all') 
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

        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No content yet</p>
          <p className={styles.emptySubtext}>Start creating posts or challenges</p>
        </div>
      </div>
    </div>
  )
}

export default Content
