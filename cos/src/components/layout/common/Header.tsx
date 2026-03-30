// components/layouts/Header.tsx
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 px-5 border-b h-14 border-border bg-background shrink-0">
      {/* Page title */}
      <span className="text-[15px] font-semibold text-foreground mr-2">Dashboard</span>

      {/* Search bar */}
      <div className="flex-1 max-w-sm">
        <div className="relative flex items-center">
          <Search className="absolute w-4 h-4 left-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="VIN, Model, Auction ID"
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-muted/50 border border-border rounded-md outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Switch to buyer */}
        <button className="h-8 px-4 text-[13px] font-medium border rounded-md border-border text-foreground hover:bg-muted transition-colors">
          Switch to buyer
        </button>

        {/* Add a car */}
        <button className="h-8 px-4 text-[13px] font-semibold rounded-md bg-[#FF5722] text-white hover:bg-[#e04e1e] transition-colors">
          Add a car
        </button>

        {/* Message icon */}
        <button className="flex items-center justify-center w-8 h-8 transition-colors rounded-full text-muted-foreground hover:bg-muted">
          <MessageSquare className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 transition-colors rounded-full text-muted-foreground hover:bg-muted">
          <Bell className="w-[18px] h-[18px]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 overflow-hidden rounded-full bg-muted">
            <img
              src="https://i.pravatar.cc/32"
              alt="User"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-muted-foreground">Welcome</span>
            <span className="text-[13px] font-semibold text-foreground">Azhar Khan</span>
          </div>
        </div>
      </div>
    </header>
  )
}