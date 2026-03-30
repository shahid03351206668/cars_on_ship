// components/layouts/app-layout.tsx
import { useState } from 'react'
import { 
  House, 
  Car, 
  Tag, 
  MessageSquare, 
  MapPin, 
  Handshake, 
  Layers,
  LogOut
} from 'lucide-react'
import Header from './Header'
import { SidebarItem } from './sidebar-item'
import { useAuthStore } from '@/store/auth'

export type SidebarItemType = {
  label: string
  icon?: React.ReactNode
  url: string
  children?: SidebarItemType[]
}

const MenuItems: SidebarItemType[] = [
  { 
    label: 'Dashboard', 
    icon: <House className="w-[18px] h-[18px]" />, 
    url: '/dashboard' 
  },
  { 
    label: 'My Cars', 
    icon: <Car className="w-[18px] h-[18px]" />, 
    url: '/app/my-cars' 
  },
  { 
    label: 'All Offers', 
    icon: <Tag className="w-[18px] h-[18px]" />, 
    url: '/app/offers' 
  },
  { 
    label: 'Messages', 
    icon: <MessageSquare className="w-[18px] h-[18px]" />, 
    url: '/app/messages' 
  },
  { 
    label: 'Tracking', 
    icon: <MapPin className="w-[18px] h-[18px]" />, 
    url: '/app/tracking' 
  },
  { 
    label: 'Deals', 
    icon: <Handshake className="w-[18px] h-[18px]" />, 
    url: '/app/deals' 
  },
  {
    label: 'Others',
    icon: <Layers className="w-[18px] h-[18px]" />,
    url: '#',
    children: [
      { label: 'Wallet / Payments', url: '/app/wallet' },
      { label: 'Advance Received', url: '/app/advances' },
      { label: 'Help & Support', url: '/app/support' },
      { label: 'Notifications', url: '/app/notifications' },
      { label: 'Profile & Settings', url: '/app/profile' },
    ],
  },
]

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — fixed width, always expanded, pure black */}
      <aside className="flex flex-col w-[210px] shrink-0 bg-[#1a1a1a] text-white">
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center px-4 border-b border-white/[0.08]">
          {/* Replace with actual logo/brand component */}
          <span className="text-sm font-semibold tracking-wide text-white">
            Cars on Ship
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {MenuItems.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-2 border-t border-white/[0.08] shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-[11px] border-t border-white/[0.08] shrink-0 text-white/25">
          © 2026 Tasksy
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}