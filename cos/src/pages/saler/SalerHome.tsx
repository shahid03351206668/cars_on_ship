import { Tag, MessageSquare, Car, Wallet, Loader2 } from 'lucide-react'
import { useUserwiseAds } from "../../hooks/useVehicles"
import type { AdDetail } from "@/api/vehicles"

const carFilters = ['All Cars', 'Sold', 'Unsold', 'Cars with Offers', 'No Offers Yet', 'Deal in Progress']

function CarLogo({ make }: { make: string }) {
  const m = make?.toLowerCase()
  if (m === 'toyota') {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full">
        <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
          <ellipse cx="24" cy="24" rx="22" ry="14" stroke="#CC0000" strokeWidth="2.5" fill="none"/>
          <ellipse cx="24" cy="24" rx="10" ry="14" stroke="#CC0000" strokeWidth="2.5" fill="none"/>
          <line x1="2" y1="24" x2="46" y2="24" stroke="#CC0000" strokeWidth="2.5"/>
        </svg>
      </div>
    )
  }
  // Generic fallback — show first 2 letters of make
  return (
    <div className="w-8 h-8 rounded-full bg-[#1a1a6e] flex items-center justify-center">
      <span className="text-white text-[10px] font-bold">
        {make?.slice(0, 2).toUpperCase() ?? '??'}
      </span>
    </div>
  )
}

function CarImage({ images, sold }: { images: string | string[]; sold: boolean }) {
  // API returns GROUP_CONCAT string or already-parsed array
  const imageList: string[] =
    typeof images === 'string'
      ? images.split(',').filter(Boolean)
      : images ?? []

  const src = imageList[0] ?? null

  return (
    <div className="relative w-full h-[130px] bg-gray-100 rounded-t-md overflow-hidden">
      {src ? (
        <img src={src} alt="car" className="object-cover w-full h-full" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
          No Image
        </div>
      )}
      {sold && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-[#FF5722] text-white font-bold text-[22px] px-6 py-1 shadow-lg"
            style={{ transform: 'rotate(-15deg)', letterSpacing: '0.01em' }}
          >
            Sold Out
          </div>
        </div>
      )}
    </div>
  )
}

function CarCard({ car }: { car: AdDetail }) {
  const isSold = car.vehicle_status?.toLowerCase() === 'sold'

  return (
    <div className="overflow-hidden bg-white border rounded-lg border-border">
      <div className="relative">
        <div className="absolute z-10 top-2 left-2">
          <CarLogo make={car.make} />
        </div>
        <div className="absolute z-10 flex items-center gap-1 top-2 right-2">
          <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-green-600 border border-green-200 hover:bg-green-50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Message
          </button>
          <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            ✏ Edit
          </button>
        </div>
        <CarImage images={car.images} sold={isSold} />
      </div>

      <div className="p-3">
        {/* Stats row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>👁</span>
            <span>—</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3].map((d) => (
              <span
                key={d}
                /* Added backticks inside the curly braces below */
                className={`w-1.5 h-1.5 rounded-full ${d === 0 ? 'bg-gray-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground capitalize">
            {car.vehicle_status ?? '—'}
          </span>
        </div>

        {/* Title */}
        <div className="text-[12px] font-bold text-foreground mb-1">
          {car.make} {car.model}
        </div>

        <div className="text-[11px] text-muted-foreground mb-2 leading-[1.4] line-clamp-2">
          {/* Added backticks around the fallback string below */}
          {car.description ?? `${car.fuel_type} · ${car.gearbox} · ${car.body_type}`}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {car.mileage != null && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">
              {car.mileage.toLocaleString()} mi
            </span>
          )}
          {car.year && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">
              {car.year} (reg)
            </span>
          )}
          {car.fuel_type && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">
              {car.fuel_type}
            </span>
          )}
        </div>

        {/* Price */}
        {car.price != null && (
          <div className="text-[15px] font-bold text-[#FF5722]">
            £{car.price.toLocaleString()}
          </div>
        )}

        {/* Seller type */}
        {car.seller_type && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
            <span>🏷</span>
            <span>{car.seller_type}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SalerHome() {
  const { data: cars, isLoading, isError } = useUserwiseAds()

  // Derived counts from real data
  const atSea = cars?.filter(c => c.vehicle_status?.toLowerCase() === 'at sea').length ?? 0
  const landed = cars?.filter(c => c.vehicle_status?.toLowerCase() === 'landed').length ?? 0

  return (
    <div className="space-y-5">
      {/* Current Status */}
      <div>
        <h2 className="text-[13px] font-semibold text-foreground mb-3">Current Status</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Offers */}
          <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Tag className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-[13px] text-muted-foreground font-medium">Offers</span>
            </div>
            <div className="mt-1">
              <div className="text-[28px] font-bold text-foreground leading-none">12</div>
              <div className="text-[12px] text-muted-foreground mt-1">Offers Received</div>
            </div>
            <button className="mt-auto self-start px-3 py-1 text-[11px] font-semibold rounded bg-[#FF5722] text-white hover:bg-[#e04e1e] transition-colors">
              View all offers
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <MessageSquare className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-[13px] text-muted-foreground font-medium">Messages</span>
            </div>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <div className="text-[28px] font-bold text-foreground leading-none">123</div>
                <div className="text-[12px] text-muted-foreground mt-1">Read</div>
              </div>
              <div>
                <div className="text-[28px] font-bold text-[#FF5722] leading-none">2</div>
                <div className="text-[12px] text-muted-foreground mt-1">Unread</div>
              </div>
            </div>
          </div>

          {/* My Tracking — now dynamic */}
          <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Car className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-[13px] text-muted-foreground font-medium">My Tracking</span>
            </div>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <div className="text-[28px] font-bold text-foreground leading-none">{atSea}</div>
                <div className="text-[12px] text-muted-foreground mt-1">Cars At Sea</div>
              </div>
              <div>
                <div className="text-[28px] font-bold text-foreground leading-none">{landed}</div>
                <div className="text-[12px] text-muted-foreground mt-1">Cars Landed</div>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Wallet className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-[13px] text-muted-foreground font-medium">Wallet Balance</span>
            </div>
            <div className="mt-1">
              <div className="text-[26px] font-bold text-foreground leading-none">£10,0010</div>
              <div className="text-[12px] text-muted-foreground mt-1">Available Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Cars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-foreground">My Cars</h2>
          <div className="flex items-center gap-1">
            {carFilters.map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                  i === 0
                    ? 'bg-foreground text-background'
                    : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your cars…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16 text-sm text-red-500">
            Failed to load cars. Please try again.
          </div>
        )}

        {!isLoading && !isError && cars?.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            You haven't listed any cars yet.
          </div>
        )}

        {/* Car Grid */}
        {!isLoading && !isError && cars && cars.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {cars.map((car) => (
              <CarCard key={car.name} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}