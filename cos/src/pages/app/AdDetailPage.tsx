import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, Phone, MessageCircle, ChevronLeft, ChevronRight,
  Gauge, Calendar, Zap, Wind, Car, Settings2, DoorOpen, Users,
  Shield, MapPin, ExternalLink, Grid2x2, CheckCircle2, XCircle,
  AlertCircle, Images,
} from "lucide-react"
import { useAdDetail } from "@/hooks/useVehicles"
import type { AdDetail } from "@/api/vehicles"

// ── Fullscreen Gallery Modal ───────────────────────────────────
function GalleryModal({
  imgs, active, onClose, onSelect, onPrev, onNext,
}: {
  imgs: string[]; active: number
  onClose: () => void; onSelect: (i: number) => void
  onPrev: () => void; onNext: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onClose} className="text-white flex items-center gap-2 text-sm hover:text-[#FC7844] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm text-white/60">{active + 1} / {imgs.length}</span>
      </div>
      <div className="relative flex items-center justify-center flex-1 min-h-0 px-16">
        <button onClick={onPrev} className="absolute flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full left-4 bg-white/10 hover:bg-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <img src={imgs[active]} alt="" className="object-contain max-w-full max-h-full" />
        <button onClick={onNext} className="absolute flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full right-4 bg-white/10 hover:bg-white/20">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-center gap-2 px-4 py-4 overflow-x-auto shrink-0">
        {imgs.map((img, i) => (
          <button key={i} onClick={() => onSelect(i)}
            className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${i === active ? "border-[#FC7844]" : "border-transparent opacity-60 hover:opacity-80"}`}
          >
            <img src={img} alt="" className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  )
}
// ── Image Gallery ──────────────────────────────────────────────
function ImageGallery({ images, onBack }: { images: string[]; onBack: () => void }) {
  const [active, setActive] = useState(0)
  const [galleryMode, setGalleryMode] = useState(false)

  const fallback = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"
  const imgs = images.length > 0 ? images : [fallback]

  const prev = () => setActive((a) => (a === 0 ? imgs.length - 1 : a - 1))
  const next = () => setActive((a) => (a === imgs.length - 1 ? 0 : a + 1))

  return (
    <>
      {galleryMode && (
        <GalleryModal imgs={imgs} active={active}
          onClose={() => setGalleryMode(false)} onSelect={setActive}
          onPrev={prev} onNext={next}
        />
      )}
      
      <div className="w-full min-h-[700px] relative overflow-hidden font-sans">
        {/* 🖼️ Background Layers */}
        <div
          className="absolute inset-0 bg-center bg-cover w-full min-h-[700px] "
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/50 " />

        <div className="px-4 mx-auto max-w-7xl relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between py-32">
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white hover:text-gray-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to result
            </button>
            <div className="flex items-center gap-2">
              <button className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition-colors">
                Auction Report
              </button>
              <button onClick={() => setGalleryMode(true)} className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition-colors">
                <Images className="w-3.5 h-3.5" />
                Gallery
              </button>
            </div>
          </div>

          {/* Fixed-height image grid */}
          <div className="relative overflow-hidden rounded-lg shadow-2xl" style={{ height: "340px" }}>
            {imgs.length === 1 ? (
              <div className="w-full h-full bg-[#111] flex items-center justify-center">
                <img src={imgs[0]} alt="" className="object-contain max-w-full max-h-full" />
              </div>
            ) : (
              <div className="flex h-full gap-1">
                <div className="relative overflow-hidden rounded-l-lg cursor-pointer flex-[0_0_55%]">
                  <img src={imgs[active]} alt="" className="object-cover w-full h-full" />
                </div>

                <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
                  {[1, 2, 3, 4].map((offset) => {
                    const img = imgs[offset]
                    if (!img) return <div key={offset} className="bg-[#111]" />
                    const isOverlay = offset === 4 && imgs.length > 5
                    return (
                      <div
                        key={offset}
                        className={`relative overflow-hidden cursor-pointer ${offset === 2 ? "rounded-tr-lg" : offset === 4 ? "rounded-br-lg" : ""}`}
                        onClick={() => { setActive(offset); setGalleryMode(true) }}
                      >
                        <img src={img} alt="" className="object-cover w-full h-full transition-all hover:brightness-90" />
                        {isOverlay && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="flex items-center gap-1 text-xs font-semibold text-white">
                              <Grid2x2 className="w-3.5 h-3.5" /> +{imgs.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {imgs.length > 1 && (
              <>
                <button onClick={prev} className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors -translate-y-1/2 rounded-full left-2 top-1/2 bg-black/50 hover:bg-black/70">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors -translate-y-1/2 rounded-full right-2 top-1/2 bg-black/50 hover:bg-black/70">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="h-8" />
        </div>
      </div>
    </>
  )
}
// ── Make Offer Form ────────────────────────────────────────────
function MakeOfferForm() {
  const [price, setPrice] = useState("")
  const [agreeAdvance, setAgreeAdvance] = useState(false)
  const [agreeCancel, setAgreeCancel] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <h3 className="text-sm font-bold text-[#212123] mb-4">Make an Offer</h3>
      <label className="block mb-1 text-xs text-gray-500">Offer Price (PKR)</label>
      <input
        type="number" placeholder="Your offer price" value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FC7844] focus:border-[#FC7844] mb-1"
      />
      <p className="text-[10px] text-[#FC7844] mb-3">*Minimum offer increment: PKR 50,000</p>
      <label className="flex items-start gap-2 mb-2 cursor-pointer">
        <input type="checkbox" checked={agreeAdvance} onChange={(e) => setAgreeAdvance(e.target.checked)} className="mt-0.5 accent-[#FC7844]" />
        <span className="text-xs text-gray-600">I am ready to pay advance</span>
      </label>
      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={agreeCancel} onChange={(e) => setAgreeCancel(e.target.checked)} className="mt-0.5 accent-[#FC7844]" />
        <span className="text-xs text-gray-600">I understand that cancelling my offer will forfeit my priority</span>
      </label>
      {submitted ? (
        <div className="flex items-start gap-2 p-3 border border-green-200 rounded-lg bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-green-700">Your offer has been submitted successfully</p>
            <a href="#" className="text-xs text-[#FC7844] hover:underline mt-0.5 inline-block">View offer detail →</a>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { if (price && agreeAdvance && agreeCancel) setSubmitted(true) }}
          disabled={!price || !agreeAdvance || !agreeCancel}
          className="w-full py-2 text-xs font-semibold text-gray-600 transition-colors bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Offer Submitted
        </button>
      )}
    </div>
  )
}

// ── Terms Section (module-level) ───────────────────────────────
function TermsSection({ title, items }: { title: string; items: { icon: React.ReactNode; text: string }[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-semibold text-[#212123] mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
            {item.icon} {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Terms & Rules ──────────────────────────────────────────────
function TermsAndRules() {
  const rules = [
    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, text: "First offer gets priority" },
    { icon: <XCircle className="w-3.5 h-3.5 text-red-400" />, text: "If cancelled or failed, next buyer moves up" },
    { icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" />, text: "Priority is system managed" },
  ]
  const payment = [
    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, text: "10% advance required" },
    { icon: <XCircle className="w-3.5 h-3.5 text-red-400" />, text: "Deducted immediately" },
    { icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" />, text: "Adjusted in final price" },
  ]
  const cancellation = [
    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, text: "Cancel anytime" },
    { icon: <XCircle className="w-3.5 h-3.5 text-red-400" />, text: "Refund within 7 days" },
    { icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" />, text: "Priority is forfeited" },
  ]
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <h3 className="text-sm font-bold text-[#212123] mb-4">Terms and Rules</h3>
      <TermsSection title="Offer Priority Rules" items={rules} />
      <TermsSection title="Advance Payment Terms" items={payment} />
      <TermsSection title="Cancellation & Refund Policy" items={cancellation} />
    </div>
  )
}

// ── Overview Item ──────────────────────────────────────────────
function OverviewItem({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${highlight ? "text-[#FC7844]" : "text-[#212123]"}`}>{value || "—"}</p>
      </div>
    </div>
  )
}

// ── Contact Seller ─────────────────────────────────────────────
function ContactSellerCard() {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <h3 className="text-sm font-bold text-[#212123] mb-4">Contact Seller</h3>
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#FC7844] text-[#FC7844] hover:bg-orange-50 text-sm font-semibold py-2.5 rounded-lg transition-colors">
          <Phone className="w-4 h-4" /> (023) 8234 9471
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 text-sm font-semibold py-2.5 rounded-lg transition-colors">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors">
          <MessageCircle className="w-4 h-4" /> Message
        </button>
      </div>
    </div>
  )
}

// ── ETA Card ───────────────────────────────────────────────────
function ETACard({ ad }: { ad: AdDetail }) {
  return (
    <div className="bg-[#212123] rounded-xl p-5 text-white">
      <h3 className="mb-4 text-sm font-bold">ETA</h3>
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <span className="flex items-center gap-1 font-semibold text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            {ad.vehicle_status}
          </span>
        </div>
        <div className="flex justify-between"><span className="text-gray-400">ETA Date:</span><span className="font-medium">—</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Days Remaining:</span><span className="font-medium">—</span></div>
        <div className="my-1 border-t border-white/10" />
        <div className="flex justify-between"><span className="text-gray-400">Port of Departure:</span><span className="font-medium">Japan port</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Port of Arrival:</span><span className="font-medium">Karachi Pakistan</span></div>
      </div>
      <button className="mt-4 w-full border border-white/20 hover:border-[#FC7844] text-white text-xs font-medium py-2 rounded transition-colors">
        Track this Vehicle
      </button>
    </div>
  )
}

// ── Importer Card ──────────────────────────────────────────────
function ImporterCard({ ad }: { ad: AdDetail }) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <h3 className="text-sm font-bold text-[#212123] mb-3">Importer information</h3>
      <p className="mb-1 text-sm font-medium text-gray-700">{ad.seller_type}</p>
      <p className="mb-4 text-xs text-gray-400">{ad.user}</p>
      <button className="w-full flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#FC7844] text-gray-600 hover:text-[#FC7844] text-xs font-medium py-2 rounded transition-colors">
        Visit seller website <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full bg-[#1a1a1c] h-[400px]" />
      <div className="grid grid-cols-1 gap-8 px-4 py-8 mx-auto max-w-7xl lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="w-2/3 h-8 bg-gray-200 rounded" />
          <div className="w-1/3 h-6 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdDetailPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { data: ad, isLoading, isError } = useAdDetail(name ?? "")

  if (isLoading) return <Skeleton />
  if (isError || !ad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4 text-gray-500">Failed to load vehicle details.</p>
          <button onClick={() => navigate(-1)} className="text-[#FC7844] hover:underline text-sm">← Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Barlow',sans-serif]">

      {/* Gallery band — back bar is inside dark area, no separate white bar */}
      <ImageGallery images={ad.images} onBack={() => navigate(-1)} />

      {/* Body */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-[#212123] font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
                {ad.year} {ad.make} {ad.model}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {ad.mileage ? `${ad.mileage.toLocaleString()} km` : "0 km"} · {ad.body_type} · {ad.fuel_type}
              </p>
              <p className="text-2xl font-extrabold text-[#FC7844] mt-2">
                £{ad.price?.toLocaleString() ?? "—"}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {ad.vehicle_status && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-[#FC7844] text-xs px-2.5 py-1 rounded-full border border-orange-200">
                    {ad.vehicle_status}
                  </span>
                )}
              </div>
            </div>

            {/* Offer + Terms */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MakeOfferForm />
              <TermsAndRules />
            </div>

            {/* Overview */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h2 className="text-base font-bold text-[#212123] mb-4 font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
                Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
                <OverviewItem icon={<Gauge className="w-4 h-4" />}     label="Mileage"      value={ad.mileage ? `${ad.mileage.toLocaleString()} km` : "0 km"} highlight />
                <OverviewItem icon={<Calendar className="w-4 h-4" />}  label="Year"         value={String(ad.year)} />
                <OverviewItem icon={<Zap className="w-4 h-4" />}       label="Fuel Type"    value={ad.fuel_type} />
                <OverviewItem icon={<Car className="w-4 h-4" />}       label="Body Type"    value={ad.body_type} />
                <OverviewItem icon={<Settings2 className="w-4 h-4" />} label="Gearbox"      value={ad.gearbox} />
                <OverviewItem icon={<Wind className="w-4 h-4" />}      label="Drive Type"   value={ad.drive_type} />
                <OverviewItem icon={<DoorOpen className="w-4 h-4" />}  label="Doors"        value={ad.doors} />
                <OverviewItem icon={<Users className="w-4 h-4" />}     label="Seats"        value={ad.seats} />
                <OverviewItem icon={<Shield className="w-4 h-4" />}    label="Body Colour"  value={ad.colour} />
                <OverviewItem icon={<Zap className="w-4 h-4" />}       label="Acceleration" value={ad.acceleration} />
                <OverviewItem icon={<Car className="w-4 h-4" />}       label="Boot Space"   value={ad.boot_space} />
                <OverviewItem icon={<MapPin className="w-4 h-4" />}    label="Seller Type"  value={ad.seller_type} />
              </div>
            </div>

            {/* Description */}
            {ad.description && (
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h2 className="text-base font-bold text-[#212123] mb-3 font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{ad.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ContactSellerCard />
            <ETACard ad={ad} />
            <ImporterCard ad={ad} />
          </div>
        </div>
      </div>
    </div>
  )
}