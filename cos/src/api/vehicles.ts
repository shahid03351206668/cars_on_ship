// ─── Base fetcher ─────────────────────────────────────────────
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";
import { getStoredSid } from "./auth";

// ─── Base URL ─────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ─── Ad Types ─────────────────────────────────────────────────
export interface Ad {
  name: string;
  user: string;
  seller_type: string;
  boot_space: string;
  make: string;
  model: string;
  colour: string;
  colour_code?: string;
  body_type: string;
  vehicle_status: string;
  year: number;
  acceleration?: string;
  fuel_type: string;
  seats: string;
  doors: string;
  gearbox: string;
  description?: string;
  images: string[];
  from_port?: string;
  to_port?: string;
}

export interface AdDetail extends Ad {
  price: number;
  mileage: number;
  drive_type: string;
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
const getCsrfToken = (): string => {
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
const fetchAPIAuth = async <T extends object>(
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

// ─── Core APIs ────────────────────────────────────────────────

export const getMakes = (): Promise<Make[]> =>
  fetchAPI<Make[]>("cars_on_ship.api.get_makes");

export const getModels = (make?: string): Promise<Model[]> =>
  fetchAPI<Model[]>("cars_on_ship.api.get_models", make ? { make } : undefined);

export const getVariants = (model?: string): Promise<Variant[]> =>
  fetchAPI<Variant[]>("cars_on_ship.api.get_variants", model ? { model } : undefined);

export const getYears = (): Promise<Year[]> =>
  fetchAPI<Year[]>("cars_on_ship.api.get_years");

/**
 * Fetch all available ports
 */
export const getPorts = (): Promise<Port[]> =>
  fetchAPI<Port[]>("cars_on_ship.api.get_ports");

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

// ─── Advanced Filter APIs ─────────────────────────────────────

/**
 * Fetch all vehicle statuses (e.g., 'At Sea', 'Landed')
 */
export const getVehicleStatuses = (): Promise<VehicleStatus[]> =>
  fetchAPI<VehicleStatus[]>("cars_on_ship.api.get_vehicle_statuses");

/**
 * Fetch all transmission types
 */
export const getGearboxes = (): Promise<Gearbox[]> =>
  fetchAPI<Gearbox[]>("cars_on_ship.api.get_gearboxes");

/**
 * Fetch all body types (SUV, Sedan, Hatchback, etc.)
 */
export const getBodyTypes = (): Promise<BodyType[]> =>
  fetchAPI<BodyType[]>("cars_on_ship.api.get_body_types");

/**
 * Fetch all available car colors
 */
export const getColours = (): Promise<Colour[]> =>
  fetchAPI<Colour[]>("cars_on_ship.api.get_colours");

/**
 * Fetch door count options
 */
export const getDoorOptions = (): Promise<DoorOption[]> =>
  fetchAPI<DoorOption[]>("cars_on_ship.api.get_door_options");

/**
 * Fetch seating capacity options
 */
export const getSeatOptions = (): Promise<SeatOption[]> =>
  fetchAPI<SeatOption[]>("cars_on_ship.api.get_seat_options");

/**
 * Fetch fuel type categories (Petrol, Diesel, Hybrid, Electric)
 */
export const getFuelTypes = (): Promise<FuelType[]> =>
  fetchAPI<FuelType[]>("cars_on_ship.api.get_fuel_types");

/**
 * Fetch acceleration brackets (e.g., 0-62mph times)
 */
export const getAccelerationRanges = (): Promise<AccelerationRange[]> =>
  fetchAPI<AccelerationRange[]>("cars_on_ship.api.get_acceleration_ranges");

/**
 * Fetch drivetrain options (AWD, FWD, RWD)
 */
export const getDriveTypes = (): Promise<DriveType[]> =>
  fetchAPI<DriveType[]>("cars_on_ship.api.get_drive_types");

/**
 * Fetch trunk/boot capacity categories
 */
export const getBootSpaces = (): Promise<BootSpace[]> =>
  fetchAPI<BootSpace[]>("cars_on_ship.api.get_boot_spaces");

/**
 * Fetch seller categories (Private, Dealer, etc.)
 */
export const getSellerTypes = (): Promise<SellerType[]> =>
  fetchAPI<SellerType[]>("cars_on_ship.api.get_seller_types");

/**
 * Fetch user-specific ads (requires authentication)
 */
export const getUserwiseAd = (): Promise<AdDetail[]> =>
  fetchAPIAuth<AdDetail[]>("cars_on_ship.api.get_userwise_ad");