// ImageGallery.tsx
import { useState } from 'react'
import { ArrowLeft, Images, ChevronLeft, ChevronRight, Grid2x2 } from 'lucide-react'
import GalleryModal from '../ui/GalleryModal'

interface ImageGalleryProps {
  images: string[]
  onBack: () => void
  showAuctionReport?: boolean
  onAuctionReportClick?: () => void
  fallbackImage?: string
  containerHeight?: number
}

export default function ImageGallery({
  images,
  onBack,
  showAuctionReport = true,
  onAuctionReportClick,
  fallbackImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  containerHeight = 340
}: ImageGalleryProps) {
  const [active, setActive] = useState(0)
  const [galleryMode, setGalleryMode] = useState(false)

  const imgs = images.length > 0 ? images : [fallbackImage]

  const prev = () => setActive((a) => (a === 0 ? imgs.length - 1 : a - 1))
  const next = () => setActive((a) => (a === imgs.length - 1 ? 0 : a + 1))

  // Determine grid layout based on image count
  const getGridLayout = () => {
    if (imgs.length === 1) return 'single'
    if (imgs.length === 2) return 'two'
    if (imgs.length === 3) return 'three'
    if (imgs.length === 4) return 'four'
    return 'five-plus'
  }

  const layout = getGridLayout()

  return (
    <>
      {galleryMode && (
        <GalleryModal
          imgs={imgs}
          active={active}
          onClose={() => setGalleryMode(false)}
          onSelect={setActive}
          onPrev={prev}
          onNext={next}
        />
      )}

      <div className="w-full bg-[rgb(244 244 244)]">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to result
            </button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {showAuctionReport && (
                <button
                  onClick={onAuctionReportClick}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                >
                  Auction Report
                </button>
              )}
              <button
                onClick={() => setGalleryMode(true)}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap"
              >
                <Images className="w-3.5 h-3.5" />
                Gallery
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-lg"
            style={{ height: `${containerHeight}px` }}
          >
            {layout === 'single' && (
              <div className="w-full h-full bg-[#111] flex items-center justify-center">
                <img
                  src={imgs[0]}
                  alt=""
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            )}

            {layout === 'two' && (
              <div className="flex h-full gap-1">
                <div className="flex-1 overflow-hidden rounded-l-lg">
                  <img
                    src={imgs[0]}
                    alt=""
                    className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => {
                      setActive(0)
                      setGalleryMode(true)
                    }}
                  />
                </div>
                <div className="flex-1 overflow-hidden rounded-r-lg">
                  <img
                    src={imgs[1]}
                    alt=""
                    className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => {
                      setActive(1)
                      setGalleryMode(true)
                    }}
                  />
                </div>
              </div>
            )}

            {layout === 'three' && (
              <div className="flex h-full gap-1">
                <div className="flex-1 overflow-hidden rounded-l-lg">
                  <img
                    src={imgs[0]}
                    alt=""
                    className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => {
                      setActive(0)
                      setGalleryMode(true)
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex-1 overflow-hidden rounded-tr-lg">
                    <img
                      src={imgs[1]}
                      alt=""
                      className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                      onClick={() => {
                        setActive(1)
                        setGalleryMode(true)
                      }}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden rounded-br-lg">
                    <img
                      src={imgs[2]}
                      alt=""
                      className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                      onClick={() => {
                        setActive(2)
                        setGalleryMode(true)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {layout === 'four' && (
              <div className="flex h-full gap-1">
                <div className="flex-1 overflow-hidden rounded-l-lg">
                  <img
                    src={imgs[0]}
                    alt=""
                    className="object-cover w-full h-full cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => {
                      setActive(0)
                      setGalleryMode(true)
                    }}
                  />
                </div>
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`overflow-hidden cursor-pointer ${
                        idx === 1 ? 'rounded-tr-lg' : idx === 3 ? 'rounded-br-lg' : ''
                      }`}
                    >
                      <img
                        src={imgs[idx]}
                        alt=""
                        className="object-cover w-full h-full hover:brightness-90 transition-all"
                        onClick={() => {
                          setActive(idx)
                          setGalleryMode(true)
                        }}
                      />
                    </div>
                  ))}
                  <div className="bg-[#111]" />
                </div>
              </div>
            )}

            {layout === 'five-plus' && (
              <div className="flex h-full gap-1">
                <div
                  className="relative overflow-hidden rounded-l-lg cursor-pointer"
                  style={{ flex: "0 0 55%" }}
                >
                  <img
                    src={imgs[active]}
                    alt=""
                    className="object-cover w-full h-full hover:brightness-90 transition-all"
                    onClick={() => setGalleryMode(true)}
                  />
                </div>

                <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
                  {[1, 2, 3, 4].map((offset) => {
                    const img = imgs[offset]
                    const isOverlay = offset === 4 && imgs.length > 5
                    return (
                      <div
                        key={offset}
                        className={`relative overflow-hidden cursor-pointer ${
                          offset === 2
                            ? 'rounded-tr-lg'
                            : offset === 4
                            ? 'rounded-br-lg'
                            : ''
                        }`}
                      >
                        {img ? (
                          <>
                            <img
                              src={img}
                              alt=""
                              className="object-cover w-full h-full transition-all hover:brightness-90"
                              onClick={() => {
                                setActive(offset)
                                setGalleryMode(true)
                              }}
                            />
                            {isOverlay && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer">
                                <span className="flex items-center gap-1 text-xs font-semibold text-white">
                                  <Grid2x2 className="w-3.5 h-3.5" /> +
                                  {imgs.length - 4}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-[#111]" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors -translate-y-1/2 rounded-full left-2 top-1/2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors -translate-y-1/2 rounded-full right-2 top-1/2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )} */}
          </div>

          <div className="h-4" />
        </div>
      </div>
    </>
  )
}