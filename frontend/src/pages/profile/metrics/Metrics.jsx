import { useState, useEffect, useMemo } from 'react'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { FaRunning, FaBicycle, FaWalking, FaDumbbell, FaHeart, FaStar, FaHandRock, FaFistRaised } from 'react-icons/fa'
import { UserChallengeService } from '../../../services/userChallenge.service'
import { authStore } from '../../../utils/authStore'
import styles from './Metrics.module.css'

//register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

//activity mapping: icon component, color
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

//helper function to format meters (divide by 100 for display)
const formatMeters = (meters) => {
  if (!meters || meters === 0) return 0
  return Math.round(meters / 100)
}

const Metrics = () => {
  const [userChallenges, setUserChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('week') // week, month, total
  const [selectedActivities, setSelectedActivities] = useState([])

  //load all user challenges
  useEffect(() => {
    const load = async () => {
      const token = authStore.get()
      if (!token) {
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

  //find join date
  const earliestJoinDate = useMemo(() => {
    if (!Array.isArray(userChallenges) || userChallenges.length === 0) {
      return null
    }
    
    const dates = userChallenges
      .map(uc => new Date(uc.joinedAt || uc.createdAt || uc.created_at || new Date()))
      .filter(d => !isNaN(d.getTime()))
    
    if (dates.length === 0) return null
    
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    return earliest
  }, [userChallenges])

  //calculate date range 
  const dateRange = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    let startDate
    
    if (!earliestJoinDate) {
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // default to week
    } else {
      const earliest = new Date(earliestJoinDate)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      switch (timeFilter) {
        case 'week': {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          startDate = earliest > weekAgo ? earliest : weekAgo
          //if joined today is use yesterday
          if (earliest.toDateString() === today.toDateString()) {
            startDate = yesterday
          }
          break
        }
        case 'month': {
          const monthAgo = new Date(today)
          monthAgo.setDate(monthAgo.getDate() - 30)
          startDate = earliest > monthAgo ? earliest : monthAgo
          //if joined today is use yesterday
          if (earliest.toDateString() === today.toDateString()) {
            startDate = yesterday
          }
          break
        }
        case 'total': {
          startDate = earliest
          //if joined today is use yesterday
          if (earliest.toDateString() === today.toDateString()) {
            startDate = yesterday
          }
          break
        }
        default:
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }
    
    return { startDate, endDate: today }
  }, [earliestJoinDate, timeFilter])

  //filter user challenges with range
  const filteredUserChallenges = useMemo(() => {
    if (!Array.isArray(userChallenges)) {
      return []
    }
    
    const { startDate, endDate } = dateRange
    
    const filtered = userChallenges.filter(uc => {
      const updateDate = new Date(uc.updatedAt || uc.updated_at || uc.completedAt || uc.joinedAt || uc.createdAt || new Date())
      return updateDate >= startDate && updateDate <= endDate
    })
    
    return filtered
  }, [userChallenges, dateRange])

  //extract all the names of the activities and their type
  const allActivities = useMemo(() => {
    const activitiesMap = new Map()
    
    filteredUserChallenges.forEach(uc => {
      if (uc.challenge?.activities && Array.isArray(uc.challenge.activities)) {
        uc.challenge.activities.forEach(activity => {
          if (activity.name) {
            const name = activity.name.toLowerCase()
            if (!activitiesMap.has(name)) {
              activitiesMap.set(name, activity.unit || 'times')
            }
          }
        })
      }
    })
    
    const activities = Array.from(activitiesMap.keys()).sort()
    return { activities, units: activitiesMap }
  }, [filteredUserChallenges])

  //initialize selected activities to all if empty
  useEffect(() => {
    if (allActivities.activities.length > 0 && selectedActivities.length === 0) {
      setSelectedActivities([...allActivities.activities])
    }
  }, [allActivities.activities.length, selectedActivities.length])

  //process data for line 
  const lineChartData = useMemo(() => {
    if (!filteredUserChallenges.length) {
      return { labels: [], datasets: [] }
    }
    
    const { startDate, endDate } = dateRange
    
    //generate all dates in range
    const dates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    //collect daily progress
    const dailyProgress = {}
    
    dates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0]
      dailyProgress[dateKey] = {}
      allActivities.activities.forEach(activity => {
        dailyProgress[dateKey][activity] = 0
      })
    })
    
    //process each user challenge sum all progress 
    filteredUserChallenges.forEach(uc => {
      if (!uc.activitiesProgress || !Array.isArray(uc.activitiesProgress)) {
        return
      }
      
      uc.activitiesProgress.forEach(ap => {
        const activityName = ap.activityId?.toLowerCase()
        if (!activityName || !allActivities.activities.includes(activityName)) {
          return
        }
        
        //only include selected activities
        if (selectedActivities.length > 0 && !selectedActivities.includes(activityName)) {
          return
        }
        
        const updateDate = new Date(ap.lastUpdated || uc.updatedAt || uc.updated_at || new Date())
        const dateKey = updateDate.toISOString().split('T')[0]
        
        if (dailyProgress[dateKey]) {
          //get unit for this activity
          const unit = allActivities.units.get(activityName) || 'times'
          let currentProgress = ap.progress || 0
          
          //format meters (divide by 100 for display as 100m units)
          if (unit === 'meters') {
            currentProgress = formatMeters(currentProgress)
          }
          
          //sum progress for that day accumulate from all 
          dailyProgress[dateKey][activityName] = (dailyProgress[dateKey][activityName] || 0) + currentProgress
        }
      })
    })
    
    //check if any activity uses meters 
    const hasMetersActivity = allActivities.activities.some(activity => {
      const unit = allActivities.units.get(activity)
      return unit === 'meters'
    })
    
    //create dataset
    const datasets = allActivities.activities
      .filter(activity => selectedActivities.length === 0 || selectedActivities.includes(activity))
      .map((activity) => {
        const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG['other']
        const color = config.color
        
        //calculate cumulative progress total up to each 
        let cumulative = 0
        const cumulativeData = dates.map(date => {
          const dateKey = date.toISOString().split('T')[0]
          const dayTotal = dailyProgress[dateKey][activity] || 0
          cumulative += dayTotal
          return Math.max(0, Math.round(cumulative)) 
          //ensure integer for numbers
        })
        
        return {
          label: config.name,
          data: cumulativeData,
          borderColor: color,
          backgroundColor: color.replace('1)', '0.2)'),
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      })
    
    const labels = dates.map(date => {
      const d = new Date(date)
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    })
    
    return { labels, datasets, hasMetersActivity }
  }, [filteredUserChallenges, allActivities, selectedActivities, dateRange])

  //process data for chart: total by activity
  const doughnutChartData = useMemo(() => {
    if (!filteredUserChallenges.length) {
      return { labels: [], datasets: [] }
    }
    
    const totals = {}
    
    filteredUserChallenges.forEach(uc => {
      if (!uc.activitiesProgress || !Array.isArray(uc.activitiesProgress)) return
      
      uc.activitiesProgress.forEach(ap => {
        const activityName = ap.activityId?.toLowerCase()
        if (!activityName) return
        
        if (!totals[activityName]) {
          totals[activityName] = 0
        }
        
        const unit = allActivities.units.get(activityName) || 'times'
        let progressValue = ap.progress || 0
        if (unit === 'meters') {
          progressValue = formatMeters(progressValue)
        }
        totals[activityName] += progressValue
      })
    })
    
    const activities = Object.keys(totals).sort()
    const totalSum = activities.reduce((sum, a) => sum + totals[a], 0)
    
    const labels = activities.map(a => {
      const config = ACTIVITY_CONFIG[a] || ACTIVITY_CONFIG['other']
      const percentage = totalSum > 0 ? Math.round((totals[a] / totalSum) * 100) : 0
      return `${config.name} ${percentage}%`
    })
    const data = activities.map(a => totals[a])
    const colors = activities.map(a => {
      const config = ACTIVITY_CONFIG[a] || ACTIVITY_CONFIG['other']
      return config.color.replace('1)', '0.8)')
    })
    const borderColors = activities.map(a => {
      const config = ACTIVITY_CONFIG[a] || ACTIVITY_CONFIG['other']
      return config.color
    })
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    }
  }, [filteredUserChallenges, allActivities])

  const toggleActivity = (activity) => {
    if (selectedActivities.includes(activity)) {
      if (selectedActivities.length === 1) {
        //if unchecking the last one we select all
        setSelectedActivities([...allActivities.activities])
      } else {
        setSelectedActivities(selectedActivities.filter(a => a !== activity))
      }
    } else {
      setSelectedActivities([...selectedActivities, activity])
    }
  }

  const selectAllActivities = () => {
    setSelectedActivities([...allActivities.activities])
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

      {/* time filter */}
      <div className={styles.timeFilter}>
        <button
          className={`${styles.timeButton} ${timeFilter === 'week' ? styles.active : ''}`}
          onClick={() => setTimeFilter('week')}
        >
          Week
        </button>
        <button
          className={`${styles.timeButton} ${timeFilter === 'month' ? styles.active : ''}`}
          onClick={() => setTimeFilter('month')}
        >
          Month
        </button>
        <button
          className={`${styles.timeButton} ${timeFilter === 'total' ? styles.active : ''}`}
          onClick={() => setTimeFilter('total')}
        >
          Total
        </button>
      </div>

      {/* line chart */}
      {lineChartData.datasets.length > 0 ? (
        <div className={styles.chartContainer}>
          <div className={styles.lineChartWrapper}>
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${Math.round(context.parsed.y)}`
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: 'var(--text-secondary)',
                      maxRotation: 0,
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'var(--text-secondary)',
                      font: {
                        size: 11
                      },
                      stepSize: 1,
                      callback: function(value) {
                        return Math.round(value)
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
          {lineChartData.hasMetersActivity && (
            <p className={styles.chartDisclaimer}>DISTANCES SHOWN IN 100M UNITS</p>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No data available for the selected period</p>
        </div>
      )}

      {/* activity filters */}
      {allActivities.activities.length > 0 && (
        <div className={styles.activityFilters}>
          <div className={styles.filtersList}>
            <button
              className={`${styles.filterButton} ${selectedActivities.length === allActivities.activities.length ? styles.activeAll : ''}`}
              onClick={selectAllActivities}
            >
              All
            </button>
            {allActivities.activities.map(activity => {
              const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG['other']
              const IconComponent = config.Icon
              return (
                <button
                  key={activity}
                  className={`${styles.filterButton} ${selectedActivities.includes(activity) ? styles.active : ''}`}
                  onClick={() => toggleActivity(activity)}
                  style={{
                    backgroundColor: selectedActivities.includes(activity) ? config.color : 'transparent',
                    borderColor: config.color,
                    color: selectedActivities.includes(activity) ? 'white' : config.color
                  }}
                >
                  <IconComponent className={styles.filterIcon} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* pie chart */}
      {doughnutChartData.labels.length > 0 ? (
        <div className={styles.chartContainerSmall}>
          <div className={styles.pieChartWrapper}>
            <Pie
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
                      label: function(context) {
                        return context.label || ''
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No activity data available</p>
        </div>
      )}
    </div>
  )
}

export default Metrics
