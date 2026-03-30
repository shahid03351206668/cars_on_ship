import { useState, useCallback } from "react"
import { ChevronDown, ChevronUp, RotateCcw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useMakes,
  useModels,
  useYears,
  useVehicleStatuses,
    useGearboxes,
    useBodyTypes,
    useColours,
    useDoorOptions,
    useSeatOptions,
    useFuelTypes,
    useAccelerationRanges,
    useDriveTypes,
    useBootSpaces,
    useSellerTypes,
} from "@/hooks/useVehicles"

// ─── Filter State ─────────────────────────────────────────────

export interface AdvancedFilters {
  make: string
  model: string
  yearFrom: string
  yearTo: string
  priceFrom: string
  priceTo: string
  mileageFrom: string
  mileageTo: string
  eta: string
  vehicleStatuses: string[]
  gearboxes: string[]
  bodyTypes: string[]
  colours: string[]
  doors: string[]
  seats: string[]
  fuelTypes: string[]
  accelerations: string[]
  driveTypes: string[]
  bootSpaces: string[]
  sellerTypes: string[]
  engineSizeFrom: string
  engineSizeTo: string
}

const EMPTY_FILTERS: AdvancedFilters = {
  make: "", model: "", yearFrom: "", yearTo: "",
  priceFrom: "", priceTo: "",
  mileageFrom: "", mileageTo: "",
  eta: "", vehicleStatuses: [], gearboxes: [],
  bodyTypes: [], colours: [], doors: [], seats: [],
  fuelTypes: [], accelerations: [], driveTypes: [],
  bootSpaces: [], sellerTypes: [],
  engineSizeFrom: "", engineSizeTo: "",
}

// ─── Shared sub-components ────────────────────────────────────

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800 border-b border-gray-100 group"
    >
      <span>{title}</span>
      {open
        ? <ChevronUp className="w-4 h-4 text-[#FC7844]" />
        : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#FC7844] transition-colors" />}
    </button>
  )
}

function SelectField({
  label, value, onChange, placeholder, options, disabled,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="flex-1 min-w-0">
      {label && <p className="mb-1 text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="appearance-none w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-[#FC7844] focus:border-[#FC7844] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function CheckboxGroup({
  items,
  selected,
  onToggle,
  cols = 2,
  loading,
}: {
  items: { value: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
  cols?: number
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className={`grid gap-2 mt-3 ${cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className={`grid gap-x-4 gap-y-2 mt-3 ${cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
      {items.map((item) => {
        const checked = selected.includes(item.value)
        return (
          <label
            key={item.value}
            className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded text-sm transition-colors ${
              checked ? "bg-orange-50 text-[#FC7844] font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(item.value)}
              className="accent-[#FC7844] w-3.5 h-3.5 shrink-0"
            />
            <span className="text-xs truncate">{item.label}</span>
          </label>
        )
      })}
    </div>
  )
}

// ─── Colour Swatches ──────────────────────────────────────────

function ColourSwatches({
  colours,
  selected,
  onToggle,
  loading,
}: {
  colours: Colour[]
  selected: string[]
  onToggle: (v: string) => void
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {colours.map((c) => {
        const isSelected = selected.includes(c.name)
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onToggle(c.name)}
            title={c.name}
            className={`relative w-8 h-8 rounded-full border-2 transition-all ${
              isSelected ? "border-[#FC7844] scale-110 shadow-md" : "border-transparent hover:border-gray-300"
            }`}
            style={{ backgroundColor: c.color_code || "#ccc" }}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Range Row ────────────────────────────────────────────────

function RangeRow({
  label,
  fromValue, onFromChange, fromOptions, fromPlaceholder,
  toValue, onToChange, toOptions, toPlaceholder,
}: {
  label: string
  fromValue: string; onFromChange: (v: string) => void
  fromOptions: { value: string; label: string }[]
  fromPlaceholder: string
  toValue: string; onToChange: (v: string) => void
  toOptions: { value: string; label: string }[]
  toPlaceholder: string
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="flex gap-2">
        <SelectField value={fromValue} onChange={onFromChange} placeholder={fromPlaceholder} options={fromOptions} />
        <SelectField value={toValue} onChange={onToChange} placeholder={toPlaceholder} options={toOptions} />
      </div>
    </div>
  )
}

// ─── Section wrapper with open/close state ────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <SectionHeader title={title} open={open} onToggle={() => setOpen(!open)} />
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

interface Props {
  onSearch: (filters: AdvancedFilters) => void
  onClose: () => void
}

export default function AdvancedSearchPanel({ onSearch, onClose }: Props) {
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS)

  // data hooks
  const { data: makes } = useMakes()
  const { data: models, isLoading: modelsLoading } = useModels(filters.make)
  const { data: years } = useYears()
  const { data: vehicleStatuses, isLoading: vsLoading } = useVehicleStatuses()
  const { data: gearboxes, isLoading: gbLoading } = useGearboxes()
  const { data: bodyTypes, isLoading: btLoading } = useBodyTypes()
  const { data: colours, isLoading: colLoading } = useColours()
  const { data: doors, isLoading: doLoading } = useDoorOptions()
  const { data: seats, isLoading: seLoading } = useSeatOptions()
  const { data: fuelTypes, isLoading: ftLoading } = useFuelTypes()
  const { data: accelerations, isLoading: acLoading } = useAccelerationRanges()
  const { data: driveTypes, isLoading: dtLoading } = useDriveTypes()
  const { data: bootSpaces, isLoading: bsLoading } = useBootSpaces()
  const { data: sellerTypes, isLoading: stLoading } = useSellerTypes()

  // helpers
  const set = useCallback(<K extends keyof AdvancedFilters>(key: K, val: AdvancedFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: val })), [])

  const toggleMulti = useCallback((key: keyof AdvancedFilters, val: string) =>
    setFilters((f) => {
      const arr = f[key] as string[]
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] }
    }), [])

  const reset = () => setFilters(EMPTY_FILTERS)

  // Year options from API
  const yearOptions = (years ?? []).map((y) => ({ value: y.year, label: y.year }))

  // Price options (static ranges)
  const priceOptions = [500, 1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000].map(
    (p) => ({ value: String(p), label: `$${p.toLocaleString()}` })
  )

  // Mileage options
  const mileageOptions = [
    { value: "10000", label: "10,000 km" },
    { value: "30000", label: "30,000 km" },
    { value: "50000", label: "50,000 km" },
    { value: "80000", label: "80,000 km" },
    { value: "100000", label: "100,000 km" },
    { value: "150000", label: "150,000 km" },
    { value: "200000", label: "200,000 km" },
  ]

  // Engine size options
  const engineOptions = [
    { value: "660", label: "660cc" },
    { value: "1000", label: "1,000cc" },
    { value: "1300", label: "1,300cc" },
    { value: "1500", label: "1,500cc" },
    { value: "2000", label: "2,000cc" },
    { value: "2500", label: "2,500cc" },
    { value: "3000", label: "3,000cc" },
    { value: "3500", label: "3,500cc" },
    { value: "4000", label: "4,000cc+" },
  ]

  // ETA options
  const etaOptions = [
    { value: "7", label: "Coming in 7 days" },
    { value: "14", label: "Coming in 14 days" },
    { value: "30", label: "Coming in 30 days" },
    { value: "60", label: "Coming in 60 days" },
  ]

  const activeCount = Object.entries(filters).reduce((acc, [, v]) => {
    if (Array.isArray(v)) return acc + v.length
    return acc + (v ? 1 : 0)
  }, 0)

  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#212123]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Advanced Search</span>
          {activeCount > 0 && (
            <span className="bg-[#FC7844] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-1 max-h-[75vh] overflow-y-auto">

        {/* Make & Model */}
        <Section title="Make & Model">
          <div className="flex gap-2 mt-3">
            <SelectField
              label="Make"
              value={filters.make}
              onChange={(v) => { set("make", v); set("model", "") }}
              placeholder="Select Make"
              options={(makes ?? []).map((m) => ({ value: m.name, label: m.name }))}
            />
            <SelectField
              label="Model"
              value={filters.model}
              onChange={(v) => set("model", v)}
              placeholder={!filters.make ? "Select Make first" : "Select Model"}
              options={(models ?? []).map((m) => ({ value: m.name, label: m.name }))}
              disabled={!filters.make || modelsLoading}
            />
          </div>
        </Section>

        {/* Year Range */}
        <Section title="Year">
          <RangeRow
            label="From – To"
            fromValue={filters.yearFrom} onFromChange={(v) => set("yearFrom", v)}
            fromOptions={yearOptions} fromPlaceholder="From"
            toValue={filters.yearTo} onToChange={(v) => set("yearTo", v)}
            toOptions={yearOptions} toPlaceholder="To"
          />
        </Section>

        {/* Price Range */}
        <Section title="Price Range">
          <RangeRow
            label="From – To"
            fromValue={filters.priceFrom} onFromChange={(v) => set("priceFrom", v)}
            fromOptions={priceOptions} fromPlaceholder="Min Price"
            toValue={filters.priceTo} onToChange={(v) => set("priceTo", v)}
            toOptions={priceOptions} toPlaceholder="Max Price"
          />
        </Section>

        {/* Mileage */}
        <Section title="Mileage">
          <RangeRow
            label="From – To"
            fromValue={filters.mileageFrom} onFromChange={(v) => set("mileageFrom", v)}
            fromOptions={mileageOptions} fromPlaceholder="Min km"
            toValue={filters.mileageTo} onToChange={(v) => set("mileageTo", v)}
            toOptions={mileageOptions} toPlaceholder="Max km"
          />
        </Section>

        {/* ETA */}
        <Section title="ETA">
          <div className="mt-3">
            <SelectField
              value={filters.eta}
              onChange={(v) => set("eta", v)}
              placeholder="Arrival time"
              options={etaOptions}
            />
          </div>
        </Section>

        {/* Vehicle Status */}
        <Section title="Vehicle Status">
          <CheckboxGroup
            items={(vehicleStatuses ?? []).map((s) => ({ value: s.name, label: s.name }))}
            selected={filters.vehicleStatuses}
            onToggle={(v) => toggleMulti("vehicleStatuses", v)}
            cols={2}
            loading={vsLoading}
          />
        </Section>

        {/* Gearbox */}
        <Section title="Gearbox">
          <CheckboxGroup
            items={(gearboxes ?? []).map((g) => ({ value: g.name, label: g.name }))}
            selected={filters.gearboxes}
            onToggle={(v) => toggleMulti("gearboxes", v)}
            cols={2}
            loading={gbLoading}
          />
        </Section>

        {/* Engine Size */}
        <Section title="Engine Size">
          <RangeRow
            label="From – To"
            fromValue={filters.engineSizeFrom} onFromChange={(v) => set("engineSizeFrom", v)}
            fromOptions={engineOptions} fromPlaceholder="Min cc"
            toValue={filters.engineSizeTo} onToChange={(v) => set("engineSizeTo", v)}
            toOptions={engineOptions} toPlaceholder="Max cc"
          />
        </Section>

        {/* Body Type */}
        <Section title="Body Type">
          <CheckboxGroup
            items={(bodyTypes ?? []).map((b: BodyType) => ({ value: b.name, label: b.name }))}
            selected={filters.bodyTypes}
            onToggle={(v) => toggleMulti("bodyTypes", v)}
            cols={2}
            loading={btLoading}
          />
        </Section>

        {/* Colour */}
        <Section title="Colour">
          <ColourSwatches
            colours={colours ?? []}
            selected={filters.colours}
            onToggle={(v) => toggleMulti("colours", v)}
            loading={colLoading}
          />
         
          {filters.colours.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.colours.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-[#FC7844] text-xs rounded-full border border-orange-200">
                  {c}
                  <button onClick={() => toggleMulti("colours", c)} className="hover:opacity-70">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Doors */}
        <Section title="Doors">
          <CheckboxGroup
            items={(doors ?? []).map((d) => ({ value: d.name, label: d.name }))}
            selected={filters.doors}
            onToggle={(v) => toggleMulti("doors", v)}
            cols={3}
            loading={doLoading}
          />
        </Section>

        {/* Seats */}
        <Section title="Seats">
          <CheckboxGroup
            items={(seats ?? []).map((s) => ({ value: s.name, label: s.name }))}
            selected={filters.seats}
            onToggle={(v) => toggleMulti("seats", v)}
            cols={3}
            loading={seLoading}
          />
        </Section>

        {/* Fuel Type */}
        <Section title="Fuel Type">
          <CheckboxGroup
            items={(fuelTypes ?? []).map((f) => ({ value: f.name, label: f.name }))}
            selected={filters.fuelTypes}
            onToggle={(v) => toggleMulti("fuelTypes", v)}
            cols={2}
            loading={ftLoading}
          />
        </Section>

        {/* Acceleration */}
        <Section title="Acceleration (0–62mph)">
          <CheckboxGroup
            items={(accelerations ?? []).map((a) => ({ value: a.name, label: a.name }))}
            selected={filters.accelerations}
            onToggle={(v) => toggleMulti("accelerations", v)}
            cols={2}
            loading={acLoading}
          />
        </Section>

        {/* Drive Type */}
        <Section title="Drive Type">
          <CheckboxGroup
            items={(driveTypes ?? []).map((d) => ({ value: d.name, label: d.name }))}
            selected={filters.driveTypes}
            onToggle={(v) => toggleMulti("driveTypes", v)}
            cols={2}
            loading={dtLoading}
          />
        </Section>

        {/* Boot Space */}
        <Section title="Boot Space">
          <CheckboxGroup
            items={(bootSpaces ?? []).map((b) => ({ value: b.name, label: b.name }))}
            selected={filters.bootSpaces}
            onToggle={(v) => toggleMulti("bootSpaces", v)}
            cols={2}
            loading={bsLoading}
          />
        </Section>

        {/* Seller Type */}
        <Section title="Seller Type">
          <CheckboxGroup
            items={(sellerTypes ?? []).map((s) => ({ value: s.name, label: s.name }))}
            selected={filters.sellerTypes}
            onToggle={(v) => toggleMulti("sellerTypes", v)}
            cols={2}
            loading={stLoading}
          />
        </Section>

      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs border-gray-200 text-gray-500 hover:text-[#FC7844] hover:border-[#FC7844]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
        <Button
          size="sm"
          onClick={() => onSearch(filters)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#FC7844] hover:bg-[#e86a35] text-white text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          Apply Filters
          {activeCount > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-1 rounded">{activeCount}</span>
          )}
        </Button>
      </div>
    </div>
  )
}