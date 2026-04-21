import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import DataTable, { type ColumnDef } from "../../components/ui/Datatable"
import { useOffersByStatus } from "../../api/useoffer"
import type { OfferWithAd } from "../../api/useoffer"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelOffer } from "../../hooks/useVehicles"
import toast from "react-hot-toast"
import { getOrCreateChatRoom } from "../../api/useChat"

type TabType = "active" | "cancelled" | "expired"

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatPrice = (price: number): string => {
  return `£${price.toLocaleString()}`
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Active
        </span>
      )
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          Cancelled
        </span>
      )
    case "expired":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          Expired
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          Unknown
        </span>
      )
  }
}

export default function BuyerMyOffers() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>("active")
  const [openingChat, setOpeningChat] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: offers = [], isLoading, error } = useOffersByStatus(activeTab)

  const formattedOffers = useMemo(() => {
    return offers.map((offer) => ({
      ...offer,
      id: offer.name,
    })) as (OfferWithAd & { id: string })[]
  }, [offers])

  const { mutate: cancelOfferMutation, isPending: isCancelling } = useMutation({
    mutationFn: cancelOffer,
    onSuccess: () => {
      toast.success("Offer cancelled successfully")
      queryClient.invalidateQueries({ queryKey: ["myOffers"] })
      queryClient.invalidateQueries({ queryKey: ["myOffers", activeTab] })
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel offer")
    },
  })

  const handleCancelOffer = (offer: OfferWithAd & { id: string }) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this offer? This action cannot be undone."
      )
    ) {
      cancelOfferMutation(offer.id)
    }
  }

  // Navigate to messages page, creating/finding the chat room first
  const handleMessageSeller = async (offer: OfferWithAd & { id: string }) => {
    setOpeningChat(offer.id)
    try {
      // getOrCreateChatRoom returns the room_id (deterministic hash of ad + buyer)
      const roomId = await getOrCreateChatRoom(offer.ad, offer.importerName)
      navigate(
        `/buyer/messages?room=${roomId}&ad=${offer.ad}&seller=${encodeURIComponent(offer.importerName)}`
      )
    } catch (err: any) {
      toast.error(err?.message || "Could not open chat")
    } finally {
      setOpeningChat(null)
    }
  }

  const OFFER_COLUMNS: ColumnDef<OfferWithAd & { id: string }>[] = [
    {
      key: "image",
      label: "Photo",
      render: (row: OfferWithAd & { id: string }) => (
        <div className="flex items-center justify-center w-20 overflow-hidden rounded-lg h-14 bg-gray-200 border border-gray-100">
          {row.image ? (
            <img
              src={row.image}
              alt={`${row.make} ${row.model}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  "https://placehold.co/80x56?text=No+Img"
              }}
            />
          ) : (
            <div className="text-gray-400 text-2xl">🚗</div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Vehicle Details",
      render: (row: OfferWithAd & { id: string }) => (
        <div>
          <p className="text-xs font-bold text-gray-900">
            {row.make} {row.model}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-tight">
            {row.year} • Chassis: {row.chassisNo}
          </p>
        </div>
      ),
    },
    {
      key: "importerName",
      label: "Importer",
      render: (row: OfferWithAd & { id: string }) => (
        <span className="text-xs text-gray-600">{row.importerName}</span>
      ),
    },
    {
      key: "eta",
      label: "ETA",
      render: (row: OfferWithAd & { id: string }) => (
        <span className="text-xs text-gray-600">{row.eta}</span>
      ),
    },
    {
      key: "amount",
      label: "Your Offer",
      render: (row: OfferWithAd & { id: string }) => (
        <span className="text-xs font-bold text-[#FC7844]">
          {formatPrice(row.amount)}
        </span>
      ),
    },
    {
      key: "dealStatus",
      label: "Deal Status",
      render: (row: OfferWithAd & { id: string }) =>
        getStatusBadge(row.dealStatus),
    },
    {
      key: "expiryDate",
      label: "Deal Ends",
      render: (row: OfferWithAd & { id: string }) => (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.expiryDate ? formatDate(row.expiryDate) : "N/A"}</span>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your vehicle offers and deals
            </p>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                Current Status:
              </span>
              {[
                { label: "Active Deals", value: "active" as const },
                { label: "Cancelled", value: "cancelled" as const },
                { label: "Expired", value: "expired" as const },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.value
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 shrink-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            {isLoading ? (
              <span className="text-gray-400 animate-pulse text-xs">
                Loading offers...
              </span>
            ) : (
              <>
                <span className="text-[#FC7844] font-bold">
                  {formattedOffers.length}
                </span>
                {formattedOffers.length === 1 ? "Offer" : "Offers"} Found
              </>
            )}
          </p>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 border-4 border-[#FC7844] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading your offers...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-sm font-medium text-red-600">
                  Error loading offers
                </p>
                <p className="text-xs text-gray-400">{error.message}</p>
              </div>
            ) : formattedOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-4xl">📋</div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    No {activeTab} offers yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Browse cars and make an offer to get started
                  </p>
                </div>
                <button
                  onClick={() => navigate("/buyer/home")}
                  className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Browse Cars
                </button>
              </div>
            ) : (
              <DataTable
                columns={OFFER_COLUMNS}
                data={formattedOffers}
                defaultPageSize={10}
                onRowClick={(offer) => navigate(`/buyer/car/${offer.ad}`)}
                actions={{
                  key: "actions",
                  label: "Actions",
                  actions: [
                    {
                      label: isCancelling ? "Cancelling..." : "Cancel",
                      onClick: (offer) => handleCancelOffer(offer),
                      variant: "danger",
                    },
                    {
                      label: openingChat !== null ? "Opening..." : "Message",
                      onClick: (offer) => handleMessageSeller(offer),
                      variant: "success",
                    },
                  ],
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}