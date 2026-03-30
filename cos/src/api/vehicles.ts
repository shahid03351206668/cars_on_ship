// ─── Base fetcher ─────────────────────────────────────────────
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";

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

export interface Year {
  name: string;
  year: number;
}

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

// ─── Base fetcher ─────────────────────────────────────────────
export const fetchAPI = async <T extends object>(
  method: string,
  params?: Record<string, string>
): Promise<T> => {
  const url = new URL(`/api/method/${method}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, val)
    );
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("API Error");

  const data: ApiResponse<T> = await res.json();
  return data.message;
};

// ─── Core APIs ────────────────────────────────────────────────

/**
 * Fetch all available car makes
 */
export const getMakes = (): Promise<Make[]> =>
  fetchAPI<Make[]>("cars_on_ship.api.get_makes");

/**
 * Fetch models, optionally filtered by make
 * @param make - Optional make name to filter models
 */
export const getModels = (make?: string): Promise<Model[]> =>
  fetchAPI<Model[]>("cars_on_ship.api.get_models", make ? { make } : undefined);

/**
 * Fetch all available years
 */
export const getYears = (): Promise<Year[]> =>
  fetchAPI<Year[]>("cars_on_ship.api.get_years");

/**
 * Fetch ads with optional advanced filters
 * @param filters - Advanced filter criteria
 */
export const getAds = async (
  filters?: Partial<AdvancedFilters>
): Promise<Ad[]> => {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.make) params.make = filters.make;
    if (filters.model) params.model = filters.model;
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