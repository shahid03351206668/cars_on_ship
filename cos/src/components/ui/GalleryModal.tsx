import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface GalleryModalProps {
  imgs: string[]
  active: number
  onClose: () => void
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

export default function GalleryModal({
  imgs,
  active,
  onClose,
  onSelect,
  onPrev,
  onNext
}: GalleryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] bg-black rounded-lg overflow-hidden">
        {/* Main Image */}
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={imgs[active]}
            alt=""
            className="object-contain max-w-full max-h-full"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute z-50 p-2 text-white transition-colors rounded-full top-4 right-4 bg-white/10 hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={onPrev}
          className="absolute z-40 p-2 text-white transition-colors -translate-y-1/2 rounded-full left-4 top-1/2 bg-white/10 hover:bg-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onNext}
          className="absolute z-40 p-2 text-white transition-colors -translate-y-1/2 rounded-full right-4 top-1/2 bg-white/10 hover:bg-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Thumbnails */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 overflow-x-auto bg-gradient-to-t from-black/60">
          {imgs.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`flex-shrink-0 h-16 w-16 rounded overflow-hidden border-2 transition-colors ${
                idx === active
                  ? 'border-white'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img src={img} alt="" className="object-cover w-full h-full" />
            </button>
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 bg-white/10 px-3 py-1.5 rounded-full text-white text-sm font-medium backdrop-blur-sm">
          {active + 1} / {imgs.length}
        </div>
      </div>
    </div>
  )
}