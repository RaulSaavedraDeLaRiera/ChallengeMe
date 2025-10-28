import { useState } from 'react'
import { Button, Input } from '../../components/shared'
import { PostService } from '../../services/post.service'
import { authStore } from '../../utils/authStore'
import styles from './PostModalForm.module.css'

//post creation form modal component with headline and message fields

export const PostModalForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]  = useState('')

  const TITLE_LIMIT = 20
  const MESSAGE_LIMIT = 300

  const submit = async () => {
    setError('')
    const t = title.trim()
    const m = message.trim()
    if (!m) { setError('Message is required'); return }
    if (t && t.length > TITLE_LIMIT) { setError(`Title max ${TITLE_LIMIT} chars`); return }
    if (m.length > MESSAGE_LIMIT) { setError(`Message max ${MESSAGE_LIMIT} chars`); return }
    setLoading(true)
    try {
      const token = authStore.get()
          await PostService.create({ title: t, content: m }, token)
      onSuccess?.()
    } catch (e) {
      setError(e.message || 'Error creating post')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className={styles.formGroup}>
        <Input id="post-title" name="post-title" label="Headline" type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))} placeholder="Only if you want" />
        <div className={styles.counter}>{title.length}/{TITLE_LIMIT}</div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="post-message" className="form-label">Message</label>
        <textarea id="post-message" className={`form-input ${styles.textArea}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="make yourself heard..." rows={8} />
        <div className={styles.counter}>{message.length}/{MESSAGE_LIMIT}</div>
      </div>
      {error && <div className={`text-error ${styles.error}`}>{error}</div>}
      <Button onClick={submit} loading={loading} disabled={loading}>Publish</Button>
    </div>
  )
}


