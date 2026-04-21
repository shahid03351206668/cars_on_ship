import { LogOut } from 'lucide-react'
import Header from './Header'
import { SidebarItem } from './sidebar-item'
import { useAuthStore, type AuthState } from '@/store/auth'
import logo from '../../../assets/logo.jfif'

export type SidebarItemType = {
  label: string
  icon?: React.ReactNode
  url: string
  children?: SidebarItemType[]
}

type HeaderProps = {
  title?: string
  searchPlaceholder?: string
  actions?: React.ReactNode
}

type AppLayoutProps = {
  children?: React.ReactNode
  menuItems: SidebarItemType[]
  headerProps?: HeaderProps
}

export function AppLayout({ children, menuItems, headerProps }: AppLayoutProps) {
  const logout = useAuthStore((state: AuthState) => state.logout)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex flex-col w-[210px] shrink-0 bg-[#1a1a1a] text-white">
        <div className="flex h-14 shrink-0 items-center px-4 border-b border-white/[0.08] bg-white">
          <img src={logo} alt="Company Logo" className="object-contain w-10 h-10" />
          <span className="text-sm font-semibold tracking-wide text-black">Cars on Ship</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {menuItems.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </nav>

        <div className="px-2 py-2 border-t border-white/[0.08] shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>

        <div className="px-4 py-3 text-[11px] border-t border-white/[0.08] shrink-0 text-white">
          © 2026 COS
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header {...headerProps} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}