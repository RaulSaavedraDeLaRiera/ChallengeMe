import { useState } from 'react'
import { Button, Input } from '../../components/shared'
import { ChallengeService } from '../../services/challenge.service'
import { authStore } from '../../utils/authStore'
import styles from './ChallengeModalForm.module.css'

//challenge creation form modal component with activities


export const ChallengeModalForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const today = new Date() 
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const isoDate = (d) => d.toISOString().slice(0,10)
  const [startDate, setStartDate] = useState(isoDate(today))
  const [endDate, setEndDate] = useState(isoDate(in7))
  const [activities, setActivities] = useState([{ name: 'run', target: '', unit: 'meters', confirmed: false }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activityTypes = ['run','bike','walk','push-ups','sit-ups','squats','plank']

  const getUnitForType = (type) => {
    if (type === 'run' || type === 'bike' || type === 'walk') return 'meters'
    if (type === 'plank') return 'minutes'
    return 'times'
  }

  const addActivity = () => setActivities((prev) => [...prev, { name: 'run', target: '', unit: 'meters', confirmed: false }])
  const removeActivity = (idx) => setActivities((prev) => prev.filter((_, i) => i !== idx))
  const updateActivity = (idx, field, value) => setActivities((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)))
  const confirmActivity = (idx) => setActivities((prev) => prev.map((a, i) => (i === idx ? { ...a, confirmed: true } : a)))

  const canCreate = () => {
    const hasTitle = title.trim().length > 0
    const hasDescription = description.trim().length > 0
    const hasConfirmedActivity = activities.some(a => a.confirmed && a.target && Number(a.target) > 0)
    return hasTitle && hasDescription && hasConfirmedActivity
  }

  const submit = async () => {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) { setError('Invalid dates'); return }
    if (end <= start) { setError('End date must be after start date'); return }

    const payloadActivities = activities
      .map((a) => {
        const name = a.name
        let target = Number(a.target)
        if (!Number.isFinite(target) || target <= 0) return null
        let unit = a.unit
        if (name === 'run' || name === 'bike' || name === 'walk') {
          unit = 'meters'
        }
        if (name === 'plank') {
          unit = 'minutes'
        }
        if (name === 'push-ups' || name === 'sit-ups' || name === 'squats') {
          unit = 'times'
        }
        return { name, target: Math.round(target), unit }
      })
      .filter(Boolean)

    setLoading(true)
    try {
      const token = authStore.get()
          await ChallengeService.create({
        title: title.trim(),
        description: description.trim(),
        activities: payloadActivities,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }, token)
      onSuccess?.()
    } catch (e) {
      setError(e.message || 'Error creating challenge')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className={styles.formGroup}>
        <Input id="ch-title" name="ch-title" label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="100k Running Challenge" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="ch-description" className="form-label">Description</label>
        <textarea id="ch-description" className={`form-input ${styles.textAreaSm}`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain the challenge" rows={5} />
      </div>
      <div className={styles.rowDates}>
        <div className={styles.colDate}>
          <label htmlFor="startDate" className="form-label">Start date</label>
          <input id="startDate" name="startDate" type="date" className="form-input" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value) }} />
        </div>
        <div className={styles.colDate}>
          <label htmlFor="endDate" className="form-label">End date</label>
          <input id="endDate" name="endDate" type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
        </div>
      </div>

      <div className={styles.activities}>
        <h3 className={styles.activitiesTitle}>Activities</h3>
        {activities.map((a, idx) => (
          <div key={idx} className={styles.activityRow}>
            <div className={styles.activityInputs}>
              <select
                value={a.name}
                onChange={(e) => updateActivity(idx, 'name', e.target.value)}
                className={`form-input ${styles.selectType}`}
                disabled={a.confirmed}
              >
                {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="number"
                min="1"
                value={a.target}
                onChange={(e) => updateActivity(idx, 'target', e.target.value)}
                className={`form-input ${styles.inputNumber}`}
                placeholder="0"
                disabled={a.confirmed}
              />
              <span className={styles.unitLabel}>{getUnitForType(a.name)}</span>
              {!a.confirmed ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!a.target || Number(a.target) <= 0) return
                    updateActivity(idx, 'unit', getUnitForType(a.name))
                    confirmActivity(idx)
                  }}
                  className={styles.confirmBtn}
                >✓</button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeActivity(idx)}
                  className={styles.removeBtn}
                >×</button>
              )}
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addActivity}>+</Button>
      </div>
      {error && <div className={`text-error ${styles.error}`}>{error}</div>}
      <Button onClick={submit} loading={loading} disabled={loading || !canCreate()}>Create</Button>
    </div>
  )
}


