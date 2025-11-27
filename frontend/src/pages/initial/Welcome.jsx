// eslint-disable-next-line no-unused-vars
import { Link as RouterLink } from 'react-router-dom'
import styles from './Welcome.module.css'

const featureCards = [
  {
    id: 'community',
    label: 'Community-built challenges',
    title: 'Challenges invented by real athletes',
    description:
      'Push-up ladders, cycling rallies, gravel rides and tempo runs designed by clubs worldwide. See how crews remix workouts and keep each other accountable.',
    bullets: [
      'Live leaderboard with GPS splits and rep counts',
      'Clone & remix any template in under 30 seconds',
      'Club shout-outs every week with digital patches'
    ],
    cta: 'Visit community page'
  },
  {
    id: 'move-more',
    label: 'Move more, live better',
    title: 'Blend cycling, running and calisthenics',
    description:
      'Preview the multi-modality tour: squats, hill sprints, rowing intervals, recovery bike blocks and strength finishers in one synced tracker. Perfect for hybrid athletes who mix disciplines every week.',
    bullets: [
      'Preset squat ladders and sprint matrices',
      'Auto progression when you mark a block “crushed”',
      'Cadence + rest timers ready inside the tracker'
    ],
    cta: 'Explore Move More'
  }
]

const Welcome = () => {
  return (
    <div className={styles.welcomeLanding}>
      <header className={styles.welcomeHero}>
        <div className={styles.heroText}>
          <span className={styles.heroPill}>ChallengeMe</span>
          <h1>
            The social fitness board that makes every workout a shared quest
          </h1>
          <p>
            Create challenges, stack progress with your crew and receive instant feedback from people
            who love moving as much as you do. Explore public stories without sign-in and unlock full
            tracking once you log in.
          </p>
          <div className={styles.heroActions}>
            <RouterLink to="/login" className="btn btn-primary">
              Sign in
            </RouterLink>
            <RouterLink to="/register" className="btn btn-secondary">
              Create account
            </RouterLink>
          </div>
          <div className={styles.heroHighlights}>
            <div>
              <span>+8K</span>
              <p>Community challenges</p>
            </div>
            <div>
              <span>92%</span>
              <p>Report higher consistency</p>
            </div>
            <div>
              <span>24/7</span>
              <p>Live rankings worldwide</p>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroVisualCard}>
            <p className={styles.heroVisualLabel}>Live dashboard</p>
            <div className={styles.heroVisualTrack}>
              <span>HIIT Tempo</span>
              <strong>78%</strong>
              <small>Cardio Team</small>
            </div>
            <div className={styles.heroVisualTrack}>
              <span>Daily steps</span>
              <strong>12,420</strong>
              <small>Goal 10,000</small>
            </div>
            <div className={styles.heroVisualTrack}>
              <span>Active streak</span>
              <strong>Day 6</strong>
              <small>7-day block</small>
            </div>
            <p className={styles.heroVisualFooter}>Challenges sync across every device</p>
          </div>
        </div>
      </header>

      <section className={styles.welcomeFeatureGrid}>
        {featureCards.map((card) => (
          <div key={card.id} className={styles.welcomeFeatureCard}>
            <p>{card.label}</p>
            <h3>{card.title}</h3>
            <p className={styles.featureDescription}>{card.description}</p>
            <ul>
              {card.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <RouterLink to={`/${card.id}`} className={`btn btn-primary ${styles.featureBtn}`}>
              {card.cta}
            </RouterLink>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Welcome

