import styles from './Button.module.css'

export const Button = ({ children, variant = 'primary', loading, ...props }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

