import { useNavigate } from 'react-router-dom'
import { FaUserFriends, FaTimes } from 'react-icons/fa'
import styles from './Contacts.module.css'

//contacts subpage: list of people you follow
const Contacts = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.contactsContainer}>
      <button className={styles.closeButton} onClick={() => navigate('/profile')}>
        <FaTimes />
      </button>

      <div className={styles.content}>
        <div className={styles.emptyState}>
          <FaUserFriends className={styles.emptyIcon} />
          <p className={styles.emptyText}>No contacts yet</p>
          <p className={styles.emptySubtext}>Start following people</p>
        </div>
      </div>
    </div>
  )
}

export default Contacts
