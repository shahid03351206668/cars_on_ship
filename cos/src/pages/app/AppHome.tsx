import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowRight,
  ShoppingBag,
  Gavel,
  Truck,
  Phone,
  MessageCircle,
  Clock,
  ChevronUp,
} from "lucide-react";
import { getRecentlyViewed, type RecentCar } from "@/lib/recentlyViewed"
import { useAds,useMakes, useModels, useYears } from "@/hooks/useVehicles";
import type {Ad , Make, Model, Year } from "@/api/vehicles";
import AdvancedSearchPanel, { type AdvancedFilters } from "@/components/AdvancedSearchPanel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
// ─── Types ───────────────────────────────────────────────────
 
interface HeroSectionProps {
  onFiltersApplied: (filters: AdvancedFilters | Partial<AdvancedFilters>) => void
}
interface CarsSectionProps {
  filters?: Partial<AdvancedFilters>
}
 
 
// ─── Japan Clock ─────────────────────────────────────────────
const JapanClock = () => {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
 
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const jp = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      const h = String(jp.getHours()).padStart(2, "0");
      const m = String(jp.getMinutes()).padStart(2, "0");
      const s = String(jp.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
      setDateStr(jp.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
 
  return (
    <span className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-xs text-gray-300">Japan Time:</span>
      <span className="text-xs text-gray-300">{dateStr}</span>
      <span className="text-[#FC7844] text-xs font-mono font-bold">{time}</span>
    </span>
  );
};
 
 
 
export const HeroSection = ({ onFiltersApplied }: HeroSectionProps) => {
 
  const [selectedMake, setSelectedMake] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
 
  const { data: makes, isLoading: makesLoading } = useMakes()
  const { data: models, isLoading: modelsLoading } = useModels(selectedMake)
  const { data: years, isLoading: yearsLoading } = useYears()
 
  const handleAdvancedSearch = (filters: AdvancedFilters) => {
    console.log("Advanced filters applied:", filters)
    onFiltersApplied(filters)  
    setAdvancedOpen(false)
  }
 
  const handleQuickSearch = () => {
    const filters: Partial<AdvancedFilters> = {
      make: selectedMake || undefined,
      model: selectedModel || undefined,
      yearFrom: selectedYear || undefined,
      yearTo: selectedYear || undefined,
    }
    onFiltersApplied(filters)
  }

 
  // Close panel on outside click
  useEffect(() => {
    if (!advancedOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAdvancedOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [advancedOpen])
 
  return (
    <section className="relative min-h-[540px] bg-[#212123] overflow-hidden flex flex-col">
      <div
        className="absolute inset-0 bg-center bg-cover opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#212123]/90 via-[#212123]/60 to-transparent" />
 
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pt-16 pb-8 text-center">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-3xl font-['Barlow_Condensed',sans-serif] uppercase">
          World's first platform showing{" "}
          <span className="text-[#FC7844]">cars already on the ship</span>
        </h1>
        <p className="max-w-xl mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
          You can request your preferred car, and we will help you source it as quickly as possible.
        </p>
        <button className="mt-8 inline-flex items-center gap-2 bg-[#FC7844] hover:bg-[#e86a35] text-white font-semibold px-6 py-3 rounded transition-colors duration-200 text-sm">
          Request a Car
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
 
      {/* Search Bar */}
      <div className="relative z-10 w-full max-w-4xl px-4 pb-6 mx-auto">
        <div className="p-5 bg-white shadow-2xl rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#212123]">Search Your Vehicle</span>
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center gap-1 text-xs text-[#FC7844] hover:underline font-medium"
            >
              Advance Search
              {advancedOpen
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
 
          {/* Quick search row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Make */}
            <div>
              <label className="block mb-1 text-xs font-medium tracking-wide text-gray-400 uppercase">Make</label>
              <div className="relative">
                <select
                  value={selectedMake}
                  onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel("") }}
                  className="appearance-none w-full bg-white border border-gray-200 text-gray-700 text-sm rounded px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FC7844] cursor-pointer"
                >
                  <option value="">Select Make</option>
                  {makesLoading
                    ? <option disabled>Loading...</option>
                    : makes?.map((m: Make) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
              </div>
            </div>
 
            {/* Model */}
            <div>
              <label className="block mb-1 text-xs font-medium tracking-wide text-gray-400 uppercase">Model</label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedMake}
                  className="appearance-none w-full bg-white border border-gray-200 text-gray-700 text-sm rounded px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FC7844] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{!selectedMake ? "Select Make first" : "Select Model"}</option>
                  {modelsLoading
                    ? <option disabled>Loading...</option>
                    : models?.map((m: Model) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
              </div>
            </div>
 
            {/* Year */}
            <div>
              <label className="block mb-1 text-xs font-medium tracking-wide text-gray-400 uppercase">Year</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-200 text-gray-700 text-sm rounded px-3 py-2.5 pr-8 focus:outline-none focus:border-[#FC7844] cursor-pointer"
                >
                  <option value="">Select Year</option>
                  {yearsLoading
                    ? <option disabled>Loading...</option>
                    : years?.map((y: Year) => <option key={y.name} value={y.year}>{y.year}</option>)}
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
              </div>
            </div>
          </div>
 
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleQuickSearch}
              className="flex items-center gap-2 bg-[#FC7844] hover:bg-[#e86a35] text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
 
        {/* Advanced Search Panel — slides in below the search card */}
        {advancedOpen && (
          <div ref={panelRef} className="mt-2 duration-200 animate-in fade-in slide-in-from-top-2">
            <AdvancedSearchPanel
              onSearch={handleAdvancedSearch}
              onClose={() => setAdvancedOpen(false)}
            />
          </div>
        )}
      </div>
 
      {/* Bottom bar */}
      <div className="relative z-10 bg-[#1a1a1c]/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <JapanClock />
          <div className="flex items-center gap-4">
            <a href="tel:+0123456789" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#FC7844]" />
              Call: 0123456789
            </a>
            <a href="#" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <MessageCircle className="w-3.5 h-3.5 text-[#FC7844]" />
              Whatsapp: 0123456789
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How To Buy Section ───────────────────────────────────────
const HowToBuyStep = ({
  icon: Icon,
  title,
  desc,
  step,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  step: number;
}) => (
  <div className="flex flex-col items-center px-6 py-8 text-center transition-shadow duration-200 bg-white border border-gray-100 rounded-lg hover:shadow-md">
    <div className="flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-orange-50">
      <Icon className="w-6 h-6 text-[#FC7844]" />
    </div>
    <h3 className="text-lg font-bold text-[#212123] mb-2">{title}</h3>
    <p className="mb-4 text-sm leading-relaxed text-gray-500">{desc}</p>
    <span className="text-xs font-semibold text-[#FC7844] uppercase tracking-widest">
      Step {step}
    </span>
  </div>
);

const HowToBuySection = () => (
  <section className="px-4 py-16 bg-white">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-center text-3xl font-bold text-[#212123] mb-12 font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
        How to buy a car from Japan
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <HowToBuyStep
          icon={ShoppingBag}
          title="Browse & Select Your Car"
          desc="Start by browsing our wide selection of used cars, including popular models like used Mercedes, VW used cars and Golf cars. After selecting your ideal vehicle, let us know, and we'll begin the sourcing process."
          step={1}
        />
        <HowToBuyStep
          icon={Gavel}
          title="Sourcing & Bidding"
          desc="Our experienced buyers use advanced auction systems to source your auction cars from trusted Japanese used car supplier auctions, leasing companies, and rental agents nationwide. We focus on finding the best used-car deals for you."
          step={2}
        />
        <HowToBuyStep
          icon={Truck}
          title="Delivery & Finalizing"
          desc="Once we've secured your car, we handle the shipping at the lowest rates available. Your car will be delivered quickly, and we ensure everything is taken care of so you can enjoy your new purchase."
          step={3}
        />
      </div>
    </div>
  </section>
);

// ─── Car Card ─────────────────────────────────────────────────
const CarCard = ({ car }: { car: Ad }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  
  // shadcn Carousel API for syncing dots and current slide
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    // We removed the synchronous setCurrent here.
    // The initial state is already 0, so we only need to listen for changes.
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleCardClick = () => {
    // addToRecentlyViewed({
    //   name: car.name,
    //   make: car.make,
    //   model: car.model,
    //   year: car.year,
    //   images: car.images,
    // });
    navigate(`/cars/${car.name}`);
  };

  const images = car.images?.length
    ? car.images
    : ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80"];

  return (
    <div className="overflow-hidden transition-all duration-200 bg-white border border-gray-100 rounded-xl hover:shadow-lg group">
      
      {/* IMAGE CAROUSEL SECTION */}
      {/* Added group/carousel to only show arrows when hovering the image area */}
      <div className="relative overflow-hidden group/carousel">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((src, index) => (
              <CarouselItem key={index}>
                <img
                  src={src}
                  alt={`${car.make} ${car.model}`}
                  onClick={handleCardClick}
                  className="object-cover w-full transition-transform duration-300 cursor-pointer h-44 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80";
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows - Styled to float over the image like Airbnb cards */}
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute w-8 h-8 transition-opacity -translate-y-1/2 opacity-0 left-2 top-1/2 bg-white/80 backdrop-blur-sm group-hover/carousel:opacity-100" />
              <CarouselNext className="absolute w-8 h-8 transition-opacity -translate-y-1/2 opacity-0 right-2 top-1/2 bg-white/80 backdrop-blur-sm group-hover/carousel:opacity-100" />
            </>
          )}
        </Carousel>

        {/* Image count tag */}
        <span className="absolute z-10 top-2 right-2 bg-[#212123]/80 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
          {current + 1}/{images.length}
        </span>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents click from bubbling up (if nested)
            setLiked(!liked);
          }}
          className="absolute z-10 flex items-center justify-center w-8 h-8 transition-colors rounded-full top-2 left-2 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? "fill-[#FC7844] text-[#FC7844]" : "text-gray-400"
            }`}
          />
        </button>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute z-10 flex gap-1 -translate-x-1/2 bottom-2 left-1/2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  api?.scrollTo(i); // Utilize shadcn API to jump to slide
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? "bg-[#FC7844]" : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* TEXT CONTENT SECTION */}
      <div 
        className="p-4 cursor-pointer"
        onClick={handleCardClick}
      >
        <h4 className="font-bold text-[#212123] text-base tracking-wide">
          {car.make} {car.model} {car.year}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5 truncate capitalize">
          {car.colour} · {car.body_type}
        </p>
        <div className="flex gap-2 mt-3">
          <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
            {car.year}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded capitalize ${
              car.vehicle_status === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {car.vehicle_status}
          </span>
        </div>
      </div>
      
    </div>
  );
};

// ─── Cars Section ─────────────────────────────────────────────
const CarsSection = ({ filters }: CarsSectionProps) => {
  

  const [gridCols] = useState(3);
  // const { data: ads, isLoading, isError } = useAds();
  const { data: ads, isLoading, isError } = useAds(filters); // ← pass filters

  return (
    <section className="bg-[#212123] py-14 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-white text-3xl font-bold font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
            Cars Newly Updated
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            (as at {new Date().toLocaleDateString("en-GB")}{" "}
            {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })})
          </p>
        </div>

        {/* Filter tabs */}
        {/* <div className="flex flex-wrap gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded text-sm font-medium border transition-all duration-150 ${
                activeFilter === tab
                  ? "bg-[#FC7844] border-[#FC7844] text-white"
                  : "bg-transparent border-white/20 text-gray-300 hover:border-white/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* Grid controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* <div className="flex items-center gap-1">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            {[12, 24, 36].map((n) => (
              <button
                key={n}
                onClick={() => setGridCols(n === 12 ? 2 : n === 24 ? 3 : 4)}
                className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                  (gridCols === 2 && n === 12) ||
                  (gridCols === 3 && n === 24) ||
                  (gridCols === 4 && n === 36)
                    ? "border-[#FC7844] text-[#FC7844]"
                    : "border-white/20 text-gray-400 hover:border-white/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div> */}
          <div className="relative">
            <select className="appearance-none bg-[#2e2e30] border border-white/20 text-gray-300 text-sm rounded px-3 py-1.5 pr-7 focus:outline-none focus:border-[#FC7844]">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="py-10 text-center text-red-400">
            Failed to load cars. Please try again.
          </p>
        )}

        {!isLoading && !isError && ads?.length === 0 && (
          <p className="py-10 text-center text-gray-400">No cars available.</p>
        )}

        {!isLoading && !isError && ads && ads.length > 0 && (
          <div
            className={`grid gap-5 ${
              gridCols === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : gridCols === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {ads.map((car) => (
              <CarCard key={car.name} car={car} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <button className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors border rounded border-white/20 hover:border-white/40 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              className={`w-8 h-8 text-sm rounded border transition-colors ${
                p === 1
                  ? "bg-[#FC7844] border-[#FC7844] text-white font-bold"
                  : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
          <button className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors border rounded border-white/20 hover:border-white/40 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};


const BRAND_LOGOS: Record<string, string> = {
  Toyota: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/120px-Toyota_carlogo.svg.png",
  BMW: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/120px-BMW.svg.png",
  Mazda: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mazda_logo_with_text.svg/120px-Mazda_logo_with_text.svg.png",
  Audi: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/120px-Audi-Logo_2016.svg.png",
  Honda: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/120px-Honda.svg.png",
  Mercedes: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/120px-Mercedes-Logo.svg.png",
  Volkswagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/120px-Volkswagen_logo_2019.svg.png",
  Volvo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Volvo_Cars_logo.svg/120px-Volvo_Cars_logo.svg.png",
  Nissan: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nissan_2020_logo.svg/120px-Nissan_2020_logo.svg.png",
  Subaru: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Subaru_logo.svg/120px-Subaru_logo.svg.png",
  Lexus: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lexus_-_Target_2021.svg/120px-Lexus_-_Target_2021.svg.png",
  Mitsubishi: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Mitsubishi_logo.svg/120px-Mitsubishi_logo.svg.png",
}
 
interface SearchByMakerSectionProps {
  onMakerSelect?: (make: string) => void
}
export function SearchByMakerSection({ onMakerSelect }: SearchByMakerSectionProps) {
  const { data: makes } = useMakes()
  const [selected, setSelected] = useState<string | null>(null)
 
  // Show up to 8 makes that have logos, padded with all makes
  const displayMakes = (makes ?? []).slice(0, 8)
 
  const handleSelect = (name: string) => {
    const next = selected === name ? null : name
    setSelected(next)
    onMakerSelect?.(next ?? "")
  }
 
  return (
    <section className="px-4 bg-white py-14">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-[#212123] text-2xl font-bold font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
            Search By Maker
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Use tempor velit adipiscing est
          </p>
        </div>
 
        {/* Selected pill */}
        {selected && (
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-[#FC7844] text-white text-xs font-bold px-3 py-1.5 rounded">
              {selected.toUpperCase()}
              <button
                onClick={() => handleSelect(selected)}
                className="transition-opacity hover:opacity-70"
              >
                ×
              </button>
            </span>
          </div>
        )}
 
        {/* Logo grid */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {displayMakes.length > 0
            ? displayMakes.map((make) => {
                const logo = BRAND_LOGOS[make.name]
                const isSelected = selected === make.name
                return (
                  <button
                    key={make.name}
                    onClick={() => handleSelect(make.name)}
                    title={make.name}
                    className={`w-[72px] h-[72px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-[#FC7844] bg-orange-50 scale-110 shadow-md"
                        : "border-gray-200 bg-white hover:border-[#FC7844] hover:scale-105 hover:shadow-sm"
                    }`}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={make.name}
                        className="object-contain w-10 h-10"
                        onError={(e) => {
                          const t = e.currentTarget
                          t.style.display = "none"
                          t.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <span
                      className={`text-[10px] font-bold text-gray-500 text-center leading-tight px-1 ${logo ? "hidden" : ""}`}
                    >
                      {make.name}
                    </span>
                  </button>
                )
              })
            : /* Skeleton */
              [...Array(8)].map((_, i) => (
                <div key={i} className="w-[72px] h-[72px] rounded-lg bg-gray-100 animate-pulse" />
              ))}
        </div>
      </div>
    </section>
  )
}


 
// ── Mini Card ──────────────────────────────────────────────────
function MiniCarCard({ car }: { car: RecentCar }) {
  const img = car.images?.[0] ?? "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70"
  return (
    <div className="flex flex-col gap-1 cursor-pointer group">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3]">
        <img
          src={img}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p className="text-[11px] font-semibold text-gray-800 truncate">
        {car.year} {car.make} {car.model}
      </p>
      {car.price && (
        <p className="text-[11px] text-[#FC7844] font-bold">
          {car.price.toLocaleString()} 000X
        </p>
      )}
    </div>
  )
}
 

  const DEMO_CARS: RecentCar[] = [
  { name: "car-1", make: "FJA300W", model: "GR Sports", year: 2025, price: 7000, images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=70"] },
  { name: "car-2", make: "GDU250W", model: "GX 4WD", year: 2025, price: 4500, images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=70"] },
  { name: "car-3", make: "TR1250W", model: "VX 4WD", year: 2025, price: 4900, images: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70"] },
  { name: "car-4", make: "FJA300W", model: "GR Sports", year: 2025, price: 7000, images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=70"] },
  { name: "car-5", make: "GDU250W", model: "GX 4WD", year: 2025, price: 4500, images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=70"] },
  { name: "car-6", make: "TR1250W", model: "VX 4WD", year: 2025, price: 4900, images: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=70"] },
]
// ── Main Section ───────────────────────────────────────────────


export function RecentlyViewedSection() {
  // Lazy initializer runs once on mount — no useEffect needed
  const [cars] = useState<RecentCar[]>(() => {
    const stored = getRecentlyViewed()
    return stored.length > 0 ? stored : DEMO_CARS
  })
 
  if (cars.length === 0) return null
 
  const [featured, ...rest] = cars
 
  return (
    <section className="bg-[#1a1a1c] py-14 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
            Recently viewed vehicle
          </h2>
          <p className="mt-1 text-xs text-gray-500">Nisi tempor velit adipiscing est</p>
        </div>
 
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Featured large card */}
          <div className="relative lg:w-[340px] shrink-0 overflow-hidden rounded-xl bg-gray-900 cursor-pointer group">
            <img
              src={featured.images?.[0] ?? "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=700&q=80"}
              alt={`${featured.year} ${featured.make} ${featured.model}`}
              className="w-full h-full object-cover min-h-[260px] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-semibold text-white">
                {featured.year} {featured.make} {featured.model}
              </p>
              {featured.price && (
                <p className="text-[#FC7844] text-sm font-bold mt-0.5">
                  {featured.price.toLocaleString()} 000X
                </p>
              )}
            </div>
          </div>
 
          {/* Grid of remaining */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {rest.map((car) => (
                <MiniCarCard key={car.name} car={car} />
              ))}
            </div>
 
            {/* View All */}
            <div className="mt-6">
              <button className="inline-flex items-center gap-2 bg-[#FC7844] hover:bg-[#e86a35] text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors duration-200">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


interface Testimonial {
  id: number
  name: string
  role?: string
  avatar: string
  text: string
  rating: number
}
 
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Becky Nelson",
    role: "Verified Buyer",
    avatar: "https://i.pravatar.cc/100?img=47",
    text: "Lorem ipsum dolor sit amet consectetur. Adipiscing ut faucibus ullamcorper velit adipiscing sed. 3. ullamcorper velit adipiscing sed. 3. ullamcorper est facilisi. Ut pariatur nisi nisi malesuada parturient quis at facilisi. Ut pariatur nisi facilisi.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Okafor",
    role: "Verified Buyer",
    avatar: "https://i.pravatar.cc/100?img=12",
    text: "Exceptional service from start to finish. Found my dream car within days — the shipping tracker was incredibly useful. Would absolutely recommend to anyone importing from Japan.",
    rating: 5,
  },
  {
    id: 3,
    name: "Amina Hassan",
    role: "Verified Buyer",
    avatar: "https://i.pravatar.cc/100?img=32",
    text: "I was skeptical at first, but the process was smooth and transparent. The team kept me updated every step of the way. My Toyota arrived in perfect condition.",
    rating: 4,
  },
]
 
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 20 20"
          fill={s <= rating ? "#FC7844" : "#e5e7eb"}
          className="w-4 h-4"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.64 9.394c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.967z" />
        </svg>
      ))}
    </div>
  )
}
 
export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
 
  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1))
 
  const t = TESTIMONIALS[current]
 
  return (
    <section className="relative px-4 py-16 overflow-hidden bg-white">
      {/* Background decoration circles */}
      <div className="absolute w-32 h-32 bg-gray-100 rounded-full top-8 left-8 opacity-60" />
      <div className="absolute w-24 h-24 bg-gray-100 rounded-full opacity-50 bottom-8 right-12" />
      <div className="absolute w-16 h-16 bg-gray-100 rounded-full top-1/2 right-4 opacity-40" />
      <div className="absolute w-12 h-12 bg-gray-100 rounded-full bottom-16 left-1/3 opacity-40" />
 
      <div className="relative max-w-2xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-[#212123] text-2xl font-bold font-['Barlow_Condensed',sans-serif] uppercase tracking-wide">
          What Our Customers Say
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          (as at {new Date().toLocaleDateString("en-GB")}{" "}
          {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })})
        </p>
 
        {/* Testimonial card */}
        <div className="mt-10">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <img
              src={t.avatar}
              alt={t.name}
              className="object-cover w-16 h-16 rounded-full shadow-lg ring-4 ring-white"
            />
          </div>
 
          {/* Quote marks + text */}
          <div className="relative px-8">
            <span className="absolute -top-2 left-4 text-[#FC7844] text-5xl font-serif leading-none select-none">
              "
            </span>
            <p className="text-sm italic leading-relaxed text-gray-600">
              {t.text}
            </p>
            <span className="absolute -bottom-4 right-4 text-[#FC7844] text-5xl font-serif leading-none select-none">
              "
            </span>
          </div>
 
          {/* Name & stars */}
          <div className="mt-8">
            <p className="text-[#212123] font-semibold text-sm">{t.name}</p>
            {t.role && <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>}
            <div className="flex justify-center">
              <StarRating rating={t.rating} />
            </div>
          </div>
        </div>
 
        {/* Dots navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={prev}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#FC7844] hover:text-[#FC7844] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === current ? "bg-[#FC7844] w-4" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
          <button
            onClick={next}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#FC7844] hover:text-[#FC7844] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}


// ─── Main AppHome ─────────────────────────────────────────────
export default function AppHome() {
  const [activeFilters, setActiveFilters] = useState<Partial<AdvancedFilters>>({})
   const handleMakerSelect = (make: string) => {
    setActiveFilters((prev) => ({ ...prev, make }))
    // Scroll to cars section
    document.getElementById("cars-section")?.scrollIntoView({ behavior: "smooth" })
  }
 
  return (
    <main className="bg-gray-50 min-h-screen font-['Barlow',sans-serif]">
      <HeroSection onFiltersApplied={setActiveFilters} />
      <HowToBuySection />
      <CarsSection filters={activeFilters}/>
      <SearchByMakerSection onMakerSelect={handleMakerSelect} />
      <RecentlyViewedSection />
      <TestimonialsSection />
    </main>
  );
}