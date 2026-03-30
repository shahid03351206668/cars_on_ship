import { Outlet } from 'react-router-dom'
import {AppLayout} from '../common/Sidebar'

export default function SalerLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
          
  )
}
