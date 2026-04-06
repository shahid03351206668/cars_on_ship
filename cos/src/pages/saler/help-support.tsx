// pages/HelpSupport.tsx
import { useState } from 'react'
import { Search, Truck, Wallet, FileText, Package, Settings, AlertCircle, ChevronDown, Phone, MessageCircle, Mail, MapPin } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HelpCategory {
  id: string
  icon: React.ReactNode
  label: string
  description: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}

// ─── Static data (swap descriptions/answers with CMS or API) ─────────────────
const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'shipment', icon: <Truck className="w-5 h-5" />, label: 'Shipment Issues', description: 'Delays, tracking, documentation' },
  { id: 'payments', icon: <Wallet className="w-5 h-5" />, label: 'Payments & Wallet', description: 'Refunds, transactions, balance' },
  { id: 'documents', icon: <FileText className="w-5 h-5" />, label: 'Documents', description: 'Upload problems, compliance' },
  { id: 'customs', icon: <Package className="w-5 h-5" />, label: 'Customs & Clearance', description: 'Regulations, fees' },
  { id: 'account', icon: <Settings className="w-5 h-5" />, label: 'Account Settings', description: 'Password, profile' },
  { id: 'problem', icon: <AlertCircle className="w-5 h-5" />, label: 'Report a Problem', description: 'Technical issues' },
]

const FAQS: FAQ[] = [
  {
    id: 'f1',
    question: 'How long does vehicle shipping take?',
    answer:
      'Shipping times vary depending on origin and destination. Typically, international shipments take 4–8 weeks, while domestic transfers take 1–2 weeks. You can monitor progress in real-time via the Tracking page.',
  },
  {
    id: 'f2',
    question: 'When will my wallet refund be processed?',
    answer:
      'Refunds are typically processed within 3–5 business days after approval. You will receive a notification once the amount is credited back to your wallet balance.',
  },
  {
    id: 'f3',
    question: 'How do I track my shipment?',
    answer:
      'Navigate to the Tracking section in the sidebar. Enter your Ship ID or select your active shipment to view real-time location and status updates.',
  },
  {
    id: 'f4',
    question: 'What documents are required for customs?',
    answer:
      'Required documents typically include the Bill of Lading, Commercial Invoice, Packing List, and country-specific import permits. Check the Documents section for your shipment\'s specific requirements.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function CategoryCard({ category }: { category: HelpCategory }) {
  return (
    <button className="flex items-start gap-3 p-4 text-left transition-all bg-white border border-gray-100 shadow-sm rounded-xl hover:border-orange-300 hover:shadow-md group">
      <div className="flex items-center justify-center text-orange-500 transition-colors rounded-lg w-9 h-9 bg-orange-50 group-hover:bg-orange-100 shrink-0">
        {category.icon}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-gray-800">{category.label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{category.description}</p>
      </div>
    </button>
  )
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full gap-4 py-4 text-left"
      >
        <span className="text-[13px] font-medium text-gray-800">{faq.question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-[13px] text-gray-500 leading-relaxed">{faq.answer}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HelpSupport() {
  const [query, setQuery] = useState('')

  return (
    <div className="max-w-screen-lg mx-auto space-y-8">
      {/* ── Hero ── */}
      <div className="pt-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">How Can We Help You Today?</h1>
        <p className="mt-1 text-sm text-gray-500">Find answers, track issues, or contact our support team.</p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mt-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles, shipment issues, payments..."
            className="w-full pl-4 pr-24 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
          <button className="absolute right-1 top-1 bottom-1 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* ── Quick Help Categories ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Help Categories</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {HELP_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Frequently Asked Questions</h2>
        <div>
          {FAQS.map((faq) => (
            <FAQItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>

      {/* ── Contact ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Contact Our Support Team</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              icon: <Phone className="w-5 h-5" />,
              label: 'Phone Support',
              detail: 'Available: Mon–Fri, 9 AM – 6 PM',
              action: null,
            },
            {
              icon: <MessageCircle className="w-5 h-5" />,
              label: 'Live Chat',
              detail: 'Status: Online / Offline indicator',
              action: null,
            },
            {
              icon: <Mail className="w-5 h-5" />,
              label: 'Email Support',
              detail: 'support@carsonship.com',
              action: null,
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              label: 'Office Address',
              detail: 'View on Map',
              action: null,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center gap-2 p-4 text-center transition-all bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:border-orange-300 hover:shadow-md group"
            >
              <div className="flex items-center justify-center w-10 h-10 text-orange-500 transition-colors rounded-full bg-orange-50 group-hover:bg-orange-100">
                {c.icon}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{c.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}