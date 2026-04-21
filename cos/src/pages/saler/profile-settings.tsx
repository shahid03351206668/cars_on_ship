// pages/ProfileSettings.tsx
import { useState, useCallback,useEffect } from 'react'
import { Camera, Edit2, Shield, Clock, History, MapPin, CreditCard, Globe, Save, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStoredSid, getCsrfToken } from '@/api/auth'
import {getPorts} from "../../api/frappe-rest-api.ts"

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalerProfileDoc {
  name: string 
  user: string
  profile_image: string | null
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  nationality: string
  default_port: string
  shipping_address: string
  billing_address: string
  preffered_shipping_route: string
  two_factor_authentication: boolean
  verification: 'Verified' | 'Pending' | 'Unverified'
}

interface PersonalFields {
  fullName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  nationality: string
}

interface ShippingFields {
  defaultPort: string
  shippingAddress: string
  billingAddress: string
  preferredShippingRoute: string
  nationality: string
}

interface Port {
  name: string;
}

// ─── Frappe field maps ────────────────────────────────────────────────────
const PERSONAL_FIELD_MAP: Record<keyof PersonalFields, string> = {
  fullName: 'full_name',
  email: 'email',
  phoneNumber: 'phone',
  dateOfBirth: 'date_of_birth',
  nationality: 'nationality',
}

const SHIPPING_FIELD_MAP: Record<keyof ShippingFields, string> = {
  defaultPort: 'default_port',
  shippingAddress: 'shipping_address',
  billingAddress: 'billing_address',
  preferredShippingRoute: 'preffered_shipping_route',
  nationality: 'nationality',
}

// ─── Base URL ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const DOCTYPE = 'Saler Profile'

// ─── Fetch Saler Profile by user ──────────────────────────────────────────────
async function getCurrentUser(): Promise<string> {
  const sid = getStoredSid()
  const res = await fetch(`${BASE_URL}/api/method/frappe.auth.get_logged_user`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Frappe-CSRF-Token': getCsrfToken(),
      ...(sid ? { 'X-Frappe-Session-Id': sid } : {}),
    },
  })
  if (!res.ok) throw new Error(`Failed to get current user: HTTP ${res.status}`)
  const data = await res.json()
  // returns { message: "user@example.com" }
  return data.message as string
}

async function fetchSalerProfile(): Promise<SalerProfileDoc> {
  const sid = getStoredSid()
  const res = await fetch(
    `${BASE_URL}/api/method/cars_on_ship.api.get_my_profile`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Frappe-CSRF-Token': getCsrfToken(),
        ...(sid ? { 'X-Frappe-Session-Id': sid } : {}),
      },
    }
  )

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()

  // Frappe wraps whitelisted method responses in { message: ... }
  const profile = data.message as SalerProfileDoc
  if (!profile) throw new Error('Profile not found')
  return profile
}

// ─── Update Saler Profile doc ─────────────────────────────────────────────────
async function updateFrappeDoc(docName: string, payload: Record<string, unknown>): Promise<void> {
  const sid = getStoredSid()
  const url = `${BASE_URL}/api/resource/${encodeURIComponent(DOCTYPE)}/${encodeURIComponent(docName)}`
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Frappe-CSRF-Token': getCsrfToken(),
      ...(sid ? { 'X-Frappe-Session-Id': sid } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function InputRow({
  label,
  value,
  editing,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-[13px] font-semibold text-gray-700 shrink-0 min-w-[140px]">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-full transition"
        />
      ) : (
        <span className="text-[13px] text-gray-500 text-right truncate">{value || '—'}</span>
      )}
    </div>
  )
}

function SectionCard({
  title,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string
  editing: boolean
  saving?: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  children: React.ReactNode
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-1 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-60"
                title="Save"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="text-gray-400 transition-colors hover:text-orange-500"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

function CircularProgress({ percent }: { percent: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (percent / 100) * circ
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke="#22c55e" strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">{percent}%</span>
      </div>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-1'}`} />
    </button>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium transition-all
        ${type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="h-3.5 w-40 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

function computeCompletion(doc: SalerProfileDoc): number {
  const fields: (keyof SalerProfileDoc)[] = [
    'full_name', 'email', 'phone', 'date_of_birth', 'nationality',
    'default_port', 'shipping_address', 'billing_address',
    'preffered_shipping_route', 'profile_image', 'verification',
  ]
  const filled = fields.filter((f) => {
    const v = doc[f]
    return v !== null && v !== undefined && String(v).trim() !== ''
  }).length
  return Math.round((filled / fields.length) * 100)
}

export default function ProfileSettings() {
  // 1. All your state/hooks first
const [showDropdown, setShowDropdown] = useState(false);
const [ports, setPorts] = useState<Port[]>([]);

// 3. Effects after logic
useEffect(() => {
  getPorts().then(setPorts).catch(console.error);
}, []);


  const queryClient = useQueryClient()
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['saler-profile'],
    queryFn: fetchSalerProfile,
  })

  // Draft state — null means "not editing"
  const [personalFields, setPersonalFields] = useState<PersonalFields | null>(null)
  const [shippingFields, setShippingFields] = useState<ShippingFields | null>(null)
  const [twoFactorDraft, setTwoFactorDraft] = useState<boolean | null>(null)

  const personalEditing = personalFields !== null
  const shippingEditing = shippingFields !== null

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const docName = profile?.name ?? ''
  const profileCompletion = profile ? computeCompletion(profile) : 0

  // ─── Derived display values (no useEffect needed) ───────────────────────
  const displayPersonal: PersonalFields = personalEditing && personalFields
    ? personalFields
    : {
        fullName: profile?.full_name ?? '',
        email: profile?.email ?? '',
        phoneNumber: profile?.phone ?? '',
        dateOfBirth: profile?.date_of_birth ?? '',
        nationality: profile?.nationality ?? '',
      }

  const displayShipping: ShippingFields = shippingEditing && shippingFields
    ? shippingFields
    : {
        defaultPort: profile?.default_port ?? '',
        shippingAddress: profile?.shipping_address ?? '',
        billingAddress: profile?.billing_address ?? '',
        preferredShippingRoute: profile?.preffered_shipping_route ?? '',
        nationality: profile?.nationality ?? '',
      }


      const filteredPorts = ports.filter(p => 
  p.name.toLowerCase().includes(displayShipping?.defaultPort?.toLowerCase() || "")
);

  const displayTwoFactor = twoFactorDraft ?? (profile?.two_factor_authentication ?? false)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ─── Personal handlers ───────────────────────────────────────────────────
  const handlePersonalEdit = () => {
    setPersonalFields({
      fullName: profile?.full_name ?? '',
      email: profile?.email ?? '',
      phoneNumber: profile?.phone ?? '',
      dateOfBirth: profile?.date_of_birth ?? '',
      nationality: profile?.nationality ?? '',
    })
  }

  const handlePersonalCancel = () => setPersonalFields(null)

  const handlePersonalSave = () => {
    if (personalFields) personalMutation.mutate(personalFields)
  }

  const setPersonalField = <K extends keyof PersonalFields>(key: K, value: string) =>
    setPersonalFields((prev) => prev ? { ...prev, [key]: value } : null)

  // ─── Shipping handlers ───────────────────────────────────────────────────
  const handleShippingEdit = () => {
    setShippingFields({
      defaultPort: profile?.default_port ?? '',
      shippingAddress: profile?.shipping_address ?? '',
      billingAddress: profile?.billing_address ?? '',
      preferredShippingRoute: profile?.preffered_shipping_route ?? '',
      nationality: profile?.nationality ?? '',
    })
  }

  const handleShippingCancel = () => setShippingFields(null)

  const handleShippingSave = () => {
    if (shippingFields) shippingMutation.mutate(shippingFields)
  }

  const setShippingField = <K extends keyof ShippingFields>(key: K, value: string) =>
    setShippingFields((prev) => prev ? { ...prev, [key]: value } : null)

  // ─── Mutations ───────────────────────────────────────────────────────────
  const personalMutation = useMutation({
    mutationFn: (fields: PersonalFields) => {
      const payload = Object.fromEntries(
        (Object.keys(fields) as Array<keyof PersonalFields>).map((k) => [
          PERSONAL_FIELD_MAP[k],
          fields[k],
        ])
      )
      return updateFrappeDoc(docName, payload)
    },
    onSuccess: () => {
      setPersonalFields(null)
      queryClient.invalidateQueries({ queryKey: ['saler-profile'] })
      showToast('Personal information saved.', 'success')
    },
    onError: (err: Error) => {
      showToast(`Failed to save: ${err.message}`, 'error')
    },
  })

  const shippingMutation = useMutation({
    mutationFn: (fields: ShippingFields) => {
      const payload = Object.fromEntries(
        (Object.keys(fields) as Array<keyof ShippingFields>).map((k) => [
          SHIPPING_FIELD_MAP[k],
          fields[k],
        ])
      )
      return updateFrappeDoc(docName, payload)
    },
    onSuccess: () => {
      setShippingFields(null)
      queryClient.invalidateQueries({ queryKey: ['saler-profile'] })
      showToast('Shipping information saved.', 'success')
    },
    onError: (err: Error) => {
      showToast(`Failed to save: ${err.message}`, 'error')
    },
  })

  const avatarSrc = profile?.profile_image
    ? `${BASE_URL}${profile.profile_image}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name ?? 'User')}&background=f97316&color=fff`

  return (
    <div className="max-w-screen-xl">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
          Failed to load profile. Please refresh the page.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="relative">
              {isLoading ? (
                <div className="w-24 h-24 bg-gray-100 rounded-full animate-pulse" />
              ) : (
                <img
                  src={avatarSrc}
                  alt={profile?.full_name ?? 'User'}
                  className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-md"
                />
              )}
              <button className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-orange-50 hover:border-orange-300">
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {!isLoading && profile?.full_name && (
              <p className="text-sm font-semibold text-gray-800">{profile.full_name}</p>
            )}
          </div>

          <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-[13px] font-semibold text-gray-700">Verification Badge</span>
              {isLoading ? (
                <div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" />
              ) : (
                <span
                  className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                    profile?.verification === 'Verified'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {profile?.verification ?? 'Unverified'}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Security & Login</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Password
                </div>
                <span className="text-[11px] text-gray-400 italic">Change password</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Two-Factor Auth
                </div>
                {isLoading ? (
                  <div className="w-10 h-6 bg-gray-100 rounded-full animate-pulse" />
                ) : (
                  <Toggle enabled={displayTwoFactor} onChange={setTwoFactorDraft} />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Logins
                </div>
                <span className="text-[11px] text-gray-400 italic">Last device, IP</span>
              </div>
              <button className="flex items-center gap-2 text-[13px] text-orange-500 hover:text-orange-600 transition-colors">
                <History className="w-4 h-4" />
                Login History
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Personal Information"
            editing={personalEditing}
            saving={personalMutation.isPending}
            onEdit={handlePersonalEdit}
            onSave={handlePersonalSave}
            onCancel={handlePersonalCancel}
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : (
              <>
                <InputRow label="Full Name:" value={displayPersonal.fullName} editing={personalEditing} onChange={(v) => setPersonalField('fullName', v)} />
                <InputRow label="Email:" value={displayPersonal.email} editing={personalEditing} onChange={(v) => setPersonalField('email', v)} type="email" />
                <InputRow label="Phone Number:" value={displayPersonal.phoneNumber} editing={personalEditing} onChange={(v) => setPersonalField('phoneNumber', v)} type="tel" />
                <InputRow label="Date of Birth:" value={displayPersonal.dateOfBirth} editing={personalEditing} onChange={(v) => setPersonalField('dateOfBirth', v)} />
                <InputRow label="Nationality:" value={displayPersonal.nationality} editing={personalEditing} onChange={(v) => setPersonalField('nationality', v)} />
              </>
            )}
          </SectionCard>

          <SectionCard
            title="Shipping & Address Information"
            editing={shippingEditing}
            saving={shippingMutation.isPending}
            onEdit={handleShippingEdit}
            onSave={handleShippingSave}
            onCancel={handleShippingCancel}
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : (
              <>
                <div className="flex items-center justify-between py-2.5 border-b border-gray-50 gap-4">
                  <div className="flex items-center gap-1.5 shrink-0 min-w-[140px]">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] font-semibold text-gray-700">Default Port:</span>
                  </div>
                 {shippingEditing ? (
  <div className="relative flex-1">
    <input
      type="text"
      value={displayShipping.defaultPort}
      onFocus={() => setShowDropdown(true)}
      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      onChange={(e) => {
        setShippingField('defaultPort', e.target.value);
        setShowDropdown(true);
      }}
      placeholder="Default Port"
      className="w-full text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
    />

    {showDropdown && filteredPorts.length > 0 && (
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        {filteredPorts.map((port) => (
          <div
            key={port.name}
            onClick={() => {
              setShippingField('defaultPort', port.name);
              setShowDropdown(false);
            }}
            className="px-3 py-2 text-[13px] text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
          >
            {port.name}
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <span className="text-[13px] text-gray-500">{displayShipping.defaultPort || '—'}</span>
)}
                </div>

                <InputRow label="Shipping Address:" value={displayShipping.shippingAddress} editing={shippingEditing} onChange={(v) => setShippingField('shippingAddress', v)} />

                <div className="flex items-center justify-between py-2.5 border-b border-gray-50 gap-4">
                  <div className="flex items-center gap-1.5 shrink-0 min-w-[140px]">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] font-semibold text-gray-700">Billing Address:</span>
                  </div>
                  {shippingEditing ? (
                    <input
                      type="text"
                      value={displayShipping.billingAddress}
                      onChange={(e) => setShippingField('billingAddress', e.target.value)}
                      className="text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-full transition"
                    />
                  ) : (
                    <span className="text-[13px] text-gray-500">{displayShipping.billingAddress || '—'}</span>
                  )}
                </div>

                <InputRow label="Preferred Route:" value={displayShipping.preferredShippingRoute} editing={shippingEditing} onChange={(v) => setShippingField('preferredShippingRoute', v)} />

                <div className="flex items-center justify-between py-2.5 gap-4">
                  <div className="flex items-center gap-1.5 shrink-0 min-w-[140px]">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] font-semibold text-gray-700">Nationality:</span>
                  </div>
                  {shippingEditing ? (
                    <input
                      type="text"
                      value={displayShipping.nationality}
                      onChange={(e) => setShippingField('nationality', e.target.value)}
                      className="text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-full transition"
                    />
                  ) : (
                    <span className="text-[13px] text-gray-500">{displayShipping.nationality || '—'}</span>
                  )}
                </div>
              </>
            )}
          </SectionCard>

          <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Complete Your Profile</h3>
            <div className="flex items-center gap-6">
              <CircularProgress percent={profileCompletion} />
              <div className="flex-1">
                <p className="text-[13px] text-gray-600 mb-2">
                  Your profile is{' '}
                  <span className="font-semibold text-gray-800">{profileCompletion}%</span>{' '}
                  complete. Complete your profile to unlock all features and improve credibility.
                </p>
                <button className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Complete Profile →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}