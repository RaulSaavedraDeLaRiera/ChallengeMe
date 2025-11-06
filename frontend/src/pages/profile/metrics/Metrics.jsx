import { useState, useEffect, useMemo } from 'react'
import { Bar as BarChart, Pie as PieChart } from 'react-chartjs-2'

void BarChart
void PieChart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { FaRunning, FaBicycle, FaWalking, FaDumbbell, FaHeart, FaStar, FaHandRock, FaFistRaised } from 'react-icons/fa'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { authStore } from '../../../utils/authStore'
import styles from './Metrics.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ACTIVITY_CONFIG = {
  'run': { Icon: FaRunning, color: 'rgba(0, 171, 169, 1)', name: 'Run' },
  'bike': { Icon: FaBicycle, color: 'rgba(255, 87, 34, 1)', name: 'Bike' },
  'walk': { Icon: FaWalking, color: 'rgba(76, 175, 80, 1)', name: 'Walk' },
  'push-ups': { Icon: FaHandRock, color: 'rgba(255, 152, 0, 1)', name: 'Push-ups' },
  'sit-ups': { Icon: FaDumbbell, color: 'rgba(156, 39, 176, 1)', name: 'Sit-ups' },
  'squats': { Icon: FaFistRaised, color: 'rgba(33, 150, 243, 1)', name: 'Squats' },
  'plank': { Icon: FaHeart, color: 'rgba(233, 30, 99, 1)', name: 'Plank' },
  'other': { Icon: FaStar, color: 'rgba(158, 158, 158, 1)', name: 'Other' }
}

const ACTIVITY_BASE_RULES = {
  'run': { divisor: 300, note: 'Run = 300m', outputUnit: 'meters', outputLabel: 'km' },
  'walk': { divisor: 600, note: 'Walk = 600m', outputUnit: 'meters', outputLabel: 'km' },
  'bike': { divisor: 1000, note: 'Bike = 1km', outputUnit: 'meters', outputLabel: 'km' },
  'push-ups': { divisor: 10, note: 'Push-ups = 10 reps', outputUnit: 'times', outputLabel: 'reps' },
  'sit-ups': { divisor: 15, note: 'Sit-ups = 15 reps', outputUnit: 'times', outputLabel: 'reps' },
  'squats': { divisor: 20, note: 'Squats = 20 reps', outputUnit: 'times', outputLabel: 'reps' },
  'plank': { divisor: 1, note: 'Plank = 1min', outputUnit: 'minutes', outputLabel: 'min' },
  'other': { divisor: 1, note: '', outputUnit: '', outputLabel: '' }
}

const pieValuePlugin = {
  id: 'pieValuePlugin',
  afterDatasetsDraw(chart, args, opts) {
    const options = opts || {}
    const getText = typeof options.getText === 'function' ? options.getText : null
    const getPercentage = typeof options.getPercentage === 'function' ? options.getPercentage : null
    const minPercentage = typeof options.minPercentage === 'number' ? options.minPercentage : 5

    if (!getText) {
      return
    }

    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)

    meta.data.forEach((element, index) => {
      const label = getText(index)
      if (!label) {
        return
      }

      const percentage = getPercentage ? getPercentage(index) : 100
      if (percentage < minPercentage) {
        return
      }

      const { x, y } = element.tooltipPosition()
      ctx.save()
      ctx.font = '600 11px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
      ctx.shadowBlur = 2
      ctx.fillText(label, x, y)
      ctx.restore()
    })
  }
}

const normalizeProgress = (activityName, unit, value) => {
  const amount = Number(value) || 0
  if (amount <= 0) {
    return 0
  }

  const config = ACTIVITY_BASE_RULES[activityName] || ACTIVITY_BASE_RULES['other']
  const divisor = config.divisor || 1

  if (unit === 'meters' || unit === 'times' || unit === 'minutes') {
    return Math.max(1, Math.ceil(amount / divisor))
  }

  return Math.max(1, Math.ceil(amount))
}

const formatKilometers = (meters) => {
  const km = (Number(meters) || 0) / 1000
  if (km === 0) {
    return '0km'
  }

  if (km >= 100) {
    return `${Math.round(km)}km`
  }

  if (km >= 10) {
    return `${km.toFixed(1).replace(/\.0$/, '')}km`
  }

  return `${parseFloat(km.toFixed(2)).toString()}km`
}

const formatCount = (value, suffix) => {
  const amount = Number(value) || 0
  return `${amount}${suffix}`
}

const formatMinutes = (value) => {
  const amount = Number(value) || 0
  return `${parseFloat(amount.toFixed(2)).toString()}min`
}

const formatActivityTotal = (activityName, unit, rawValue) => {
  const config = ACTIVITY_BASE_RULES[activityName] || ACTIVITY_BASE_RULES['other']

  if (unit === 'meters' || config.outputUnit === 'meters') {
    return formatKilometers(rawValue)
  }

  if (unit === 'minutes' || config.outputUnit === 'minutes') {
    return formatMinutes(rawValue)
  }

  const suffix = config.outputLabel || unit || ''
  const normalizedSuffix = suffix ? ` ${suffix}` : ''
  return formatCount(rawValue, normalizedSuffix)
}

const cleanTitle = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Challenge'
  }
  return value.trim()
}

const arraysEqual = (a, b) => {
  if (a === b) return true
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const Metrics = () => {
  const [userChallenges, setUserChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChallengeIds, setSelectedChallengeIds] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])

  useEffect(() => {
    const load = async () => {
      const token = authStore.get()
      if (!token) {
        setUserChallenges([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const allUC = await UserChallengeService.all(token)
        setUserChallenges(Array.isArray(allUC) ? allUC : [])
      } catch {
        setUserChallenges([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const allActivities = useMemo(() => {
    const activitiesMap = new Map()

    if (Array.isArray(userChallenges)) {
      userChallenges.forEach(uc => {
        if (uc.challenge?.activities && Array.isArray(uc.challenge.activities)) {
          uc.challenge.activities.forEach(activity => {
            if (activity?.name) {
              const name = activity.name.toLowerCase()
              if (!activitiesMap.has(name)) {
                activitiesMap.set(name, activity.unit || 'times')
              }
            }
          })
        }
      })
    }

    const activities = Array.from(activitiesMap.keys()).sort()
    return { activities, units: activitiesMap }
  }, [userChallenges])

  useEffect(() => {
    if (allActivities.activities.length > 0 && selectedActivities.length === 0) {
      setSelectedActivities([...allActivities.activities])
    }
  }, [allActivities.activities, selectedActivities.length])

  useEffect(() => {
    if (!Array.isArray(userChallenges) || userChallenges.length === 0) {
      if (selectedChallengeIds.length > 0) {
        setSelectedChallengeIds([])
      }
      return
    }

    setSelectedChallengeIds(prev => {
      const availableIds = userChallenges.map(uc => uc._id)
      const preserved = prev.filter(id => availableIds.includes(id))

      if (preserved.length > 0) {
        return arraysEqual(preserved, prev) ? prev : preserved
      }

      const defaults = availableIds.slice(0, 3)
      return arraysEqual(defaults, prev) ? prev : defaults
    })
  }, [userChallenges, selectedChallengeIds.length])

  const selectedChallenges = useMemo(() => {
    if (!Array.isArray(userChallenges) || userChallenges.length === 0) {
      return []
    }

    const map = new Map(userChallenges.map(uc => [uc._id, uc]))
    return selectedChallengeIds
      .map(id => map.get(id))
      .filter(Boolean)
  }, [userChallenges, selectedChallengeIds])

  const barChartData = useMemo(() => {
    if (!selectedChallenges.length) {
      return { labels: [], datasets: [], conversionNotes: [] }
    }

    const activityKeys = new Set()
    const conversionNotes = new Set()

    const summaries = selectedChallenges.map(uc => {
      const totals = {}
      const rawTotals = {}
      const units = {}

      if (Array.isArray(uc.activitiesProgress)) {
        uc.activitiesProgress.forEach(ap => {
          const activityName = ap.activityId?.toLowerCase()
          if (!activityName) {
            return
          }

          if (selectedActivities.length > 0 && !selectedActivities.includes(activityName)) {
            return
          }

          const unit = allActivities.units.get(activityName) || 'times'
          const normalized = normalizeProgress(activityName, unit, ap.progress || 0)
          if (!totals[activityName]) {
            totals[activityName] = 0
          }
          if (!rawTotals[activityName]) {
            rawTotals[activityName] = 0
          }

          totals[activityName] += normalized
          rawTotals[activityName] += Number(ap.progress) || 0
          units[activityName] = unit
          activityKeys.add(activityName)

          const baseRule = ACTIVITY_BASE_RULES[activityName]
          if (baseRule?.note) {
            conversionNotes.add(baseRule.note)
          }
        })
      }

      const title = cleanTitle(uc.challenge?.title)
      return {
        id: uc._id,
        label: title,
        totals,
        rawTotals,
        units
      }
    })

    const activities = Array.from(activityKeys)
    if (!activities.length) {
      return {
        labels: summaries.map(summary => summary.label),
        datasets: [],
        conversionNotes: Array.from(conversionNotes).sort()
      }
    }

    const datasets = activities.map(activity => {
      const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG['other']
      return {
        label: config.name,
        activityKey: activity,
        data: summaries.map(summary => summary.totals[activity] || 0),
        backgroundColor: config.color,
        borderColor: config.color,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        stack: 'effort',
        rawValues: summaries.map(summary => summary.rawTotals[activity] || 0),
        units: summaries.map(summary => summary.units[activity] || 'times')
      }
    })

    return {
      labels: summaries.map(summary => summary.label),
      datasets,
      conversionNotes: Array.from(conversionNotes).sort()
    }
  }, [selectedChallenges, selectedActivities, allActivities.units])

  const doughnutChartData = useMemo(() => {
    if (!Array.isArray(userChallenges) || userChallenges.length === 0) {
      return { labels: [], datasets: [], activityKeys: [], rawValues: [], units: [], percentages: [], inlineValues: [] }
    }

    const totals = {}
    const rawTotals = {}
    const unitsByActivity = {}

    userChallenges.forEach(uc => {
      if (!Array.isArray(uc.activitiesProgress)) {
        return
      }

      uc.activitiesProgress.forEach(ap => {
        const activityName = ap.activityId?.toLowerCase()
        if (!activityName) {
          return
        }

        if (!totals[activityName]) {
          totals[activityName] = 0
        }
        if (!rawTotals[activityName]) {
          rawTotals[activityName] = 0
        }

        const unit = allActivities.units.get(activityName) || 'times'
        unitsByActivity[activityName] = unit
        const progressValue = normalizeProgress(activityName, unit, ap.progress || 0)
        totals[activityName] += progressValue
        rawTotals[activityName] += Number(ap.progress) || 0
      })
    })

    const activities = Object.keys(totals).sort()
    if (!activities.length) {
      return { labels: [], datasets: [], activityKeys: [], rawValues: [], units: [], percentages: [], inlineValues: [] }
    }

    const totalSum = activities.reduce((sum, key) => sum + totals[key], 0)
    const percentages = activities.map(key => (totalSum > 0 ? (totals[key] / totalSum) * 100 : 0))

    const labels = activities.map(key => {
      const config = ACTIVITY_CONFIG[key] || ACTIVITY_CONFIG['other']
      return config.name
    })
    const data = activities.map(key => totals[key])
    const colors = activities.map(key => {
      const config = ACTIVITY_CONFIG[key] || ACTIVITY_CONFIG['other']
      return config.color.replace('1)', '0.8)')
    })
    const borderColors = activities.map(key => {
      const config = ACTIVITY_CONFIG[key] || ACTIVITY_CONFIG['other']
      return config.color
    })
    const rawValues = activities.map(key => rawTotals[key] || 0)
    const unitsList = activities.map(key => unitsByActivity[key] || 'times')
    const inlineValues = activities.map((key, index) => {
      const formatted = formatActivityTotal(key, unitsByActivity[key] || 'times', rawTotals[key] || 0)
      const percentage = percentages[index]
      return percentage >= 5 ? formatted : ''
    })

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2
      }],
      activityKeys: activities,
      rawValues,
      units: unitsList,
      percentages,
      inlineValues
    }
  }, [userChallenges, allActivities])

  const toggleActivity = (activity) => {
    setSelectedActivities(prev => {
      if (prev.includes(activity)) {
        if (prev.length === 1) {
          return [...allActivities.activities]
        }
        return prev.filter(item => item !== activity)
      }
      return [...prev, activity]
    })
  }

  const selectAllActivities = () => {
    setSelectedActivities([...allActivities.activities])
  }

  const toggleChallenge = (challengeId) => {
    setSelectedChallengeIds(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(id => id !== challengeId)
      }

      if (prev.length >= 3) {
        const [, ...rest] = prev
        return [...rest, challengeId]
      }

      return [...prev, challengeId]
    })
  }

  if (loading) {
    return (
      <div className={styles.metricsContainer}>
        <div className={styles.loadingState}>
          <p>Loading metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.metricsContainer}>
      <h1 className={styles.title}>Your Metrics</h1>

      {doughnutChartData.labels.length > 0 ? (
        <div className={styles.chartContainerSmall}>
          <div className={styles.pieChartWrapper}>
            <PieChart
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const index = context.dataIndex
                        const label = context.chart.data.labels?.[index] || ''
                        const percentage = Math.round(doughnutChartData.percentages?.[index] || 0)
                        const activityKey = doughnutChartData.activityKeys?.[index]
                        const unit = doughnutChartData.units?.[index] || 'times'
                        const rawValue = doughnutChartData.rawValues?.[index] || 0
                        const amount = formatActivityTotal(activityKey, unit, rawValue)
                        return [`${label} ${percentage}%`, amount]
                      }
                    }
                  },
                  pieValuePlugin: {
                    getText: (index) => doughnutChartData.inlineValues?.[index] || '',
                    getPercentage: (index) => doughnutChartData.percentages?.[index] || 0,
                    minPercentage: 5
                  }
                }
              }}
              plugins={[pieValuePlugin]}
            />
          </div>
          <p className={styles.chartDisclaimer}>Select a slice to see details</p>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No activity data available</p>
        </div>
      )}

      {userChallenges.length > 0 && <div className={styles.sectionDivider} />}

      <div className={styles.selectionHeader}>
        <div className={styles.challengeFilter}>
          {(Array.isArray(userChallenges) ? userChallenges : []).map(uc => {
            const isActive = selectedChallengeIds.includes(uc._id)
            const title = cleanTitle(uc.challenge?.title)
            return (
              <button
                key={uc._id}
                className={`${styles.challengeButton} ${isActive ? styles.challengeButtonActive : ''}`}
                onClick={() => toggleChallenge(uc._id)}
                type="button"
                title={title}
              >
                {title}
              </button>
            )
          })}
        </div>
        {userChallenges.length > 0 && (
          <p className={styles.selectionHint}>Select challenges to display below.</p>
        )}
      </div>

      {barChartData.datasets.length > 0 ? (
        <div className={styles.chartContainer}>
          <div className={styles.barChartWrapper}>
            <BarChart
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => {
                        if (!items?.length) {
                          return ''
                        }
                        return items[0].label || ''
                      },
                      label: (context) => {
                        const dataset = context.dataset
                        const activityKey = dataset.activityKey
                        const baseRule = ACTIVITY_BASE_RULES[activityKey] || ACTIVITY_BASE_RULES['other']
                        const normalizedValue = Number(context.raw) || 0
                        const unitDescriptor = baseRule.note ? baseRule.note.split('=')[1]?.trim() : ''
                        const rawValue = dataset.rawValues?.[context.dataIndex] || 0
                        const unit = dataset.units?.[context.dataIndex] || 'times'
                        const formattedTotal = formatActivityTotal(activityKey, unit, rawValue)

                        if (unitDescriptor) {
                          return `${dataset.label}: ${normalizedValue} × ${unitDescriptor} (${formattedTotal})`
                        }
                        return `${dataset.label}: ${formattedTotal}`
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: false
                    },
                    ticks: {
                      color: '#ffffff',
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                      color: 'var(--text-secondary)',
                      font: {
                        size: 11
                      },
                      stepSize: 1,
                      callback: (value) => Math.round(value)
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    }
                  }
                }
              }}
            />
          </div>
          {barChartData.conversionNotes.length > 0 && (
            <p className={styles.chartDisclaimer}>{barChartData.conversionNotes.join(' · ')}</p>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No data for the selected challenges</p>
        </div>
      )}

      {allActivities.activities.length > 0 && (
        <div className={styles.activityFilters}>
          <div className={styles.filtersList}>
            <button
              className={`${styles.filterButton} ${selectedActivities.length === allActivities.activities.length ? styles.activeAll : ''}`}
              onClick={selectAllActivities}
              type="button"
            >
              All
            </button>
            {allActivities.activities.map(activity => {
              const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG['other']
              const IconComponent = config.Icon
              const isSelected = selectedActivities.includes(activity)
              return (
                <button
                  key={activity}
                  className={`${styles.filterButton} ${isSelected ? styles.active : ''}`}
                  onClick={() => toggleActivity(activity)}
                  type="button"
                  style={{
                    backgroundColor: isSelected ? config.color : 'transparent',
                    borderColor: config.color,
                    color: isSelected ? 'white' : config.color
                  }}
                  title={config.name}
                >
                  {IconComponent ? <IconComponent className={styles.filterIcon} /> : null}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Metrics
