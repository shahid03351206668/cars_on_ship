// ─── Base fetcher ─────────────────────────────────────────────
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";
export const fetchAPI = async (
  method: string,
  params?: Record<string, string>
) => {
  const url = new URL(`/api/method/${method}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, val)
    );
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.message;
};

// ─── Core APIs ────────────────────────────────────────────────
export const getMakes = () =>
  fetchAPI("cars_on_ship.api.get_makes");

export const getModels = (make?: string) =>
  fetchAPI("cars_on_ship.api.get_models", make ? { make } : undefined);

export const getYears = () =>
  fetchAPI("cars_on_ship.api.get_years");

export const getAds = (filters?: Partial<AdvancedFilters>) => {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.make)          params.make = filters.make;
    if (filters.model)         params.model = filters.model;
    if (filters.yearFrom)      params.year_from = filters.yearFrom;
    if (filters.yearTo)        params.year_to = filters.yearTo;
    if (filters.priceFrom)     params.price_from = filters.priceFrom;
    if (filters.priceTo)       params.price_to = filters.priceTo;
    if (filters.mileageFrom)   params.mileage_from = filters.mileageFrom;
    if (filters.mileageTo)     params.mileage_to = filters.mileageTo;
    if (filters.eta)           params.eta = filters.eta;
    if (filters.engineSizeFrom) params.engine_size_from = filters.engineSizeFrom;
    if (filters.engineSizeTo)  params.engine_size_to = filters.engineSizeTo;

    // Arrays → comma-separated strings
    if (filters.vehicleStatuses?.length)  params.vehicle_statuses = filters.vehicleStatuses.join(",");
    if (filters.gearboxes?.length)        params.gearboxes = filters.gearboxes.join(",");
    if (filters.bodyTypes?.length)        params.body_types = filters.bodyTypes.join(",");
    if (filters.colours?.length)          params.colours = filters.colours.join(",");
    if (filters.doors?.length)            params.doors = filters.doors.join(",");
    if (filters.seats?.length)            params.seats = filters.seats.join(",");
    if (filters.fuelTypes?.length)        params.fuel_types = filters.fuelTypes.join(",");
    if (filters.accelerations?.length)    params.accelerations = filters.accelerations.join(",");
    if (filters.driveTypes?.length)       params.drive_types = filters.driveTypes.join(",");
    if (filters.bootSpaces?.length)       params.boot_spaces = filters.bootSpaces.join(",");
    if (filters.sellerTypes?.length)      params.seller_types = filters.sellerTypes.join(",");
  }

  return fetchAPI("cars_on_ship.api.get_ad", Object.keys(params).length ? params : undefined);
};

// ─── Advanced Filter APIs ─────────────────────────────────────
export const getVehicleStatuses = () =>
  fetchAPI("cars_on_ship.api.get_vehicle_statuses");

export const getGearboxes = () =>
  fetchAPI("cars_on_ship.api.get_gearboxes");

export const getBodyTypes = () =>
  fetchAPI("cars_on_ship.api.get_body_types");

export const getColours = () =>
  fetchAPI("cars_on_ship.api.get_colours");

export const getDoorOptions = () =>
  fetchAPI("cars_on_ship.api.get_door_options");

export const getSeatOptions = () =>
  fetchAPI("cars_on_ship.api.get_seat_options");

export const getFuelTypes = () =>
  fetchAPI("cars_on_ship.api.get_fuel_types");

export const getAccelerationRanges = () =>
  fetchAPI("cars_on_ship.api.get_acceleration_ranges");

export const getDriveTypes = () =>
  fetchAPI("cars_on_ship.api.get_drive_types");

export const getBootSpaces = () =>
  fetchAPI("cars_on_ship.api.get_boot_spaces");

export const getSellerTypes = () =>
  fetchAPI("cars_on_ship.api.get_seller_types");


export const getAdDetail = (name: string) =>
  fetchAPI("cars_on_ship.api.get_ad_detail", { name });

// ─── Types ────────────────────────────────────────────────────
export interface Option {
  name: string;
}

export interface Make extends Option {}

export interface Model {
  name: string;
  make: string;
}

export interface Year {
  name: string;
  year: number; // ✅ fixed
}

export interface Ad {
  name: string;
  make: string;
  model: string;
  colour: string;
  body_type: string;
  vehicle_status: string;
  year: number;
  images: string[];
}
// ── Add this to your existing api/vehicles.ts ─────────────────

export interface AdDetail {
  name: string
  user: string
  seller_type: string
  boot_space: string
  make: string
  model: string
  colour: string
  colour_code: string
  body_type: string
  vehicle_status: string
  year: string           // string, not number
  acceleration: string
  fuel_type: string
  seats: string
  doors: string
  gearbox: string
  description: string
  price: number
  mileage: number
  drive_type: string
  images: string[]
}

// Reuse Option for all filters
export type VehicleStatus = Option;
export type Gearbox = Option;
export type BodyType = Option;
export type Colour = Option;
export type DoorOption = Option;
export type SeatOption = Option;
export type FuelType = Option;
export type AccelerationRange = Option;
export type DriveType = Option;
export type BootSpace = Option;
export type SellerType = Option;