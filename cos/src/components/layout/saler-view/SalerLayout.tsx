import { House, Car, Tag, MessageSquare, MapPin, Handshake, Layers } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppLayout, type SidebarItemType } from '../common/Sidebar'

const menuItems: SidebarItemType[] = [
  { label: 'Dashboard', icon: <House className="w-[18px] h-[18px]" />, url: '/seller' },
  { label: 'My Cars', icon: <Car className="w-[18px] h-[18px]" />, url: '/app/my-cars' },
  { label: 'All Offers', icon: <Tag className="w-[18px] h-[18px]" />, url: '/app/offers' },
  { label: 'Messages', icon: <MessageSquare className="w-[18px] h-[18px]" />, url: '/app/messages' },
  { label: 'Tracking', icon: <MapPin className="w-[18px] h-[18px]" />, url: '/app/tracking' },
  { label: 'Deals', icon: <Handshake className="w-[18px] h-[18px]" />, url: '/app/deals' },
  {
    label: 'Others',
    icon: <Layers className="w-[18px] h-[18px]" />,
    url: '#',
    children: [
      { label: 'Wallet / Payments', url: '/seller/wallet' },
      { label: 'Help & Support', url: '/seller/help-support' },
      { label: 'Notifications', url: '/seller/notifications' },
      { label: 'Profile & Settings', url: '/seller/profile-settings' },
    ],
  },
]

export default function SalerLayout() {
  const navigate = useNavigate()

  return (
    <AppLayout
      menuItems={menuItems}
      headerProps={{
        title: 'Dashboard',
        searchPlaceholder: 'VIN, Model, Auction ID',
        actions: (
          <>
            <button className="h-8 px-4 text-[13px] font-medium border rounded-md border-border text-foreground hover:bg-muted transition-colors">
              Switch to buyer
            </button>
            <button
              onClick={() => navigate('/seller/addcar')}
              className="h-8 px-4 text-[13px] font-semibold rounded-md bg-[#FF5722] text-white hover:bg-[#e04e1e] transition-colors"
            >
              Add a car
            </button>
          </>
        ),
      }}
    >
      <Outlet />
    </AppLayout>
  )
}