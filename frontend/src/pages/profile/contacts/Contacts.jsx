import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserFriends, FaTimes } from 'react-icons/fa'
import styles from './Contacts.module.css'
import { FollowService } from '../../../services/follow.service'
import { Avatar } from '../../../components/shared' 

//contacts subpage: list of people you follow
const Contacts = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  //handle user click to view profile
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const me = JSON.parse(localStorage.getItem('user') || '{}')
        const myId = me._id || me.id
        if (!myId) return setContacts([])
        const [followers, following] = await Promise.all([
          FollowService.getFollowers(myId),
          FollowService.getFollowing(myId)
        ])
        const followersMap = new Map((followers || []).map(u => [(u._id || u.id)?.toString(), u]))
        const mutuals = (following || []).filter(u => followersMap.has((u._id || u.id)?.toString()))
        setContacts(mutuals)
      } catch {
        setContacts([])
      } finally {
        setLoading(false) 
      }
    }
    load()
  }, [])

  return (
    <div className={styles.contactsContainer}> 
      <button className={styles.closeButton} onClick={() => navigate('/profile')}>
        <FaTimes />
      </button>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className={styles.emptyState}>
            <FaUserFriends className={styles.emptyIcon} />
            <p className={styles.emptyText}>No contacts yet</p>
            <p className={styles.emptySubtext}>Follow people and accept followers</p>
          </div>
        ) : (
          <div className={styles.list}>
            {contacts.map(u => {
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

export default Contacts
