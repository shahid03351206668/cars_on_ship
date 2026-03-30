// ─── Types ────────────────────────────────────────────────────

export type UserRole = "Buyer" | "Sales User";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  new_password: string;
  role: UserRole;
}

export interface LoginPayload {
  usr: string;
  pwd: string;
}

export interface AuthUser {
  email: string;
  full_name: string;
  role: UserRole;
}

// ─── Helpers ──────────────────────────────────────────────────

const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "fetch";
};

const postJSON = async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Frappe-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    let msg = "Something went wrong";
    if (data?._server_messages) {
      try {
        const parsed = JSON.parse(data._server_messages);
        const inner = JSON.parse(parsed[0]);
        msg = inner.message ?? msg;
      } catch {
        msg = data._server_messages;
      }
    } else if (data?.exception) {
      msg = data.exception;
    }
    throw new Error(msg);
  }

  return data.message as T;
};

// ─── Register ─────────────────────────────────────────────────
// Returns AuthUser directly — no second API call needed

export const registerUser = async (payload: RegisterPayload): Promise<AuthUser> => {
  return postJSON<AuthUser>("/api/method/cars_on_ship.api.register_user", {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    mobile_no: payload.mobile_no,
    new_password: payload.new_password,
    role: payload.role,
  });
};

// ─── Login ────────────────────────────────────────────────────
// Uses our custom endpoint — verifies password and returns AuthUser directly

export const loginUser = async (payload: LoginPayload): Promise<AuthUser> => {
  return postJSON<AuthUser>("/api/method/cars_on_ship.api.login_user", {
    usr: payload.usr,
    pwd: payload.pwd,
  });
};