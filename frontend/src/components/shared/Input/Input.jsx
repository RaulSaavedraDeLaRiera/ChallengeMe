import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import styles from './Input.module.css'

export const Input = ({ label, error, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={props.id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input 
          className={styles.input}
          type={isPassword && showPassword ? 'text' : type}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  )
}

