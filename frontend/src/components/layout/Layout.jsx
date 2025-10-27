import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import styles from './Layout.module.css'

//main layout: provides structure with nav for main pages
const Layout = () => { 
  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout

