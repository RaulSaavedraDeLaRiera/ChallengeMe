import { useState } from 'react'
import { FaMedal, FaUsers } from 'react-icons/fa'
import styles from './Discover.module.css'

//discover page: find challenges, posts and people
const Discover = () => {
  //all, challenges, posts people
  const [filter, setFilter] = useState('all') 
  const [searchQuery, setSearchQuery] = useState('')

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
          <div className={styles.emptyState}>
            <FaMedal className={styles.emptyIcon} />
            <p className={styles.emptyText}>Discover new challenges</p>
            <p className={styles.emptySubtext}>Follow people to see their content</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover

