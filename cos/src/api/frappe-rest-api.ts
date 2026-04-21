import { 
  getCsrfToken, 
  BASE_URL,
  type Year, 
  type Port, 
  type VehicleStatus, 
  type Feature, 
  type EnginePower, 
  type Gearbox, 
  type BodyType, 
  type Colour, 
  type DoorOption, 
  type SeatOption, 
  type FuelType, 
  type AccelerationRange, 
  type DriveType, 
  type BootSpace, 
  type SellerType ,
  type Make,
  type Model,
  type Variant,
} from "./vehicles";



export const getYears = async (): Promise<Year[]> => {
  const url = new URL(`/api/resource/Year`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name", "year"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch all available ports
 */
export const getPorts = async (): Promise<Port[]> => {
  const url = new URL(`/api/resource/Port`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

export const getVehicleStatuses = async (): Promise<VehicleStatus[]> => {
  const url = new URL(`/api/resource/Vehicle Status`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

export const getFeatures = async (): Promise<Feature[]> => {
  const url = new URL(`/api/resource/Features`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

export const getEnginePower = async (): Promise<EnginePower[]> => {
  const url = new URL(`/api/resource/Engine Power`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch all transmission types
 */
export const getGearboxes = async (): Promise<Gearbox[]> => {
  const url = new URL(`/api/resource/Gearbox`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch all body types (SUV, Sedan, Hatchback, etc.)
 */
export const getBodyTypes = async (): Promise<BodyType[]> => {
  const url = new URL(`/api/resource/Body type`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch all available car colors
 */
export const getColours = async (): Promise<Colour[]> => {
  const url = new URL(`/api/resource/Colour`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name", "color_code"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch door count options
 */
export const getDoorOptions = async (): Promise<DoorOption[]> => {
  const url = new URL(`/api/resource/Doors`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch seating capacity options
 */
export const getSeatOptions = async (): Promise<SeatOption[]> => {
  const url = new URL(`/api/resource/Seats`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch fuel type categories (Petrol, Diesel, Hybrid, Electric)
 */
export const getFuelTypes = async (): Promise<FuelType[]> => {
  const url = new URL(`/api/resource/Fuel Type`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch acceleration brackets (e.g., 0-62mph times)
 */
export const getAccelerationRanges = async (): Promise<AccelerationRange[]> => {
  const url = new URL(`/api/resource/Acceleration`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch drivetrain options (AWD, FWD, RWD)
 */
export const getDriveTypes = async (): Promise<DriveType[]> => {
  const url = new URL(`/api/resource/Drive type`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch trunk/boot capacity categories
 */
export const getBootSpaces = async (): Promise<BootSpace[]> => {
  const url = new URL(`/api/resource/Boot space`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

/**
 * Fetch seller categories (Private, Dealer, etc.)
 */
export const getSellerTypes = async (): Promise<SellerType[]> => {
  const url = new URL(`/api/resource/Seller type`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};




export const getMakes = async (): Promise<Make[]> => {
  const url = new URL(`/api/resource/Make`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name"]));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

export const getModels = async (make?: string): Promise<Model[]> => {
  const url = new URL(`/api/resource/Model`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name", "make"]));
  
  if (make) {
    url.searchParams.append("filters", JSON.stringify([["make", "=", make]]));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};

export const getVariants = async (model?: string): Promise<Variant[]> => {
  const url = new URL(`/api/resource/Variant`, BASE_URL);
  url.searchParams.append("fields", JSON.stringify(["name", "model"]));
  
  if (model) {
    url.searchParams.append("filters", JSON.stringify([["model", "=", model]]));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
  });

  if (!res.ok) throw new Error("API Error");

  const data = await res.json();
  return data.data;
};