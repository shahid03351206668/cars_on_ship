// ─── Base fetcher ─────────────────────────────────────────────
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";
import { getStoredSid } from "./auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// ─── Base URL ─────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ─── Ad Types ─────────────────────────────────────────────────
export interface FavoriteAdResponse {
  name: string;
  ad: string;
  user: string;
  enable: boolean;
}


export interface Ad {
  name: string;
  user: string;
  seller_type: string;
  boot_space: string;
  make: string;
  model: string;
  variant?: string;
  colour: string;
  colour_code?: string
  body_type: string;
  vehicle_status: string;
  year: string;
  fuel_type: string;
  seats: string;
  doors: string;
  gearbox: string;
  description?: string;
  from_port?: string;
  to_port?: string;
  sold?: number;
  images?: string[] 
  acceleration?: string 
  price?: number
  mileage?: number
  drive_type: string;
  engine_power?: string;
  fuel_consumption?: string;
  co2_emissions?: string;
  tax_per_year?: string;
  eta?: string;
  lot_number?: string;
  vin?: string;
}
 
export interface AdDetail extends Ad {
  
  features: string[];
  attachments?: Array<{ image: string }>;
}

export interface Feature {
  name: string;
}
export interface EnginePower {
  name: string;
}


// ─── Generic Option Type ──────────────────────────────────────
export interface Option {
  name: string;
}

// ─── Specific Types for Filters ───────────────────────────────
export type Make = Option;

export interface Model {
  name: string;
  make: string;
}

export interface Variant {
  name: string;
  model: string;
}

export interface Year {
  name: string;
  year: number;
}

export type Port = Option;
export type VehicleStatus = Option;
export type Gearbox = Option;
export type BodyType = Option;

export interface Colour extends Option {
  color_code?: string;
}

export type DoorOption = Option;
export type SeatOption = Option;
export type FuelType = Option;
export type AccelerationRange = Option;
export type DriveType = Option;
export type BootSpace = Option;
export type SellerType = Option;

// ─── Response Types ───────────────────────────────────────────
interface ApiResponse<T> {
  message: T;
}

// ─── CSRF Token ───────────────────────────────────────────────
export const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "fetch";
};

// ─── Public Fetcher (no auth needed) ──────────────────────────
const fetchAPI = async <T extends object>(
  method: string,
  params?: Record<string, string>
): Promise<T> => {
  const url = new URL(`/api/method/${method}`, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, val)
    );
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data: ApiResponse<T> = await res.json();
  return data.message;
};

// ─── Authenticated Fetcher (includes sid header) ───────────────
export const fetchAPIAuth = async <T extends object>(
  method: string,
  params?: Record<string, string>
): Promise<T> => {
  const sid = getStoredSid();
  const url = new URL(`/api/method/${method}`, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, val)
    );
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data: ApiResponse<T> = await res.json();
  return data.message;
};


export const fetchAPIAuthPost = async <T extends object>(
  method: string,
  params?: Record<string, string>
): Promise<T> => {
  const sid = getStoredSid();
  const url = new URL(`/api/method/${method}`, BASE_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
      "Content-Type": "application/json",
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error("API Error");

  const data: ApiResponse<T> = await res.json();
  return data.message;
};

export const getAds = async (
  filters?: Partial<AdvancedFilters>
): Promise<Ad[]> => {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.make) params.make = filters.make;
    if (filters.model) params.model = filters.model;
    if (filters.variant) params.variant = filters.variant;
    if (filters.yearFrom) params.year_from = filters.yearFrom;
    if (filters.yearTo) params.year_to = filters.yearTo;
    if (filters.priceFrom) params.price_from = filters.priceFrom;
    if (filters.priceTo) params.price_to = filters.priceTo;
    if (filters.mileageFrom) params.mileage_from = filters.mileageFrom;
    if (filters.mileageTo) params.mileage_to = filters.mileageTo;
    if (filters.eta) params.eta = filters.eta;
    if (filters.engineSizeFrom)
      params.engine_size_from = filters.engineSizeFrom;
    if (filters.engineSizeTo) params.engine_size_to = filters.engineSizeTo;
    if (filters.fromPort) params.from_port = filters.fromPort;
    if (filters.toPort) params.to_port = filters.toPort;
    if (filters.fromPostingDate) params.from_posting_date = filters.fromPostingDate;
    if (filters.toPostingDate) params.to_posting_date = filters.toPostingDate;

    // Arrays → comma-separated strings
    if (filters.vehicleStatuses?.length)
      params.vehicle_statuses = filters.vehicleStatuses.join(",");
    if (filters.gearboxes?.length)
      params.gearboxes = filters.gearboxes.join(",");
    if (filters.bodyTypes?.length)
      params.body_types = filters.bodyTypes.join(",");
    if (filters.colours?.length) params.colours = filters.colours.join(",");
    if (filters.doors?.length) params.doors = filters.doors.join(",");
    if (filters.seats?.length) params.seats = filters.seats.join(",");
    if (filters.fuelTypes?.length)
      params.fuel_types = filters.fuelTypes.join(",");
    if (filters.accelerations?.length)
      params.accelerations = filters.accelerations.join(",");
    if (filters.driveTypes?.length)
      params.drive_types = filters.driveTypes.join(",");
    if (filters.bootSpaces?.length)
      params.boot_spaces = filters.bootSpaces.join(",");
    if (filters.sellerTypes?.length)
      params.seller_types = filters.sellerTypes.join(",");
  }

  return fetchAPI<Ad[]>(
    "cars_on_ship.api.get_ad",
    Object.keys(params).length ? params : undefined
  );
};

/**
 * Fetch a specific ad by name
 * @param name - Ad identifier
 */
export const getAdDetail = (name: string): Promise<AdDetail> =>
  fetchAPI<AdDetail>("cars_on_ship.api.get_ad_detail", { name });


// Fetch user-specific ads (requires authentication)

export const getUserwiseAd = (): Promise<AdDetail[]> =>
  fetchAPIAuth<AdDetail[]>("cars_on_ship.api.get_userwise_ad");



export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adName, currentState }: { adName: string; currentState: boolean }) => {
      // We pass the ad name and the NEW state (toggle the current one)
      return await fetchAPIAuth("your_app.api.toggle_favorite", {
        ad: adName,
        enable: (!currentState).toString(), // Frappe expects strings usually
      });
    },
    onSuccess: () => {
      // Refetch any "favorites" list you might have in the UI
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error) => {
      console.error("Failed to update favorite:", error);
    }
  });
};


export const fetchFavoriteAds = async (): Promise<FavoriteAdResponse[]> => {
  const sid = getStoredSid();
  const url = new URL("/api/method/cars_on_ship.api.get_favorite_ads", BASE_URL);
 
  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
  });
 
  if (!res.ok) throw new Error("Failed to fetch favorites");
 
  const data: ApiResponse<FavoriteAdResponse[]> = await res.json();
  return data.message || [];
};
 

