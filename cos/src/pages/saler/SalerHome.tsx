// pages/dashboard/SalerHome.tsx
import { Tag, MessageSquare, Car, Wallet } from 'lucide-react'

const cars = [
  { id: 1, brand: 'toyota', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: false, location: null },
  { id: 2, brand: 'toyota', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: true, location: 'Hounslow (1 mile)' },
  { id: 3, brand: 'toyota', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: false, location: 'Hounslow (1 mile)' },
  { id: 4, brand: 'toyota', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: false, location: 'Hounslow (1 mile)' },
  { id: 5, brand: 'vw', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: false, location: null },
  { id: 6, brand: 'vw', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: true, location: null },
  { id: 7, brand: 'vw', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: true, location: null },
  { id: 8, brand: 'vw', name: 'TOYOTA LAND CRUISER', desc: '87000km1200cctsi comfort line bru motion grade', miles: '79.000 miles', year: '2018 (reg)', price: '£14,000', sold: false, location: null },
]

const carFilters = ['All Cars', 'Sold', 'Unsold', 'Cars with Offers', 'No Offers Yet', 'Deal in Progress']

// Simple Toyota/VW logo placeholder
function CarLogo({ brand }: { brand: string }) {
  if (brand === 'toyota') {
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
  return (
    <div className="w-8 h-8 rounded-full bg-[#1a1a6e] flex items-center justify-center">
      <span className="text-white text-[10px] font-bold">VW</span>
    </div>
  )
}

// Car image placeholder
function CarImage({ brand, sold }: { brand: string; sold: boolean }) {
  const src = brand === 'toyota'
    ? 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=400&q=80'
    : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80'

  return (
    <div className="relative w-full h-[130px] bg-gray-100 rounded-t-md overflow-hidden">
      <img src={src} alt="car" className="object-cover w-full h-full" />
      {sold && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-[#FF5722] text-white font-bold text-[22px] px-6 py-1 rotate-[-15deg] shadow-lg"
            style={{ transform: 'rotate(-15deg)', letterSpacing: '0.01em' }}
          >
            Sold Out
          </div>
        </div>
      )}
    </div>
  )
}

export default function SalerHome() {
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

          {/* My Tracking */}
          <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Car className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-[13px] text-muted-foreground font-medium">My Tracking</span>
            </div>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <div className="text-[28px] font-bold text-foreground leading-none">4</div>
                <div className="text-[12px] text-muted-foreground mt-1">Cars At Sea</div>
              </div>
              <div>
                <div className="text-[28px] font-bold text-foreground leading-none">1</div>
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
          {/* Filter tabs */}
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

        {/* Car Grid */}
        <div className="grid grid-cols-4 gap-4">
          {cars.map((car) => (
            <div key={car.id} className="overflow-hidden bg-white border rounded-lg border-border">
              {/* Top actions */}
              <div className="relative">
                {/* Brand logo top-left */}
                <div className="absolute z-10 top-2 left-2">
                  <CarLogo brand={car.brand} />
                </div>
                {/* Message / Edit top-right */}
                <div className="absolute z-10 flex items-center gap-1 top-2 right-2">
                  <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-green-600 border border-green-200 hover:bg-green-50 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Message
                  </button>
                  <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                    ✏ Edit
                  </button>
                </div>
                <CarImage brand={car.brand} sold={car.sold} />
              </div>

              {/* Card body */}
              <div className="p-3">
                {/* Stats row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span>👁</span>
                    <span>13.6k</span>
                  </div>
                  {/* Dot rating */}
                  <div className="flex items-center gap-0.5">
                    {[0,1,2,3].map(d => (
                      <span key={d} className={`w-1.5 h-1.5 rounded-full ${d === 0 ? 'bg-gray-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">1/30</span>
                </div>

                {/* Title */}
                <div className="text-[12px] font-bold text-foreground mb-1">{car.name}</div>
                <div className="text-[11px] text-muted-foreground mb-2 leading-[1.4]">{car.desc}</div>

                {/* Tags */}
                <div className="flex items-center gap-1 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">{car.miles}</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600">{car.year}</span>
                </div>

                {/* Price */}
                <div className="text-[15px] font-bold text-[#FF5722]">{car.price}</div>

                {/* Location */}
                {car.location && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                    <span>📍</span>
                    <span>{car.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}