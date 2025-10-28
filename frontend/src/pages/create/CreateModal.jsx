import { useState } from 'react'
import { PostModalForm } from '../../components/modals/PostModalForm'
import { ChallengeModalForm } from '../../components/modals/ChallengeModalForm'
import styles from './CreateModal.module.css'

//modal to select type creation


const CreateModal = ({ onClose, onCreated }) => {
  //cstep selection: null | 'post' | 'challenge'
  const [selection, setSelection]  = useState(null)
  


  return (
    <div className={styles.overlay}>
      <div className={styles.scrollArea}>
        <div className={!selection ? styles.panelTransparent : styles.panel}>
          {!selection ? (
            <div className={styles.centerSelect}>
              <div className={styles.selectButtons}>
                <button aria-label="Create Post" onClick={() => setSelection('post')} className={styles.selectBtn}>Post</button>
                <button aria-label="Create Challenge" onClick={() => setSelection('challenge')} className={`${styles.selectBtn} ${styles.selectBtnPrimary}`}>Challenge</button>
              </div>
            </div>
          ) : selection === 'post' ? (
            <PostModalForm onSuccess={() => { onCreated?.('post'); onClose() }} />
          ) : (
            <ChallengeModalForm onSuccess={() => { onCreated?.('challenge'); onClose() }} />
          )}
        </div>
      </div>
      <button onClick={onClose} aria-label="Close" className={styles.closeFab}>×</button>
    </div>
  )
}

export default CreateModal


