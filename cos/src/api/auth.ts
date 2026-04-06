export type UserRole = "Buyer" | "Sales User";

export interface RegisterPayload {
  user_name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface LoginPayload {
  usr: string;
}

export interface AuthUser {
  name: string;
  sid: string;
  username: string;
  email: string;
  user_image: string | null;
  role: UserRole;
}

// ─── Base URL ─────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ─── Read sid from persisted Zustand store ────────────────────
export const getStoredSid = (): string | null => {
  try {
    const raw = localStorage.getItem("cos-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { sid?: string } };
    return parsed?.state?.sid ?? null;
  } catch {
    return null;
  }
};

// ─── CSRF Token ───────────────────────────────────────────────
const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "fetch";
};

// ─── Error Parser ─────────────────────────────────────────────
const parseError = (data: Record<string, unknown>): string | null => {
  if (data._server_messages) {
    try {
      const messages = JSON.parse(data._server_messages as string);
      const inner = JSON.parse(messages[0]);
      return inner.message;
    } catch {
      return String(data._server_messages);
    }
  }
  if (data.exception) return String(data.exception);
  return null;
};

// ─── Public POST (login, register — no auth needed) ───────────
export const postForm = async <T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
    body: params.toString(),
  });

  const data = await res.json();
  const errMsg = parseError(data);
  if (errMsg) throw new Error(errMsg);

  const msg = data?.message;
  if (msg?.success === false || msg?.success_key === 0) {
    throw new Error(msg?.message ?? "Something went wrong");
  }
  if (!res.ok) throw new Error("Server Error");

  return msg as T;
};

// ─── Authenticated POST (attaches sid in header) ──────────────
export const authPost = async <T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const sid = getStoredSid();

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
    body: params.toString(),
  });

  const data = await res.json();
  const errMsg = parseError(data);
  if (errMsg) throw new Error(errMsg);

  const msg = data?.message;
  if (msg?.success === false || msg?.success_key === 0) {
    throw new Error(msg?.message ?? "Something went wrong");
  }
  if (!res.ok) throw new Error("Server Error");

  return msg as T;
};

// ─── Authenticated GET ────────────────────────────────────────
export const authGet = async <T>(
  path: string,
  params?: Record<string, string>
): Promise<T> => {
  const sid = getStoredSid();
  const query = params ? "?" + new URLSearchParams(params).toString() : "";

  const res = await fetch(`${BASE_URL}${path}${query}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "X-Frappe-CSRF-Token": getCsrfToken(),
      ...(sid ? { "X-Frappe-Session-Id": sid } : {}),
    },
  });

  const data = await res.json();
  const errMsg = parseError(data);
  if (errMsg) throw new Error(errMsg);

  const msg = data?.message;
  if (msg?.success === false || msg?.success_key === 0) {
    throw new Error(msg?.message ?? "Something went wrong");
  }
  if (!res.ok) throw new Error("Server Error");

  return msg as T;
};

// ─── Register ─────────────────────────────────────────────────
export const registerUser = async (
  payload: RegisterPayload
): Promise<{ success: boolean; message: string }> => {
  return postForm("/api/method/cars_on_ship.authentication.create_user", {
    user: payload.user_name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
  });
};

// ─── Login ────────────────────────────────────────────────────
export const loginUser = async (
  payload: LoginPayload & { phone: string }
): Promise<AuthUser> => {
  const result = await postForm<{
    success: boolean;
    message: string;
    data: AuthUser;
  }>("/api/method/cars_on_ship.authentication.login", {
    usr: payload.phone,
  });
  return result.data;
};