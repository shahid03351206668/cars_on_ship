import { useQuery } from "@tanstack/react-query"
import { fetchAPIAuthPost } from "../api/vehicles"

export interface OfferWithAd {
  name: string
  ad: string
  user: string
  amount: number
  creation: string
  make: string
  model: string
  year: string
  image: string | null
  chassisNo: string
  importerName: string
  eta: string
  dealStatus: string
  expiryDate?: string | null
}

// Fetch offers by status (Active, Cancelled, Expired)
export const useOffersByStatus = (status: "active" | "cancelled" | "expired") => {
  return useQuery<OfferWithAd[], Error>({
    queryKey: ["myOffers", status],
    queryFn: async () => {
      try {
        const response = await fetchAPIAuthPost("cars_on_ship.api.get_user_offers_by_status", {
          status,
        })
        return response as OfferWithAd[]
      } catch (error) {
        throw new Error(
          error instanceof Error 
            ? error.message 
            : "Failed to fetch offers"
        )
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

// Fetch all offers for current user
export const useMyOffers = () => {
  return useQuery<OfferWithAd[], Error>({
    queryKey: ["myOffers"],
    queryFn: async () => {
      try {
        const response = await fetchAPIAuthPost("cars_on_ship.api.get_user_offers", {})
        return response as OfferWithAd[]
      } catch (error) {
        throw new Error(
          error instanceof Error 
            ? error.message 
            : "Failed to fetch offers"
        )
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}