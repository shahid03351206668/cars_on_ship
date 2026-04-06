// pages/ProfileSettings.tsx
import { useState } from 'react'
import { Camera, Edit2, Shield, Clock, History, MapPin, CreditCard, Globe } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  displayName: string
  avatarUrl: string
  memberSince: string
  verificationStatus: 'Verified' | 'Pending' | 'Unverified'
  profileCompletion: number
  personal: {
    fullName: string
    email: string
    phoneNumber: string
    dateOfBirth: string
    nationality: string
  }
  shipping: {
    defaultPort: string
    shippingAddress: string
    billingAddress: string
    preferredShippingRoute: string
    nationality: string
  }
  security: {
    passwordLastChanged: string
    twoFactorEnabled: boolean
    recentLogin: string
  }
}

// ─── Mock data (replace with API/auth store) ──────────────────────────────────
const USER: UserProfile = {
  displayName: 'Ahmed Khan',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  memberSince: 'Jan 2025',
  verificationStatus: 'Verified',
  profileCompletion: 20,
  personal: {
    fullName: 'Ahmed Khan',
    email: 'ahmed@email.com',
    phoneNumber: '+92 300 1234567',
    dateOfBirth: '12 March 1992',
    nationality: 'Pakistani',
  },
  shipping: {
    defaultPort: 'Karachi',
    shippingAddress: 'House 21, Street 5, DHA Phase 6, Karachi',
    billingAddress: '+92 300 1234567',
    preferredShippingRoute: '12 March 1992',
    nationality: 'Pakistani',
  },
  security: {
    passwordLastChanged: 'Last changed 30 days ago',
    twoFactorEnabled: true,
    recentLogin: 'Last device, IP',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[13px] font-semibold text-gray-700">{label}</span>
      <span className="text-[13px] text-gray-500">{value}</span>
    </div>
  )
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-400 transition-colors hover:text-orange-500"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Circular progress ────────────────────────────────────────────────────────
function CircularProgress({ percent }: { percent: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (percent / 100) * circ

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">{percent}%</span>
      </div>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
          enabled ? 'left-5' : 'left-1'
        }`}
      />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const [twoFactor, setTwoFactor] = useState(USER.security.twoFactorEnabled)

  return (
    <div className="max-w-screen-xl">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Left column: My Profile ── */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="relative">
              <img
                src={USER.avatarUrl}
                alt={USER.displayName}
                className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-md"
              />
              <button className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-orange-50 hover:border-orange-300">
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Member info */}
          <SectionCard title="">
            <InfoRow label="Member Since:" value={USER.memberSince} />
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[13px] font-semibold text-gray-700">Verification Badge</span>
              <span
                className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                  USER.verificationStatus === 'Verified'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {USER.verificationStatus}
              </span>
            </div>
          </SectionCard>

          {/* Security & Login */}
          <SectionCard title="Security & Login">
            <div className="space-y-3">
              {/* Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Password
                </div>
                <span className="text-[11px] text-gray-400 italic">
                  {USER.security.passwordLastChanged}
                </span>
              </div>
              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Two-Factor Authentication
                </div>
                <Toggle enabled={twoFactor} onChange={setTwoFactor} />
              </div>
              {/* Recent Logins */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Logins
                </div>
                <span className="text-[11px] text-gray-400 italic">
                  {USER.security.recentLogin}
                </span>
              </div>
              {/* Login History */}
              <button className="flex items-center gap-2 text-[13px] text-orange-500 hover:text-orange-600 transition-colors">
                <History className="w-4 h-4" />
                Login History
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── Right column: info sections ── */}
        <div className="space-y-4 lg:col-span-2">
          {/* Personal Information */}
          <SectionCard title="Personal Information" onEdit={() => {}}>
            <InfoRow label="Full Name:" value={USER.personal.fullName} />
            <InfoRow label="Email:" value={USER.personal.email} />
            <InfoRow label="Phone Number" value={USER.personal.phoneNumber} />
            <InfoRow label="Date of Birth" value={USER.personal.dateOfBirth} />
            <InfoRow label="Nationality" value={USER.personal.nationality} />
          </SectionCard>

          {/* Shipping & Address */}
          <SectionCard title="Shipping & Address Information" onEdit={() => {}}>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">Default Port: Karachi</span>
              </div>
              <span className="text-[13px] text-gray-500">{USER.shipping.defaultPort}</span>
            </div>
            <InfoRow label="Shipping Address:" value={USER.shipping.shippingAddress} />
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">Billing Address:</span>
              </div>
              <span className="text-[13px] text-gray-500">{USER.shipping.billingAddress}</span>
            </div>
            <InfoRow label="Preferred Shipping Route:" value={USER.shipping.preferredShippingRoute} />
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">Nationality</span>
              </div>
              <span className="text-[13px] text-gray-500">{USER.shipping.nationality}</span>
            </div>
          </SectionCard>

          {/* Complete Your Profile */}
          <SectionCard title="Complete Your Profile">
            <div className="flex items-center gap-6">
              <CircularProgress percent={USER.profileCompletion} />
              <div className="flex-1">
                <p className="text-[13px] text-gray-600 mb-2">
                  Your profile is <span className="font-semibold text-gray-800">{USER.profileCompletion}%</span> complete.
                  Complete your profile to unlock all features and improve credibility.
                </p>
                <button className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Complete Profile →
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}