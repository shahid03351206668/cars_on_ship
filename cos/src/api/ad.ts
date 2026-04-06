import { getStoredSid } from "./auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;


// The standard structure for a single document response from Frappe
export interface FrappeResponse<T> {
  data: T;
}

// The standard structure for a RPC/Method call response from Frappe
export interface FrappeMethodResponse<T> {
  message: T;
}

// Minimal representation of the Ad document returned by the server
export interface AdDocument extends CreateAdPayload {
  name: string;
  creation: string;
  modified: string;
  docstatus: number;
}

// ─── Types for Ad Submission ──────────────────────────────────

export interface AdDetailRow {
  image: string; // File path or attachment name
  description?: string;
}

export interface CreateAdPayload {
  // Basic Information
  lot_number: string;
  vin: string;
  auction_report?: string; // Attachment name
  user?: string; // Current logged-in user
  
  // Car Information
  year: string;
  make: string;
  model: string;
  variant: string;
  
  // Pricing & Mileage
  mileage: number;
  price: number;
  exterior_color: string;
  description: string;
  
  // Location
  country: string;
  city: string;
  area: string;
  
  // Status & ETA
  vehicle_status: string;
  eta: string;
  
  // Additional Information
  gearbox?: string;
  engine_size?: string;
  doors?: string;
  seats?: string;
  fuel_type?: string;
  battery_range?: string;
  charging_time?: string;
  engine_power?: string;
  acceleration?: string;
  fuel_consumption?: string;
  co2_emissions?: string;
  tax_per_year?: string;
  drive_type?: string;
  boot_space?: string;
  
  // Features (comma-separated)
  features?: string;
  
  // Contact Information
  contact_number: boolean;
  system_chat: boolean;
  whatsapp_contact: boolean;
  other_information: boolean;
  
  // Child Table: Ad Detail (images)
  ad_details?: AdDetailRow[];
  
  // Attachments
  attachments?: string[]; // File names/paths
}

// ─── CSRF Token Helper ────────────────────────────────────────
const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "fetch";
};

// ─── Get Stored User (from auth store) ────────────────────────
/**
 * Get the current authenticated user from localStorage
 * @returns User name or null if not authenticated
 */
const getStoredUser = (): string | null => {
  try {
    const raw = localStorage.getItem("cos-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: string | { name?: string } } };
    const user = parsed?.state?.user;
    // Handle both string and object formats
    if (typeof user === "string") return user;
    if (typeof user === "object" && user?.name) return user.name;
    return null;
  } catch {
    return null;
  }
};

// ─── File Upload Helper ───────────────────────────────────────
/**
 * Upload a file to ERPNext using Frappe's file upload API
 * @param file - File to upload
 * @returns Promise with attachment name/file path
 */
export const uploadFile = async (file: File): Promise<string> => {
  const sid = getStoredSid();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_private", "0");
  formData.append("doctype", "Ad");
  formData.append("docname", ""); // Will be filled after doc creation

  const url = new URL("/api/method/upload_file", BASE_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`File upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.message.file_url || data.message.name;
};

// ─── Batch File Upload ────────────────────────────────────────
/**
 * Upload multiple files in parallel
 * @param files - Array of files to upload
 * @returns Promise with array of file paths
 */
export const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
  return Promise.all(files.map((file) => uploadFile(file)));
};

// ─── Create Ad Record ─────────────────────────────────────────
/**
 * Create a new Ad record in ERPNext with all associated data
 * @param payload - Form data converted to Ad payload
 * @returns Promise with created Ad document
 */
export const createAd = async (payload: CreateAdPayload): Promise<AdDocument> => {
  const sid = getStoredSid();
  const url = new URL("/api/resource/Ad", BASE_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `Failed to create Ad: ${errorData.message || res.statusText}`
    );
  }

  const data = await res.json();
  return data.data;
};

// ─── Submit Ad Record ─────────────────────────────────────────
/**
 * Submit an Ad document (changes status from Draft to Submitted)
 * @param adName - Name/ID of the Ad document
 * @returns Promise with submitted document
 */
export const submitAd = async (adName: string): Promise<AdDocument> => {
  const sid = getStoredSid();
  const url = new URL("/api/method/frappe.client.submit", BASE_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
    body: JSON.stringify({
      doc: {
        doctype: "Ad",
        name: adName,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to submit Ad: ${res.statusText}`);
  }

  const data = await res.json();
  return data.message;
};

// ─── Complete Flow: Create & Submit ───────────────────────────
/**
 * Complete flow: upload files, create Ad record, and submit
 * @param formData - Form data from the Add Car form
 * @returns Promise with created and submitted Ad document
 */
export const submitAdWithFiles = async (formData: {
  lotNumber: string;
  vin: string;
  auctionReport: File | null;
  carInfo: {
    year: string;
    make: string;
    model: string;
    variant: string;
  };
  mileage: string;
  price: string;
  exteriorColor: string;
  description: string;
  country: string;
  city: string;
  area: string;
  mediaFiles: Array<{ file: File; type: "image" | "document" }>;
  vehicleStatus: string;
  eta: string;
  additionalInfo: {
    gearbox: string;
    engineSize: string;
    doors: string;
    seats: string;
    fuelType: string;
    batteryRange: string;
    chargingTime: string;
    enginePower: string;
    acceleration: string;
    fuelConsumption: string;
    co2Emissions: string;
    taxPerYear: string;
    driveType: string;
    bootSpace: string;
  };
  features: string[];
  contactInfo: {
    contactNumber: boolean;
    systemChat: boolean;
    whatsappContact: boolean;
    otherInformation: boolean;
    agreedToTerms: boolean;
  };
}): Promise<AdDocument> => {
  try {
    // Step 1: Upload all files (images and documents)
    const imageFiles = formData.mediaFiles
      .filter((m) => m.type === "image")
      .map((m) => m.file);
    const documentFiles = formData.mediaFiles
      .filter((m) => m.type === "document")
      .map((m) => m.file);

    let uploadedImages: string[] = [];
    let uploadedDocuments: string[] = [];
    let auctionReportPath: string | undefined;

    if (imageFiles.length > 0) {
      uploadedImages = await uploadMultipleFiles(imageFiles);
    }

    if (documentFiles.length > 0) {
      uploadedDocuments = await uploadMultipleFiles(documentFiles);
    }

    if (formData.auctionReport) {
      auctionReportPath = await uploadFile(formData.auctionReport);
    }

    // Step 2: Create Ad Detail rows (child table)
    const adDetails: AdDetailRow[] = uploadedImages.map((imagePath) => ({
      image: imagePath,
      description: formData.description,
    }));

    // Step 3: Build payload for Ad creation
    const payload: CreateAdPayload = {
      // Basic Information
      lot_number: formData.lotNumber,
      vin: formData.vin,
      auction_report: auctionReportPath,
      user: getStoredUser() || undefined, // Add current user

      // Car Information
      year: formData.carInfo.year,
      make: formData.carInfo.make,
      model: formData.carInfo.model,
      variant: formData.carInfo.variant,

      // Pricing & Mileage
      mileage: parseInt(formData.mileage) || 0,
      price: parseInt(formData.price) || 0,
      exterior_color: formData.exteriorColor,
      description: formData.description,

      // Location
      country: formData.country,
      city: formData.city,
      area: formData.area,

      // Status & ETA
      vehicle_status: formData.vehicleStatus,
      eta: formData.eta,

      // Additional Information
      gearbox: formData.additionalInfo.gearbox || undefined,
      engine_size: formData.additionalInfo.engineSize || undefined,
      doors: formData.additionalInfo.doors || undefined,
      seats: formData.additionalInfo.seats || undefined,
      fuel_type: formData.additionalInfo.fuelType || undefined,
      battery_range: formData.additionalInfo.batteryRange || undefined,
      charging_time: formData.additionalInfo.chargingTime || undefined,
      engine_power: formData.additionalInfo.enginePower || undefined,
      acceleration: formData.additionalInfo.acceleration || undefined,
      fuel_consumption: formData.additionalInfo.fuelConsumption || undefined,
      co2_emissions: formData.additionalInfo.co2Emissions || undefined,
      tax_per_year: formData.additionalInfo.taxPerYear || undefined,
      drive_type: formData.additionalInfo.driveType || undefined,
      boot_space: formData.additionalInfo.bootSpace || undefined,

      // Features (comma-separated string)
      features: formData.features.join(","),

      // Contact Information
      contact_number: formData.contactInfo.contactNumber,
      system_chat: formData.contactInfo.systemChat,
      whatsapp_contact: formData.contactInfo.whatsappContact,
      other_information: formData.contactInfo.otherInformation,

      // Child Table: Ad Details with images
      ad_details: adDetails,

      // Attachments (additional documents)
      attachments: uploadedDocuments,
    };

    // Step 3: Create Ad record
    const createdAd = await createAd(payload);

    // Step 4: Submit Ad record (optional - only if required by business logic)
    // Uncomment the line below if you want to auto-submit on creation
    // const submittedAd = await submitAd(createdAd.name);

    return createdAd;
  } catch (error) {
    console.error("Error submitting Ad:", error);
    throw error;
  }
}