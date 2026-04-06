// components/layout/common/sidebar-item.tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export type SidebarItemType = {
  label: string
  icon?: React.ReactNode
  url: string
  children?: SidebarItemType[]
}

type SidebarItemProps = {
  item: SidebarItemType
}

export function SidebarItem({ item }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(p => !p)}
          className="flex items-center w-full gap-3 px-3 py-[9px] text-[13px] font-medium transition-colors rounded-md text-white/60 hover:bg-white/[0.08] hover:text-white"
        >
          <span className="flex items-center justify-center w-[18px] h-[18px] shrink-0 text-white/50">
            {item.icon}
          </span>
          <span className="flex-1 text-left truncate">{item.label}</span>
          <ChevronRight
            className={`h-[14px] w-[14px] shrink-0 text-white/30 transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="mt-0.5 ml-[18px] space-y-0.5 border-l border-white/[0.08] pl-3">
            {item.children!.map((child, index) => (
              <NavLink
                key={index}
                to={child.url}
                end  // ← Add here too
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-2 rounded-md px-3 py-[7px] text-[13px] transition-colors ${
                    isActive
                      ? 'bg-white text-black font-medium'
                      : 'text-white hover:bg-white/[0.08] hover:text-white'
                  }`
                }
              >
                {child.icon && (
                  <span className="flex items-center justify-center w-4 h-4 shrink-0">
                    {child.icon}
                  </span>
                )}
                <span className="truncate">{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.url}
      end  // ← Add this line
      className={({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-[9px] text-[13px] font-medium transition-colors rounded-md ${
          isActive
            ? 'bg-white'
            : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
        }`
      }
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          <span className={`flex items-center justify-center w-[18px] h-[18px] shrink-0 transition-colors ${
            isActive ? 'text-black' : 'text-white/50'
          }`}>
            {item.icon}
          </span>
          <span className={`truncate ${isActive ? 'text-black' : ''}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}