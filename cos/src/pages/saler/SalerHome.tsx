import { Tag, MessageSquare, Car, Wallet, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserwiseAds } from "../../hooks/useVehicles"
import type { AdDetail } from "@/api/vehicles"
import React, {useState,useEffect} from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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

function CarImage({ images, sold }: { images: string | string[]; sold: number }) {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)

  // API returns GROUP_CONCAT string or already-parsed array
  const imageList: string[] =
    typeof images === 'string'
      ? images.split(',').filter(Boolean)
      : images ?? []

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))
  }

  const src = imageList[activeImageIndex] ?? null

  return (
    <div className="relative w-full h-[130px] bg-gray-100 rounded-t-md overflow-hidden group/carousel">
      {src ? (
        <img src={src} alt="car" className="object-cover w-full h-full" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
          No Image
        </div>
      )}

      {/* Navigation Arrows - Show on hover if multiple images */}
      {imageList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute flex items-center justify-center w-6 h-6 transition-opacity -translate-y-1/2 rounded-full opacity-0 left-2 top-1/2 bg-white/80 hover:bg-white group-hover/carousel:opacity-100"
          >
            <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute flex items-center justify-center w-6 h-6 transition-opacity -translate-y-1/2 rounded-full opacity-0 right-2 top-1/2 bg-white/80 hover:bg-white group-hover/carousel:opacity-100"
          >
            <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Counter - Show if multiple images */}
      {imageList.length > 1 && (
        <span className="absolute z-10 top-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
          {activeImageIndex + 1}/{imageList.length}
        </span>
      )}

      {/* Dot Indicators - Show if multiple images */}
      {imageList.length > 1 && (
        <div className="absolute z-10 flex gap-0.5 -translate-x-1/2 bottom-1.5 left-1/2">
          {imageList.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImageIndex(i)}
              className={`w-1 h-1 rounded-full transition-colors ${
                i === activeImageIndex ? 'bg-orange-500' : 'bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}

      {sold === 1 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
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
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleCardClick = () => {
    navigate(`/seller/car/${car.name}`);
  };

  // Ensure images are always parsed into an array
  let allImages: string[] = [];

if (Array.isArray(car.images)) {
  allImages = car.images;
} else if (car.images) {
  const imageString = String(car.images);
  allImages = imageString.split(',').map((url: string) => url.trim()).filter(Boolean);
}

if (allImages.length === 0) {
  allImages = ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80"];
}

  const displayImages = allImages.slice(0, 3);
  const hasMoreImages = allImages.length > 3;

  return (
    <div className="overflow-hidden bg-white border rounded-lg border-border hover:shadow-md transition-shadow">
      <div className="relative group/carousel">
        <div className="absolute z-20 top-2 left-2 pointer-events-none">
          <CarLogo make={car.make} />
        </div>
        
        <div className="absolute z-20 flex items-center gap-1 top-2 right-2">
          <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-green-600 border border-green-200 hover:bg-green-50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Message
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/seller/car/${car.name}`);
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-white/90 text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            ✏ Edit
          </button>
        </div>

        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {displayImages.map((src, index) => (
              <CarouselItem key={index} className="relative">
                <img
                  src={src}
                  alt={`${car.make} ${car.model}`}
                  onClick={handleCardClick}
                  className="object-cover w-full h-44 cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80";
                  }}
                />
                
                {hasMoreImages && index === 2 && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick();
                    }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer bg-black/50 hover:bg-black/40 transition-colors"
                  >
                    <span className="text-white font-bold text-sm">+{allImages.length - 2} More</span>
                  </div>
                )}
                
                {car.sold === 1 && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                     <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Sold</span>
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>

          {displayImages.length > 1 && (
            <>
              <CarouselPrevious className="absolute w-7 h-7 transition-opacity opacity-0 left-2 top-1/2 -translate-y-1/2 bg-white/80 group-hover/carousel:opacity-100" />
              <CarouselNext className="absolute w-7 h-7 transition-opacity opacity-0 right-2 top-1/2 -translate-y-1/2 bg-white/80 group-hover/carousel:opacity-100" />
            </>
          )}
        </Carousel>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>👁</span>
            <span>—</span>
          </div>
          
          <div className="flex items-center gap-1">
            {displayImages.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? 'bg-[#FF5722]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] text-muted-foreground capitalize">
            {car.vehicle_status ?? '—'}
          </span>
        </div>

        <div className="text-[12px] font-bold text-foreground mb-1">
          {car.make} {car.model}
        </div>

        <div className="text-[11px] text-muted-foreground mb-2 leading-[1.4] line-clamp-2">
          {car.description ?? `${car.fuel_type} · ${car.gearbox} · ${car.body_type}`}
        </div>

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

        {car.price != null && (
          <div className="text-[15px] font-bold text-[#FF5722]">
            £{car.price.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
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