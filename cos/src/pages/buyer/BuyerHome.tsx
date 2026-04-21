import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Car, Clock, Heart, Send, Package, Eye,
  ChevronRight, MapPin, Settings2,
  ArrowUpRight, ChevronLeft, X, Menu
} from "lucide-react"
import { useAds } from "../../hooks/useVehicles"
import type { Ad } from "../../api/vehicles"
import { fetchAPIAuthPost, fetchFavoriteAds, type FavoriteAdResponse } from "../../api/vehicles"
import AdvancedSearchPanel from "../../components/AdvancedSearchPanel"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────

interface AdvancedFilters {
  make?: string
  model?: string
  variant?: string
  yearFrom?: string
  yearTo?: string
  priceFrom?: string
  priceTo?: string
  mileageFrom?: string
  mileageTo?: string
  eta?: string
  engineSizeFrom?: string
  engineSizeTo?: string
  fromPort?: string
  toPort?: string
  fromPostingDate?: string
  toPostingDate?: string
  vehicleStatuses?: string[]
  gearboxes?: string[]
  bodyTypes?: string[]
  colours?: string[]
  doors?: string[]
  seats?: string[]
  fuelTypes?: string[]
  accelerations?: string[]
  driveTypes?: string[]
  bootSpaces?: string[]
  sellerTypes?: string[]
}

// ─── Mock Data for Static Sections ────────────────────────

const STATS = [
  { label: "Cars In Transit", value: 2, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Recently Watched", value: 230, icon: Eye, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "My Favorite Cars", value: 137, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "My Requested Cars", value: 3, icon: Send, color: "text-amber-500", bg: "bg-amber-50" },
]

const WALLET = {
  onHoldAdvances: 6000,
  balance: 10010,
}

const ACTIVE_DEAL = {
  name: "LAND CRUISER",
  importerName: "Fanklin",
  price: 14000,
  image: null,
  countdown: { days: "07", hours: "11", mins: "01", secs: "02" },
  status: "You are on waiting",
}

const TABS = ["Latest Cars", "Recently Watched", "Favorite Cars", "Importers"]

// ─── Sub-components ────────────────────────────────────────

function CarPlaceholder({ badge, image }: { badge: string; image?: string }) {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-xl overflow-hidden relative">
      {image ? (
        <img src={image} alt={badge} className="object-cover w-full h-full" />
      ) : (
        <Car className="w-16 h-16 text-gray-300" />
      )}
      <span className="absolute top-2 left-2 bg-white text-[10px] font-bold px-2 py-0.5 rounded shadow text-gray-600">
        {badge}
      </span>
    </div>
  )
}

export function CarCard({ car, isFavorite, onFavoriteToggle, isLoading }: { 
  car: Ad
  isFavorite: boolean
  onFavoriteToggle: (e: React.MouseEvent) => void
  isLoading: boolean
}) {
  const navigate = useNavigate()

  const displayPrice = car.price || 14000
  const displayMileage = car.mileage || 79000
  const firstImage = car.images?.[0] || undefined

  return (
    <div 
      className="overflow-hidden transition-all bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md group"
      onClick={() => navigate(`/buyer/car/${car.name}`)}
    >
      <div className="relative">
        <CarPlaceholder badge={car.make} image={firstImage} />
        
        {/* Favorite Button */}
        <button
          onClick={onFavoriteToggle}
          disabled={isLoading}
          className={`absolute flex items-center justify-center bg-white rounded-full shadow top-2 right-2 w-7 h-7 transition-all active:scale-90 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100 hover:scale-110"
          }`}
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite
                ? "fill-rose-500 text-rose-500" 
                : "text-gray-400 group-hover:text-gray-600"
            }`} 
          />
        </button>

        <button 
          onClick={(e) => e.stopPropagation()}
          className="absolute flex items-center justify-center bg-white rounded-full shadow bottom-2 right-2 w-7 h-7 hover:bg-gray-50"
        >
          <Settings2 className="w-3.5 h-3.5 text-gray-400" />
        </button>

        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
          1/{car.images?.length || 1}
        </span>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold tracking-wide text-gray-900 uppercase truncate">
            {car.make} {car.model}
          </p>
          <span className="text-[10px] text-gray-400 font-medium">
            {car.year}
          </span>
        </div>

        <p className="text-[10px] text-gray-400 mt-0.5 truncate leading-relaxed">
          {displayMileage.toLocaleString()}km • {car.description || "No description provided"}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded">
            {car.fuel_type || "Petrol"}
          </span>
          <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded">
            {car.gearbox || "Manual"}
          </span>
        </div>

        <div className="flex items-baseline gap-1 mt-3">
          <p className="text-base font-bold text-[#FC7844]">
            £{displayPrice.toLocaleString()}
          </p>
          <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
            £{(displayPrice * 1.1).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
          <MapPin className="w-3 h-3 text-gray-300" />
          <span className="text-[10px] text-gray-400">
            {car.seller_type || "Private Seller"}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────

export default function BuyerHome() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Latest Cars")
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Partial<AdvancedFilters>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const queryClient = useQueryClient()

  // Fetch ads with filters
  const { data: ads = [], isLoading, error } = useAds(filters)

  // Fetch favorite ads for current user
  const { data: favoriteAds = [] } = useQuery<FavoriteAdResponse[]>({
    queryKey: ["favoriteAds"],
    queryFn: fetchFavoriteAds,
    staleTime: 1000 * 60 * 5,
  })

  // Create a Set of favorite ad IDs for O(1) lookup
  const favoriteAdIds = new Set(favoriteAds.map(fav => fav.ad))

  // Mutation to toggle favorite
  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async ({ adName, newState }: { adName: string; newState: boolean }) => {
      return await fetchAPIAuthPost("cars_on_ship.api.toggle_favorite", {
        ad: adName,
        enable: newState ? "true" : "false"
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteAds"] })
      queryClient.invalidateQueries({ queryKey: ["ads"] })
    },
  })

  // Calculate pagination
  const totalPages = Math.ceil(ads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAds = ads.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TOP STATISTICS ROW - SINGLE ROW, HORIZONTAL SCROLLABLE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          {/* Horizontal scrollable container on mobile, single row on desktop */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-full sm:min-w-0">
              
              {/* Active Deal Card - Fixed width */}
              <div className="relative p-4 overflow-hidden text-white bg-gray-900 rounded-xl shrink-0 w-full sm:w-auto sm:flex-1 lg:w-80">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 opacity-80" />
                <div className="relative z-10">
                  <p className="mb-2 text-xs font-medium text-gray-400">My Active Deal</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-12 bg-gray-700 rounded h-10 shrink-0">
                      <Car className="w-6 text-gray-500 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{ACTIVE_DEAL.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">Importer: {ACTIVE_DEAL.importerName}</p>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center gap-1 mb-2">
                    {Object.entries(ACTIVE_DEAL.countdown).map(([unit, val]) => (
                      <div key={unit} className="flex flex-col items-center">
                        <div className="bg-[#FC7844] text-white text-[10px] font-bold w-6 h-6 rounded flex items-center justify-center">
                          {val}
                        </div>
                        <span className="text-[7px] text-gray-500 mt-0.5">{unit}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-amber-400 mb-2 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {ACTIVE_DEAL.status}
                  </p>

                  <div className="flex gap-1">
                    <button className="flex-1 text-[9px] py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                      Cancel
                    </button>
                    <button className="flex-1 text-[9px] py-1 rounded bg-[#FC7844] text-white hover:bg-[#e86a35] transition-colors font-medium">
                      Detail
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {STATS.map((stat) => (
                <div key={stat.label} className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl shrink-0 w-40">
                  <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{stat.label}</p>
                </div>
              ))}

              {/* Wallet Card - Fixed width */}
              <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl shrink-0 w-full sm:w-auto sm:flex-1 lg:w-56">
                <div className="flex items-center justify-between mb-3">
                  <p className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                    <span>💳</span> Wallet
                  </p>
                  <button
                    onClick={() => navigate('/buyer/wallet')}
                    className="text-[10px] text-[#FC7844] hover:underline"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <p className="text-[9px] text-amber-600 font-medium">On-hold</p>
                    <p className="text-sm font-bold text-amber-700">£{WALLET.onHoldAdvances.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <p className="text-[9px] text-green-600 font-medium">Available</p>
                    <p className="text-sm font-bold text-green-700">£{WALLET.balance.toLocaleString()}</p>
                  </div>
                </div>
                <button className="mt-2 w-full text-[9px] font-medium text-[#FC7844] border border-[#FC7844] rounded-lg py-1.5 hover:bg-orange-50 transition-colors">
                  + Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA - FLEX LAYOUT WITH SIDEBAR PUSH */}
      {/* ═══════════════════════════════════════════════════════════ */}
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN - FILTER SIDEBAR (Wider - 400px) */}
        <div
          className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
            filterOpen ? "lg:w-[400px]" : "lg:w-0"
          }`}
        >
          {/* Scrollable Filter Panel - Wider with better padding */}
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
              </div>
              <AdvancedSearchPanel
                onSearch={(newFilters) => {
                  setFilters(newFilters)
                  setCurrentPage(1)
                }}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - CAR LISTINGS (Pushes with sidebar) */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* Top Control Bar - Tabs + Menu Toggle */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                
                {/* Menu Toggle Button - Mobile Only */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex lg:hidden items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterOpen
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOpen ? (
                    <>
                      <X className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Menu className="w-4 h-4" />
                      Filters
                    </>
                  )}
                </button>

                {/* Desktop Menu Toggle */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterOpen
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {filterOpen ? (
                    <>
                      <X className="w-4 h-4" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <Menu className="w-4 h-4" />
                      Show Filters
                    </>
                  )}
                </button>

                {/* Tabs - Flex with space-between */}
                <div className="flex items-center gap-1 overflow-x-auto flex-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
            
            {/* Mobile Filter Panel - Full Screen Overlay */}
            {filterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-white overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <AdvancedSearchPanel
                    onSearch={(newFilters) => {
                      setFilters(newFilters)
                      setCurrentPage(1)
                      setFilterOpen(false)
                    }}
                    onClose={() => setFilterOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-gray-500">Loading cars...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                Error loading cars: {error.message}
              </div>
            )}

            {/* Car Grid */}
            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-3">
                  {currentAds.map((car) => (
                    <CarCard 
                      key={car.name}
                      car={car}
                      isFavorite={favoriteAdIds.has(car.name)}
                      onFavoriteToggle={(e) => {
                        e.stopPropagation()
                        if (isPending) return
                        toggleFavorite({
                          adName: car.name,
                          newState: !favoriteAdIds.has(car.name)
                        })
                      }}
                      isLoading={isPending}
                    />
                  ))}
                </div>

                {/* No Results */}
                {currentAds.length === 0 && (
                  <div className="py-12 text-center">
                    <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm text-gray-600">No cars found matching your filters</p>
                    <button
                      onClick={() => setFilters({})}
                      className="mt-2 text-xs text-[#FC7844] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Results Info */}
                {ads.length > 0 && (
                  <p className="text-xs text-center text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, ads.length)} of {ads.length} cars
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}