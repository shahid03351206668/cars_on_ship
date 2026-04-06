// pages/Notifications.tsx
import { ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

interface NotificationSection {
  section: string
  items: Notification[]
}

// ─── Mock data (replace with API calls) ──────────────────────────────────────
const NOTIFICATION_DATA: NotificationSection[] = [
  {
    section: 'Shipment Updates',
    items: [
      { id: 's1', title: 'Shipment Created', description: 'Lorem ipsum adolor sit mate', time: '10m ago', read: false },
      { id: 's2', title: 'In Transit', description: 'Lorem ipsum adolor sit mate', time: '30m ago', read: false },
      { id: 's3', title: 'Customs Cleared', description: 'Lorem ipsum adolor sit mate', time: '1h ago', read: true },
      { id: 's4', title: 'Delivered', description: 'Lorem ipsum adolor sit mate', time: '2h ago', read: true },
      { id: 's5', title: 'Delayed', description: 'Lorem ipsum adolor sit mate', time: '6h ago', read: true },
    ],
  },
  {
    section: 'Wallet & Payments',
    items: [
      { id: 'w1', title: 'Wallet Top-Up Successful', description: 'Lorem ipsum adolor sit mate', time: '10m ago', read: false },
      { id: 'w2', title: 'Payment Deducted', description: 'Lorem ipsum adolor sit mate', time: '30m ago', read: false },
      { id: 'w3', title: 'Refund Processed', description: 'Lorem ipsum adolor sit mate', time: '1h ago', read: true },
      { id: 'w4', title: 'Low Balance Alert', description: 'Lorem ipsum adolor sit mate', time: '2h ago', read: true },
      { id: 'w5', title: 'Failed Transaction', description: 'Lorem ipsum adolor sit mate', time: '6h ago', read: true },
    ],
  },
  {
    section: 'Documents & Compliance',
    items: [
      { id: 'd1', title: 'Document Approved', description: 'Lorem ipsum adolor sit mate', time: '10m ago', read: false },
      { id: 'd2', title: 'Changes Requested', description: 'Lorem ipsum adolor sit mate', time: '30m ago', read: true },
      { id: 'd3', title: 'Compliance Flag Detected', description: 'Lorem ipsum adolor sit mate', time: '1h ago', read: true },
      { id: 'd4', title: 'Document Expired', description: 'Lorem ipsum adolor sit mate', time: '2h ago', read: true },
    ],
  },
  {
    section: 'Account & Security',
    items: [
      { id: 'a1', title: 'Login from New Device', description: 'Lorem ipsum adolor sit mate', time: '10m ago', read: false },
      { id: 'a2', title: 'Password Changed', description: 'Lorem ipsum adolor sit mate', time: '30m ago', read: false },
      { id: 'a3', title: 'Profile Updated', description: 'Lorem ipsum adolor sit mate', time: '1h ago', read: true },
      { id: 'a4', title: '2FA Enabled', description: 'Lorem ipsum adolor sit mate', time: '2h ago', read: true },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function NotifItem({ item }: { item: Notification }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 group">
      {/* unread dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${item.read ? 'bg-transparent' : 'bg-orange-500'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-tight ${item.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
          {item.title}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.description}</p>
      </div>
      <span className="text-[11px] text-gray-400 shrink-0">{item.time}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 transition-colors group-hover:text-orange-400 shrink-0" />
    </div>
  )
}

function NotifSection({ data }: { data: NotificationSection }) {
  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{data.section}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.items.map((item) => (
          <NotifItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Notifications() {
  return (
    <div className="max-w-screen-xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {NOTIFICATION_DATA.map((section) => (
          <NotifSection key={section.section} data={section} />
        ))}
      </div>
    </div>
  )
}