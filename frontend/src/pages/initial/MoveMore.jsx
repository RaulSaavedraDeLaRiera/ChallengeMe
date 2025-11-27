import { Link } from 'react-router-dom'
import styles from './Welcome.module.css'

const strengthBlocks = [
  { title: 'Power ladder', detail: '5 × 10 squat jumps + 5 × 15 air squats', tag: 'Lower body' },
  { title: 'Sprint matrix', detail: '6 × 200 m hill sprints · 60\" rest', tag: 'Track' },
  { title: 'Rowing engine', detail: '4 × 750 m row · goal pace sub 3:00', tag: 'Row' }
]

const modalities = [
  { metric: '45\'', label: 'Average hybrid session duration' },
  { metric: '3', label: 'Modalities stacked per block' },
  { metric: '12', label: 'Community templates unlocked weekly' }
]

const MoveMore = () => {
  return (
    <div className={styles.infoPage}>
      <header className={styles.infoHero}>
        <div>
          <p className={styles.infoPill}>Move more, live better</p>
          <h1>Mix cycling, running and calisthenics in one flow</h1>
          <p>
            This tour shows how squads combine squats, rowers, bikes and tempo runs to keep anaerobic
            work playful. Each block syncs with the ChallengeMe tracker, so your streak stays alive
            even when you switch disciplines.
          </p>
          <div className={styles.infoActions}>
            <Link to="/login" className="btn btn-primary">
              Join the challenge feed
            </Link>
            <Link to="/community" className="btn btn-secondary">
              Community showcase
            </Link>
          </div>
        </div>
        <div className={styles.infoHeroPanel}>
          <h3>Today’s combo</h3>
          <ul>
            <li>
              <span>Warm-up</span>
              <strong>800 m easy jog + mobility</strong>
            </li>
            <li>
              <span>Strength</span>
              <strong>4 × 12 weighted squats @  tempo 3-1-1</strong>
            </li>
            <li>
              <span>Conditioning</span>
              <strong>10 km tempo ride · 85 RPM</strong>
            </li>
            <li>
              <span>Finisher</span>
              <strong>Core flow + box breathing</strong>
            </li>
          </ul>
        </div>
      </header>

      <section className={styles.infoGrid}>
        {strengthBlocks.map((block) => (
          <article key={block.title} className={styles.infoCard}>
            <header>{block.tag}</header>
            <h3>{block.title}</h3>
            <p>{block.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.infoSection}>
        <div>
          <p className={styles.sectionEyebrow}>Stacking plan</p>
          <h2>Structure your week like the pro clubs</h2>
          <p className={styles.sectionDescription}>
            Monday is lower-body strength, Wednesday is sprint work, Friday is bike or row. Add the
            optional weekend trek for extra points. Each template is preloaded so you only tap
            “start” and ChallengeMe logs reps, distance and effort.
          </p>
          <ul className={styles.sectionList}>
            <li>Auto-progression: intensity nudges up when you mark a block as “crushed”.</li>
            <li>Session recaps ready to share in the dashboard feed.</li>
            <li>Dual timers for rest intervals and cadence cues.</li>
          </ul>
        </div>
        <div className={styles.sectionPanel}>
          <div className={styles.sectionStatsGrid}>
            {modalities.map((item) => (
              <article key={item.label} className={styles.sectionStatCard}>
                <strong>{item.metric}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.infoFooterCta}>
        <div>
          <h3>Ready to log your first multi-modality block?</h3>
          <p>Sign in, clone any template and the dashboard will track every rep automatically.</p>
        </div>
        <div className={styles.infoFooterButtons}>
          <Link to="/login" className="btn btn-primary">
            Sign in and start stacking
          </Link>
          <Link to="/welcome" className="btn btn-secondary">
            Return to welcome
          </Link>
        </div>
      </section>
    </div>
  )
}

export default MoveMore

