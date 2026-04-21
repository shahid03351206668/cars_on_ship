import { useState, useMemo } from "react"
import { Car, SlidersHorizontal, X } from "lucide-react"
import DataTable, { type ColumnDef } from "../../components/ui/Datatable"
import AdvancedSearchPanel, { type AdvancedFilters } from "@/components/AdvancedSearchPanel"
import { useAds } from "../../hooks/useVehicles"
import type { Ad } from "../../api/vehicles"

// ─── Columns Configuration ─────────────────────────────────────

// We define the type to include the 'id' requirement for the DataTable
const CAR_COLUMNS: ColumnDef<Ad & { id: string }>[] = [
  { 
    key: "images", 
    label: "Photo", 
    render: (row) => {
      const firstImage = row.images && row.images.length > 0 ? row.images[0] : null;
      return (
        <div className="flex items-center justify-center w-20 overflow-hidden rounded-lg h-14 bg-gray-100 border border-gray-100">
          {firstImage ? (
            <img 
              src={firstImage} 
              alt={row.model} 
              className="object-cover w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/80x56?text=No+Img"; }}
            />
          ) : (
            <Car className="w-10 text-gray-300 h-7" />
          )}
        </div>
      );
    }
  },
  { 
    key: "name", 
    label: "Vehicle Details", 
    render: (row) => (
      <div>
        <p className="text-xs font-bold text-gray-900">{row.make} {row.model}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-tight">
          {row.body_type} • {row.fuel_type} • {row.gearbox}
        </p>
      </div>
    )
  },
  { key: "year", label: "Year", sortable: true, render: (row) => <span className="text-xs">{row.year}</span> },
  { 
    key: "seats", 
    label: "Specs", 
    render: (row) => (
      <div className="text-[10px] text-gray-600">
        <p>{row.doors} Doors</p>
        <p>{row.seats} Seats</p>
      </div>
    ) 
  },
  { 
    key: "seller_type", 
    label: "Seller", 
    render: (row) => <span className="text-[11px] text-gray-500 italic">{row.seller_type}</span> 
  },
  { 
    key: "vehicle_status", 
    label: "Status", 
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FC7844] text-[10px] font-medium border border-orange-100">
        {row.vehicle_status}
      </span>
    ) 
  },
]

const QUICK_FILTERS = ["Make and model", "Price", "Year", "Mileage", "Gear box", "Body type"]

// ─── Main Component ───────────────────────────────────────────

export default function BrowseCarsPage() {
  const [filters, setFilters] = useState<AdvancedFilters | undefined>(undefined)
  const [filterOpen, setFilterOpen] = useState(true)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

  // Fetch dynamic data based on filters
  const { data: ads = [], isLoading } = useAds(filters)

  // Transform data to ensure 'id' is present (mapping it from 'name')
  const formattedAds = useMemo(() => {
    return ads.map((ad) => ({
      ...ad,
      id: ad.name, // Use 'name' as the unique ID for DataTable keys
    })) as (Ad & { id: string })[];
  }, [ads]);

  return (
    <div className="flex h-full bg-gray-50">
      
      {/* Sidebar Filter Panel */}
      {filterOpen && (
        <div className="flex flex-col h-full overflow-y-auto border-r border-gray-100 shadow-sm w-80 shrink-0 bg-white">
          <AdvancedSearchPanel
            onSearch={(appliedFilters) => {
              setFilters(appliedFilters)
            }}
            onClose={() => setFilterOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
              filterOpen ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {filterOpen ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            {filterOpen ? "Close" : "Filters"}
          </button>

          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveQuickFilter(activeQuickFilter === f ? null : f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                activeQuickFilter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="px-6 py-3 shrink-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            {isLoading ? (
              <span className="text-gray-400 animate-pulse text-xs">Fetching latest inventory...</span>
            ) : (
              <>
                <span className="text-[#FC7844] font-bold">{formattedAds.length}</span> 
                Vehicles Available
              </>
            )}
          </p>
        </div>

        {/* Table Container */}
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 border-4 border-[#FC7844] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Loading dynamic data...</p>
              </div>
            ) : formattedAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-sm text-gray-500">
                <p className="font-medium">No results found.</p>
                <p className="text-xs text-gray-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <DataTable
                columns={CAR_COLUMNS}
                data={formattedAds}
                defaultPageSize={10}
                onRowClick={(car) => console.log("Viewing car:", car.id)}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}