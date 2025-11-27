// eslint-disable-next-line no-unused-vars
import { Link as RouterLink } from 'react-router-dom'
import styles from './Welcome.module.css'

const featuredClubs = [
  {
    title: 'City Push Brigade',
    focus: 'Push-ups & dips',
    detail: 'Morning EMOM sessions on rooftops. 5,400 reps logged last week.'
  },
  {
    title: 'Night Ride Syndicate',
    focus: 'Cycling',
    detail: 'Gravel night rides with live cadence challenges and beacon tracking.'
  },
  {
    title: 'Tempo Hunters',
    focus: 'Running',
    detail: 'Negative-split 5Ks every Thursday—upload GPS and compare lines.'
  }
]

const badges = [
  { label: 'Consistency streaks', value: 'Day 21', info: 'Average streak inside the club' },
  { label: 'Challenge templates', value: '126', info: 'Community blueprints ready to remix' },
  { label: 'Weekly shout-outs', value: '48', info: 'Stories featured on the public board' }
]

const CommunityShowcase = () => {
  return (
    <div className={styles.infoPage}>
      <header className={styles.infoHero}>
        <div>
          <p className={styles.infoPill}>Community-built challenges</p>
          <h1>See what the community invents every day</h1>
          <p>
            The ChallengeMe feed is packed with push-up ladders, bike rallies, long-run recoveries
            and functional strength blocks. Use this page to explore how open challenges work before
            creating your own.
          </p>
          <div className={styles.infoActions}>
            <RouterLink to="/login" className="btn btn-primary">
              Enter live feed
            </RouterLink>
            <RouterLink to="/move-more" className="btn btn-secondary">
              Move More tour
            </RouterLink>
          </div>
        </div>
        <div className={styles.infoHeroPanel}>
          <h3>Live leaderboard mockup</h3>
          <ul>
            <li>
              <span>Push-up Forge</span>
              <strong>225 pts · Ana</strong>
            </li>
            <li>
              <span>Gravel Pulse</span>
              <strong>18 km · Leo</strong>
            </li>
            <li>
              <span>Tempo Pursuit</span>
              <strong>19:42 5K · Noor</strong>
            </li>
            <li>
              <span>Row Core Flow</span>
              <strong>3,000 m · Emi</strong>
            </li>
          </ul>
        </div>
      </header>

      <section className={styles.infoSection}>
        <div>
          <p className={styles.sectionEyebrow}>Clubs & crews</p>
          <h2>Pick a club or start your own</h2>
          <p className={styles.sectionDescription}>
            Each club has its own feed, weekly rituals and badges. Join to see templates, compare
            streaks and unlock collab challenges with friends.
          </p>
          <ul className={styles.sectionList}>
            <li>Auto-sync with Strava, Garmin and Apple Health for validated stats.</li>
            <li>“Clone & remix” button to adapt any challenge to your crew.</li>
            <li>Live chat threads inside every challenge card.</li>
          </ul>
        </div>
        <div className={styles.sectionPanel}>
          {featuredClubs.map((club) => (
            <article key={club.title} className={styles.sectionChallengeCard}>
              <header>
                <span>{club.focus}</span>
              </header>
              <h3>{club.title}</h3>
              <p>{club.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.infoSection} ${styles.infoSectionReverse}`}>
        <div>
          <p className={styles.sectionEyebrow}>Badges & recognition</p>
          <h2>Turn consistency into visible progress</h2>
          <p className={styles.sectionDescription}>
            Weekly shout-outs highlight the fastest splits, the most creative workouts and the most
            supportive comments. Earn digital patches you can showcase in your profile.
          </p>
        </div>
        <div className={styles.sectionPanel}>
          <div className={styles.sectionStatsGrid}>
            {badges.map((badge) => (
              <article key={badge.label} className={styles.sectionStatCard}>
                <strong>{badge.value}</strong>
                <span>{badge.label}</span>
                <small>{badge.info}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.infoFooterCta}>
        <div>
          <h3>Jump into the real-time board</h3>
          <p>Sign in to like, remix or create challenges with your crew in less than 60 seconds.</p>
        </div>
        <div className={styles.infoFooterButtons}>
          <RouterLink to="/login" className="btn btn-primary">
            Sign in now
          </RouterLink>
          <RouterLink to="/welcome" className="btn btn-secondary">
            Return to welcome
          </RouterLink>
        </div>
      </section>
    </div>
  )
}

export default CommunityShowcase

