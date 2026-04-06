// pages/WalletPayments.tsx
import { useState } from 'react'
import { PlusCircle, ArrowUpRight, Clock, CreditCard, ChevronRight } from 'lucide-react'

// ─── Types (swap with real API types later) ───────────────────────────────────
interface WalletSummary {
  walletBalance: number
  onHoldAdvances: number
  remainingBalance: number
  currency: string
}

interface SavedCard {
  id: string
  last4: string
  name: string
  expiry: string
  brand: 'visa' | 'mastercard' | 'amex'
}

interface ActiveBid {
  id: string
  carName: string
  imageUrl: string
  auctionDate: string
  auctionLocation: string
  myBid: string
  averagePrice: string
}

interface Transaction {
  id: string
  date: string
  transactionId: string
  type: 'Debit' | 'Credit'
  description: string
  shipId: string
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
}

// ─── Mock data (replace with API calls) ──────────────────────────────────────
const WALLET_SUMMARY: WalletSummary = {
  walletBalance: 10010,
  onHoldAdvances: 6000,
  remainingBalance: 6000,
  currency: '£',
}

const SAVED_CARDS: SavedCard[] = [
  { id: '1', last4: '0000', name: 'NAME', expiry: '00/00', brand: 'visa' },
]

const ACTIVE_BIDS: ActiveBid[] = [
  {
    id: '1',
    carName: 'TOYOTA LAND CRUISER COLORADO',
    imageUrl: 'https://placehold.co/80x52/e2e8f0/64748b?text=Car',
    auctionDate: '17.01.2026',
    auctionLocation: 'USS Okayama',
    myBid: '6 009 000¥',
    averagePrice: '7 009 000¥',
  },
]

const TRANSACTIONS: Transaction[] = Array.from({ length: 7 }, (_, i) => ({
  id: String(i),
  date: 'Mar 02, 2026',
  transactionId: 'TXN-34892',
  type: 'Debit',
  description: 'Vehicle Shipping Fee',
  shipId: 'SHIP-0098',
  amount: -850,
  status: 'Completed',
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(currency: string, amount: number) {
  return `${currency}${Math.abs(amount).toLocaleString()}`
}

const STATUS_CLASSES: Record<Transaction['status'], string> = {
  Completed: 'text-emerald-500',
  Pending: 'text-amber-500',
  Failed: 'text-red-500',
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold leading-tight text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function CreditCardUI({ card }: { card: SavedCard }) {
  return (
    <div className="relative w-56 p-4 overflow-hidden text-white shadow-lg select-none h-36 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      {/* chip */}
      <div className="flex items-center justify-center w-8 h-6 mb-3 rounded bg-yellow-300/80">
        <div className="grid grid-cols-2 gap-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-yellow-500/60 rounded-sm" />
          ))}
        </div>
      </div>
      <p className="text-xs tracking-[0.18em] mb-3">
        •••• •••• •••• {card.last4}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] opacity-60 uppercase tracking-wide">Card Holder</p>
          <p className="text-[11px] font-semibold">{card.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] opacity-60 uppercase tracking-wide">Expires</p>
          <p className="text-[11px] font-semibold">{card.expiry}</p>
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute w-20 h-20 rounded-full -top-4 -right-4 bg-white/10" />
      <div className="absolute w-24 h-24 rounded-full top-4 -right-8 bg-white/5" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WalletPayments() {
  const [_activeTab, _setActiveTab] = useState<'all' | 'debit' | 'credit'>('all')

  return (
    <div className="max-w-screen-xl space-y-6">
      {/* ── Top row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: balance cards + saved cards */}
        <div className="space-y-4 lg:col-span-2">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard
              icon={<CreditCard className="w-5 h-5" />}
              label="Wallet Balance"
              value={fmt(WALLET_SUMMARY.currency, WALLET_SUMMARY.walletBalance)}
            />
            <SummaryCard
              icon={<Clock className="w-5 h-5" />}
              label="On-hold Advances"
              value={fmt(WALLET_SUMMARY.currency, WALLET_SUMMARY.onHoldAdvances)}
            />
            <SummaryCard
              icon={<ArrowUpRight className="w-5 h-5" />}
              label="Remaining Balance"
              value={fmt(WALLET_SUMMARY.currency, WALLET_SUMMARY.remainingBalance)}
            />
          </div>

          {/* Cards section */}
          <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">My Cards</h3>
            <div className="flex flex-wrap items-center gap-6">
              {SAVED_CARDS.map((card) => (
                <CreditCardUI key={card.id} card={card} />
              ))}
              {/* Add balance */}
              <button className="flex flex-col items-center justify-center w-40 gap-2 text-gray-400 transition-colors border-2 border-gray-200 border-dashed h-36 rounded-2xl hover:border-orange-400 hover:text-orange-500">
                <PlusCircle className="w-7 h-7" />
                <span className="text-xs font-medium leading-tight text-center">
                  Add balance to your wallet
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Bids */}
        <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Active Bids</h3>
          <div className="space-y-3">
            {ACTIVE_BIDS.map((bid) => (
              <div
                key={bid.id}
                className="flex items-start gap-3 p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-orange-50 group"
              >
                <img
                  src={bid.imageUrl}
                  alt={bid.carName}
                  className="object-cover w-20 border border-gray-200 rounded-md h-14 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">
                    {bid.carName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Auction Date: {bid.auctionDate} {bid.auctionLocation}
                  </p>
                  <div className="mt-1.5 text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">My Bid:</span>
                      <span className="font-semibold text-gray-800">{bid.myBid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average Price:</span>
                      <span className="font-semibold text-gray-800">{bid.averagePrice}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 mt-1 text-gray-300 group-hover:text-orange-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-white bg-gray-900">
                {['Date', 'Transaction ID', 'Type', 'Description', 'Ship ID', 'Amount', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium text-[12px] tracking-wide first:rounded-tl-none last:rounded-tr-none"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TRANSACTIONS.map((tx, i) => (
                <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                  <td className="px-4 py-3 text-gray-700">{tx.transactionId}</td>
                  <td className="px-4 py-3 text-gray-700">{tx.type}</td>
                  <td className="px-4 py-3 text-gray-700">{tx.description}</td>
                  <td className="px-4 py-3 text-gray-700">{tx.shipId}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${STATUS_CLASSES[tx.status]}`}>
                    {tx.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}