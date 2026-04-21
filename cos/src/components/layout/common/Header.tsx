import { Search, Bell, MessageSquare } from 'lucide-react'

type HeaderProps = {
  title?: string
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export default function Header({ title = 'Dashboard', searchPlaceholder = 'Search...', actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 px-5 border-b h-14 border-border bg-background shrink-0">
      <span className="text-[15px] font-semibold text-foreground mr-2">{title}</span>

      <div className="flex-1 max-w-sm">
        <div className="relative flex items-center">
          <Search className="absolute w-4 h-4 left-3 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-muted/50 border border-border rounded-md outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {actions}

        <button className="flex items-center justify-center w-8 h-8 transition-colors rounded-full text-muted-foreground hover:bg-muted">
          <MessageSquare className="w-[18px] h-[18px]" />
        </button>

        <button className="relative flex items-center justify-center w-8 h-8 transition-colors rounded-full text-muted-foreground hover:bg-muted">
          <Bell className="w-[18px] h-[18px]" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 overflow-hidden rounded-full bg-muted">
            <img src="https://i.pravatar.cc/32" alt="User" className="object-cover w-full h-full" />
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