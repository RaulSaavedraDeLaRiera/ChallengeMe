import { useEffect, useRef } from 'react'
import styles from './Avatar.module.css'
 
//simple class to show start char
export const Avatar = ({ name, className }) => {
  const avatarRef = useRef(null)
   
  useEffect(() => {
    if (avatarRef.current) {
      const width = avatarRef.current.offsetWidth
      const fontSize = width * 0.6
      avatarRef.current.style.fontSize = `${fontSize}px`
    }
  }, [name, className])
  
  if (!name) return null
  return (
    <div ref={avatarRef} className={`${styles.avatar} ${className || ''}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

