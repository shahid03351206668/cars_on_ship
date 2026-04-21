// BuyerCarDetail.tsx
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import {
  Heart,
  Share2,
  MapPin,
  Fuel,
  Gauge,
  Calendar,
  Zap,
  Users,
  AlertCircle,
  Phone,
  MessageCircle,
  Loader2,
  Globe,
  Trash2,
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import ImageGallery from '../../components/ui/ImageGallery'
import { useAdDetail, createOffer, getExistingOffer, cancelOffer } from '../../hooks/useVehicles'

interface ExistingOffer {
  name: string
  amount: number
  creation: string
}

export default function BuyerCarDetail() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [showOffer, setShowOffer] = useState(false)
  const [readyToPayAdvance, setReadyToPayAdvance] = useState(false)
  const [understandPriority, setUnderstandPriority] = useState(false)

  // Use existing hook
  const { data: car, isLoading, error } = useAdDetail(name || '')

  // Fetch existing offer
  const { data: existingOfferData, refetch: refetchOffer, isLoading: offerLoading } = useQuery({
    queryKey: ['existing-offer', name],
    queryFn: () => getExistingOffer(name || ''),
    enabled: !!name,
  })

  // Check if offer exists and has required fields
  const existingOffer = existingOfferData && existingOfferData.name ? existingOfferData : null

  // Submit offer mutation
  const submitOfferMutation = useMutation({
    mutationFn: async (price: number) => {
      return createOffer(price, name || '')
    },
    onSuccess: (data) => {
      setOfferPrice('')
      setShowOffer(false)
      setReadyToPayAdvance(false)
      setUnderstandPriority(false)
      
      toast.success(data.message)
      refetchOffer() // Refresh existing offer data
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit offer. Please try again.')
    },
  })

  // Cancel offer mutation
  const cancelOfferMutation = useMutation({
  mutationFn: async () => {
    if (!existingOffer?.name) throw new Error('Offer ID not found')
    return cancelOffer(existingOffer.name)
  },
  onSuccess: async (data) => {
    toast.success(data.message)
    // Reset form state
    setOfferPrice('')
    setShowOffer(false)
    setReadyToPayAdvance(false)
    setUnderstandPriority(false)
    // Refetch to update UI immediately
    await refetchOffer()
  },
  onError: (error: any) => {
    toast.error(error?.message || 'Failed to cancel offer. Please try again.')
  },
})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Car not found</p>
          <button
            onClick={() => navigate('/buyer')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  const carImages = car.images && car.images.length > 0 ? car.images : []
  const carTitle = `${car.year} ${car.make} ${car.model}${car.variant ? ` ${car.variant}` : ''}`
  const minimumOfferIncrement = 50000

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* MAIN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN (8/12) - All Main Content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Image Gallery */}
            <ImageGallery
              images={carImages}
              onBack={() => navigate(-1)}
              showAuctionReport={false}
              containerHeight={400}
            />

            {/* Title & Rating Section */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {carTitle}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-orange-500">4.5</span>
                  <span className="text-xl text-orange-400">★</span>
                </div>
                <span className="text-gray-600 text-sm">(234 reviews)</span>
              </div>

              <div className="text-5xl font-bold text-orange-500 mb-4">
                PKR {car.price?.toLocaleString() || 'N/A'}
              </div>

              <p className="text-gray-600">
                {car.year} • {car.mileage ? `${car.mileage.toLocaleString()} km` : 'Mileage N/A'}
              </p>
            </div>

            {/* Make an Offer & Terms and Rules Sub-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Make an Offer OR Existing Offer Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                {offerLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : existingOffer ? (
                  // EXISTING OFFER VIEW
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Your Offer</h3>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Offer Amount</p>
                      <p className="text-3xl font-bold text-orange-500">
                        PKR {existingOffer.amount?.toLocaleString() || 'N/A'}
                      </p>
                    </div>

                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Submitted On</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(existingOffer.creation)}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                      <p className="text-sm text-green-800">
                        ✓ Your offer is under review. The seller will respond shortly.
                      </p>
                    </div>

                    <button
                      onClick={() => cancelOfferMutation.mutate()}
                      disabled={cancelOfferMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-[#FC7844] hover:bg-[#E8673A] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      {cancelOfferMutation.isPending ? 'Cancelling...' : 'Cancel Offer'}
                    </button>
                  </>
                ) : (
                  // SUBMIT OFFER VIEW
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Make an Offer</h3>

                    {!showOffer ? (
                      <button
                        onClick={() => setShowOffer(true)}
                        className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        Make Offer
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Offer Price (PKR)
                          </label>
                          <input
                            type="number"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            placeholder={`e.g., ${(car.price ? car.price * 0.9 : 0).toLocaleString()}`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          />
                          {offerPrice && (
                            <p className="text-xs text-orange-600 mt-1">
                              Minimum increment: PKR {minimumOfferIncrement.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="checkbox"
                            id="advance"
                            checked={readyToPayAdvance}
                            onChange={(e) => setReadyToPayAdvance(e.target.checked)}
                            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                          />
                          <label htmlFor="advance" className="text-sm text-gray-700 cursor-pointer">
                            I am ready to pay advance
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="checkbox"
                            id="priority"
                            checked={understandPriority}
                            onChange={(e) => setUnderstandPriority(e.target.checked)}
                            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                          />
                          <label htmlFor="priority" className="text-sm text-gray-700 cursor-pointer">
                            I understand that cancelling my offer will forfeit my priority
                          </label>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowOffer(false)
                              setOfferPrice('')
                              setReadyToPayAdvance(false)
                              setUnderstandPriority(false)
                            }}
                            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              submitOfferMutation.mutate(parseFloat(offerPrice))
                            }
                            disabled={!offerPrice || submitOfferMutation.isPending}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            {submitOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Terms and Rules Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Terms and Rules</h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                      <span className="text-orange-500">●</span> Offer Priority Rules
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1 ml-6">
                      <li>✓ First offer gets priority</li>
                      <li>✓ If cancelled or failed, next buyer moves up</li>
                      <li>✓ Priority is system-managed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                      <span className="text-orange-500">●</span> Advance Payment
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1 ml-6">
                      <li>✓ 10% advance required</li>
                      <li>✓ Deducted immediately</li>
                      <li>✓ Adjusted in final price</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                      <span className="text-orange-500">●</span> Cancellation Policy
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1 ml-6">
                      <li>✓ Cancel anytime</li>
                      <li>✓ Subject to terms</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Overview Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-lg">
                
                <div className="flex flex-col items-center text-center">
                  <Gauge className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Mileage</p>
                  <p className="font-semibold text-gray-900">
                    {car.mileage ? `${(car.mileage / 1000).toFixed(1)}k km` : 'N/A'}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Calendar className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Registration</p>
                  <p className="font-semibold text-gray-900">{car.year}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Fuel className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                  <p className="font-semibold text-gray-900">{car.fuel_type}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Users className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Doors</p>
                  <p className="font-semibold text-gray-900">{car.doors || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Zap className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Drive Type</p>
                  <p className="font-semibold text-gray-900">{car.drive_type || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">🚗</span>
                  <p className="text-sm text-gray-600 mb-1">Body Type</p>
                  <p className="font-semibold text-gray-900">{car.body_type || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">⚙️</span>
                  <p className="text-sm text-gray-600 mb-1">Gearbox</p>
                  <p className="font-semibold text-gray-900">{car.gearbox || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Users className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Seats</p>
                  <p className="font-semibold text-gray-900">{car.seats || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">🎨</span>
                  <p className="text-sm text-gray-600 mb-1">Colour</p>
                  <p className="font-semibold text-gray-900">{car.colour || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">📦</span>
                  <p className="text-sm text-gray-600 mb-1">Boot Space</p>
                  <p className="font-semibold text-gray-900">{car.boot_space || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Zap className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Engine Power</p>
                  <p className="font-semibold text-gray-900">{car.engine_power || 'N/A'}</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="w-6 h-6 text-gray-700 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">CO₂ Emissions</p>
                  <p className="font-semibold text-orange-500">{car.co2_emissions || 'N/A'}</p>
                </div>

              </div>
            </div>

            {/* Specifications Section */}
            {(car.acceleration || car.fuel_consumption || car.tax_per_year || car.vin || car.lot_number) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {car.acceleration && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Acceleration (0-100)</p>
                      <p className="font-semibold text-gray-900">{car.acceleration}</p>
                    </div>
                  )}
                  
                  {car.fuel_consumption && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Fuel Consumption</p>
                      <p className="font-semibold text-gray-900">{car.fuel_consumption}</p>
                    </div>
                  )}
                  
                  {car.tax_per_year && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tax per Year</p>
                      <p className="font-semibold text-gray-900">{car.tax_per_year}</p>
                    </div>
                  )}
                  
                  {car.vin && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">VIN</p>
                      <p className="font-semibold text-gray-900 text-xs break-all">{car.vin}</p>
                    </div>
                  )}
                  
                  {car.lot_number && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Lot Number</p>
                      <p className="font-semibold text-gray-900">{car.lot_number}</p>
                    </div>
                  )}
                  
                  {car.eta && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">ETA</p>
                      <p className="font-semibold text-gray-900">{car.eta}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {car.description || 'No description available'}
              </p>
              {car.description && car.description.length > 500 && (
                <button className="text-orange-500 hover:text-orange-600 font-semibold text-sm">
                  Read More →
                </button>
              )}
            </div>

            {/* Features Section */}
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-orange-500 font-bold">✓</span>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Tips Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-3">Safety Tips</h4>
              <ul className="text-xs text-amber-900 space-y-2">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>Meet in a safe, public location</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>Inspect the vehicle thoroughly</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>Get a vehicle history report</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>Never share personal financial info</span>
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (4/12) */}
          <div className="lg:col-span-4 space-y-4">

            {/* 1. Contact Seller Card */}
            <div className="bg-gray-900 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Contact Seller</h3>

              <button className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3">
                <Phone className="w-5 h-5" />
                (023) 8234 9471
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>

              <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Message
              </button>
            </div>

            {/* 2. ETA Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ETA</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className="font-semibold text-gray-900">At Sea</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">ETA Date:</p>
                  <p className="font-semibold text-gray-900">{car.eta || '12 Jan 2026'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Days Remaining:</p>
                  <p className="font-semibold text-orange-500">10 days left</p>
                </div>

                <hr className="my-4" />

                <div>
                  <p className="text-sm text-gray-600">Port of Departure:</p>
                  <p className="font-semibold text-gray-900">{car.from_port || 'Japan Port'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Port of Arrival:</p>
                  <p className="font-semibold text-gray-900">{car.to_port || 'Karachi Pakistan'}</p>
                </div>

                <div className="pt-2 text-xs text-gray-500">
                  Last update: 2 days ago
                </div>

                <button className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                  Track this Vehicle
                </button>
              </div>
            </div>

            {/* 3. Importer Information Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Importer Information</h3>
              
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">Importer Name</p>
                <p className="font-semibold text-gray-900">{carTitle}</p>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">Location</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {car.from_port || 'Japan'}
                </p>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                <Globe className="w-4 h-4" />
                Visit seller website
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ACTION BUTTONS - Full Width Below Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isFavorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}