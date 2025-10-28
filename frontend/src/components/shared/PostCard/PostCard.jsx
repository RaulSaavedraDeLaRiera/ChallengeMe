import { AiOutlineLike } from 'react-icons/ai'
import styles from './PostCard.module.css'

export const PostCard = ({ post, onLike, currentUserId }) => {
  const created = post?.createdAt ? new Date(post.createdAt) : null
  const dateStr = created ? created.toLocaleDateString() : ''
  const isLiked = Array.isArray(post.likes) && post.likes.includes(currentUserId)
  const likesCount = Array.isArray(post.likes) ? post.likes.length : 0

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.authorName}>{post?.user?.name || 'Unknown'}</div>
        {post?.title ? (
          <div className={styles.titleRight}>{post.title}</div>
        ) : null}
      </div>
      
      <div className={styles.postContent}>
        {post.content}
      </div>
      
      <div className={styles.postFooter}>
        <div className={styles.postDate}>{dateStr}</div>
        <div className={styles.likeArea}>
          <button 
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
            onClick={() => onLike?.(post._id)}
            aria-label="Like"
          >
            <AiOutlineLike />
          </button>
          <span className={styles.likesCount}>{likesCount}</span>
        </div>
      </div>
    </div>
  )
}
