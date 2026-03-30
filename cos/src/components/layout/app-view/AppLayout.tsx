import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import Footer from '../common/Footer'

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}