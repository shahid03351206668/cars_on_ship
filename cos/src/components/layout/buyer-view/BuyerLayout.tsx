import { House, Search, Tag, MessageSquare, MapPin, Handshake, Layers } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppLayout, type SidebarItemType } from '../common/Sidebar'

const menuItems: SidebarItemType[] = [
  { label: 'Dashboard', icon: <House className="w-[18px] h-[18px]" />, url: '/buyer' },
  { label: 'Browse Cars', icon: <Search className="w-[18px] h-[18px]" />, url: '/buyer/browse' },
  { label: 'My Offers', icon: <Tag className="w-[18px] h-[18px]" />, url: '/buyer/myoffer' },
  { label: 'Messages', icon: <MessageSquare className="w-[18px] h-[18px]" />, url: '/buyer/messages' },
  { label: 'Tracking', icon: <MapPin className="w-[18px] h-[18px]" />, url: '/buyer/tracking' },
  { label: 'Deals', icon: <Handshake className="w-[18px] h-[18px]" />, url: '/buyer/deals' },
  {
    label: 'Others',
    icon: <Layers className="w-[18px] h-[18px]" />,
    url: '#',
    children: [
      { label: 'Wallet / Payments', url: '/buyer/wallet' },
      { label: 'Help & Support', url: '/buyer/help-support' },
      { label: 'Notifications', url: '/buyer/notifications' },
      { label: 'Profile & Settings', url: '/buyer/profile-settings' },
    ],
  },
]

export default function BuyerLayout() {
  const navigate = useNavigate()

  return (
    <AppLayout
      menuItems={menuItems}
      headerProps={{
        title: 'Dashboard',
        searchPlaceholder: 'Search cars, auctions...',
        actions: (
          <>
            <button className="h-8 px-4 text-[13px] font-medium border rounded-md border-border text-foreground hover:bg-muted transition-colors">
              Switch to seller
            </button>
            <button
              onClick={() => navigate('/buyer/browse')}
              className="h-8 px-4 text-[13px] font-semibold rounded-md bg-[#FF5722] text-white hover:bg-[#e04e1e] transition-colors"
            >
              Browse Cars
            </button>
          </>
        ),
      }}
    >
      <Outlet />
    </AppLayout>
  )
}