import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  getAds,
  getMakes,
  getModels,
  getVariants,
  getYears,
  getVehicleStatuses,
  getGearboxes,
  getBodyTypes,
  getColours,
  getDoorOptions,
  getSeatOptions,
  getFuelTypes,
  getAccelerationRanges,
  getDriveTypes,
  getBootSpaces,
  getSellerTypes,
  getAdDetail,
  getPorts,
  // Types
  type Ad,
  type AdDetail,
  type Make,
  type Model,
  type Year,
  type VehicleStatus,
  type Gearbox,
  type BodyType,
  type Colour,
  type DoorOption,
  type SeatOption,
  type FuelType,
  type AccelerationRange,
  type DriveType,
  type BootSpace,
  type SellerType,
  type Variant,
  type Port,
} from "@/api/vehicles";
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";
import { getUserwiseAd } from "@/api/vehicles";

// ─── Core Hooks ───────────────────────────────────────────────

/**
 * Hook to fetch all available car makes
 */
export const useMakes = (): UseQueryResult<Make[], Error> =>
  useQuery({
    queryKey: ["makes"],
    queryFn: getMakes,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

/**
 * Hook to fetch models for a specific make
 * @param make - Make name to filter models (enables query when provided)
 */
export const useModels = (make?: string): UseQueryResult<Model[], Error> =>
  useQuery({
    queryKey: ["models", make],
    queryFn: () => getModels(make),
    enabled: !!make, // Only fetch when make is provided
    staleTime: 1000 * 60 * 60,
  });

export const useVariants = (model?: string): UseQueryResult<Variant[], Error> =>
  useQuery({
    queryKey: ["variants", model],
    queryFn: () => getVariants(model),
    enabled: !!model, // Only fetch when model is provided
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all available years
 */
export const useYears = (): UseQueryResult<Year[], Error> =>
  useQuery({
    queryKey: ["years"],
    queryFn: getYears,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all available ports
 */
export const usePorts = (): UseQueryResult<Port[], Error> =>
  useQuery({
    queryKey: ["ports"],
    queryFn: getPorts,
    staleTime: 1000 * 60 * 60,
  });

// ─── Ads ──────────────────────────────────────────────────────

/**
 * Hook to fetch ads with optional filters
 * Re-fetches whenever filters change
 * @param filters - Optional advanced filter criteria
 */
export const useAds = (
  filters?: Partial<AdvancedFilters>
): UseQueryResult<Ad[], Error> =>
  useQuery({
    queryKey: ["ads", filters],
    queryFn: () => getAds(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/**
 * Hook to fetch a specific ad by name
 * @param name - Ad identifier
 */
export const useAdDetail = (
  name: string
): UseQueryResult<AdDetail, Error> =>
  useQuery({
    queryKey: ["ad", name],
    queryFn: () => getAdDetail(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

// ─── Advanced Filter Hooks ────────────────────────────────────

/**
 * Hook to fetch all vehicle statuses
 */
export const useVehicleStatuses = (): UseQueryResult<
  VehicleStatus[],
  Error
> =>
  useQuery({
    queryKey: ["vehicle-statuses"],
    queryFn: getVehicleStatuses,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all gearbox options
 */
export const useGearboxes = (): UseQueryResult<Gearbox[], Error> =>
  useQuery({
    queryKey: ["gearboxes"],
    queryFn: getGearboxes,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all body types
 */
export const useBodyTypes = (): UseQueryResult<BodyType[], Error> =>
  useQuery({
    queryKey: ["body-types"],
    queryFn: getBodyTypes,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all colors
 */
export const useColours = (): UseQueryResult<Colour[], Error> =>
  useQuery({
    queryKey: ["colours"],
    queryFn: getColours,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all door count options
 */
export const useDoorOptions = (): UseQueryResult<DoorOption[], Error> =>
  useQuery({
    queryKey: ["doors"],
    queryFn: getDoorOptions,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all seating capacity options
 */
export const useSeatOptions = (): UseQueryResult<SeatOption[], Error> =>
  useQuery({
    queryKey: ["seats"],
    queryFn: getSeatOptions,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all fuel types
 */
export const useFuelTypes = (): UseQueryResult<FuelType[], Error> =>
  useQuery({
    queryKey: ["fuel-types"],
    queryFn: getFuelTypes,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all acceleration ranges
 */
export const useAccelerationRanges = (): UseQueryResult<
  AccelerationRange[],
  Error
> =>
  useQuery({
    queryKey: ["acceleration"],
    queryFn: getAccelerationRanges,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all drivetrain options
 */
export const useDriveTypes = (): UseQueryResult<DriveType[], Error> =>
  useQuery({
    queryKey: ["drive-types"],
    queryFn: getDriveTypes,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all boot space options
 */
export const useBootSpaces = (): UseQueryResult<BootSpace[], Error> =>
  useQuery({
    queryKey: ["boot-spaces"],
    queryFn: getBootSpaces,
    staleTime: 1000 * 60 * 60,
  });

/**
 * Hook to fetch all seller types
 */
export const useSellerTypes = (): UseQueryResult<SellerType[], Error> =>
  useQuery({
    queryKey: ["seller-types"],
    queryFn: getSellerTypes,
    staleTime: 1000 * 60 * 60,
  });


export const useUserwiseAds = (): UseQueryResult<AdDetail[], Error> =>
  useQuery({
    queryKey: ["userwise-ads"],
    queryFn: getUserwiseAd,
    staleTime: 1000 * 60 * 5,
  });

// ─── Combined Filter Hook ─────────────────────────────────────

/**
 * Combined hook for all vehicle filter options
 * Provides easy access to all filter data in one place
 */
export interface UseVehicleFiltersResult {
  makes: UseQueryResult<Make[], Error>;
  models: UseQueryResult<Model[], Error>;
  variants: UseQueryResult<Variant[], Error>;
  years: UseQueryResult<Year[], Error>;
  ports: UseQueryResult<Port[], Error>;
  statuses: UseQueryResult<VehicleStatus[], Error>;
  gearboxes: UseQueryResult<Gearbox[], Error>;
  bodyTypes: UseQueryResult<BodyType[], Error>;
  colours: UseQueryResult<Colour[], Error>;
  doors: UseQueryResult<DoorOption[], Error>;
  seats: UseQueryResult<SeatOption[], Error>;
  fuelTypes: UseQueryResult<FuelType[], Error>;
  acceleration: UseQueryResult<AccelerationRange[], Error>;
  driveTypes: UseQueryResult<DriveType[], Error>;
  bootSpaces: UseQueryResult<BootSpace[], Error>;
  sellerTypes: UseQueryResult<SellerType[], Error>;
}

export const useVehicleFilters = (make?: string, model?: string): UseVehicleFiltersResult => {
  return {
    makes: useMakes(),
    models: useModels(make),
    variants: useVariants(model),
    years: useYears(),
    ports: usePorts(),
    statuses: useVehicleStatuses(),
    gearboxes: useGearboxes(),
    bodyTypes: useBodyTypes(),
    colours: useColours(),
    doors: useDoorOptions(),
    seats: useSeatOptions(),
    fuelTypes: useFuelTypes(),
    acceleration: useAccelerationRanges(),
    driveTypes: useDriveTypes(),
    bootSpaces: useBootSpaces(),
    sellerTypes: useSellerTypes(),
  };
};