import { useQuery } from "@tanstack/react-query";
import {
  getAds,
  getMakes,
  getModels,
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
} from "@/api/vehicles";
import type { AdvancedFilters } from "@/components/AdvancedSearchPanel";
// ─── Core Hooks ───────────────────────────────────────────────
export const useMakes = () =>
  useQuery({
    queryKey: ["makes"],
    queryFn: getMakes,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useModels = (make?: string) =>
  useQuery({
    queryKey: ["models", make],
    queryFn: () => getModels(make),
    enabled: !!make, // ✅ important
    staleTime: 1000 * 60 * 60,
  });

export const useYears = () =>
  useQuery({
    queryKey: ["years"],
    queryFn: getYears,
    staleTime: 1000 * 60 * 60,
  });

// ─── Ads ──────────────────────────────────────────────────────
export const useAds = (filters?: Partial<AdvancedFilters>) =>
  useQuery({
    queryKey: ["ads", filters],   // re-fetches whenever filters change
    queryFn: () => getAds(filters),
    staleTime: 1000 * 60 * 5,
  });

// ─── Advanced Filter Hooks ────────────────────────────────────
export const useVehicleStatuses = () =>
  useQuery({
    queryKey: ["vehicle-statuses"],
    queryFn: getVehicleStatuses,
    staleTime: 1000 * 60 * 60,
  });

export const useGearboxes = () =>
  useQuery({
    queryKey: ["gearboxes"],
    queryFn: getGearboxes,
    staleTime: 1000 * 60 * 60,
  });

export const useBodyTypes = () =>
  useQuery({
    queryKey: ["body-types"],
    queryFn: getBodyTypes,
    staleTime: 1000 * 60 * 60,
  });

export const useColours = () =>
  useQuery({
    queryKey: ["colours"],
    queryFn: getColours,
    staleTime: 1000 * 60 * 60,
  });

export const useDoorOptions = () =>
  useQuery({
    queryKey: ["doors"],
    queryFn: getDoorOptions,
    staleTime: 1000 * 60 * 60,
  });

export const useSeatOptions = () =>
  useQuery({
    queryKey: ["seats"],
    queryFn: getSeatOptions,
    staleTime: 1000 * 60 * 60,
  });

export const useFuelTypes = () =>
  useQuery({
    queryKey: ["fuel-types"],
    queryFn: getFuelTypes,
    staleTime: 1000 * 60 * 60,
  });

export const useAccelerationRanges = () =>
  useQuery({
    queryKey: ["acceleration"],
    queryFn: getAccelerationRanges,
    staleTime: 1000 * 60 * 60,
  });

export const useDriveTypes = () =>
  useQuery({
    queryKey: ["drive-types"],
    queryFn: getDriveTypes,
    staleTime: 1000 * 60 * 60,
  });

export const useBootSpaces = () =>
  useQuery({
    queryKey: ["boot-spaces"],
    queryFn: getBootSpaces,
    staleTime: 1000 * 60 * 60,
  });

export const useSellerTypes = () =>
  useQuery({
    queryKey: ["seller-types"],
    queryFn: getSellerTypes,
    staleTime: 1000 * 60 * 60,
  });
export const useAdDetail = (name: string) =>
  useQuery({
    queryKey: ["ad", name],
    queryFn: () => getAdDetail(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 5,
  })
 
// ─── Optional Combined Hook (clean usage) ─────────────────────
export const useVehicleFilters = () => {
  return {
    makes: useMakes(),
    years: useYears(),
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