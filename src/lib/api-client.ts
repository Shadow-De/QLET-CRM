/**
 * Typed API client for the QletLettings CRM.
 * All requests are to the Next.js route handlers — no external API calls.
 * Assumes the session cookie is present (managed by Auth.js).
 */

const BASE = "";

type ApiError = { error: { message: string; code?: string } };

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });

    const json = (await res.json()) as T | ApiError;

    if (!res.ok) {
      const errBody = json as ApiError;
      return { data: null, error: errBody?.error?.message ?? "An unexpected error occurred." };
    }

    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "Network error. Please check your connection." };
  }
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leadsApi = {
  list: (params?: { status?: string; area?: string; propertyType?: string; page?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ leads: Lead[]; total: number; page: number; limit: number }>(
      `/api/leads${qs ? `?${qs}` : ""}`
    );
  },
  get: (id: string) => request<{ lead: Lead }>(`/api/leads/${id}`),
  create: (data: CreateLeadData) =>
    request<{ lead: Lead }>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Lead>) =>
    request<{ lead: Lead }>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/leads/${id}`, { method: "DELETE" }),
  submitPublic: (data: PublicLeadData) =>
    request<{ message: string }>("/api/leads/public", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Properties ──────────────────────────────────────────────────────────────

export const propertiesApi = {
  list: (params?: { city?: string; available?: boolean; type?: string; page?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ properties: Property[]; total: number }>(
      `/api/properties${qs ? `?${qs}` : ""}`
    );
  },
  get: (id: string) => request<{ property: Property }>(`/api/properties/${id}`),
  create: (data: CreatePropertyData) =>
    request<{ property: Property }>("/api/properties", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Property>) =>
    request<{ property: Property }>(`/api/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/properties/${id}`, { method: "DELETE" }),
};

// ─── Tenants ─────────────────────────────────────────────────────────────────

export const tenantsApi = {
  list: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<{ tenants: Tenant[]; total: number }>(
      `/api/tenants${qs ? `?${qs}` : ""}`
    );
  },
  create: (data: CreateTenantData) =>
    request<{ tenant: Tenant }>("/api/tenants", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Tenant>) =>
    request<{ tenant: Tenant }>(`/api/tenants/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/tenants/${id}`, { method: "DELETE" }),
};

// ─── Intake Links ─────────────────────────────────────────────────────────────

export const intakeLinksApi = {
  create: (data?: { leadId?: string; expiryDays?: number }) =>
    request<{ link: IntakeLink }>("/api/intake-links", {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  validate: (id: string) =>
    request<{ valid: boolean }>(`/api/intake-links/${id}/validate`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  growth: () =>
    request<{ growth: { month: string; deals: number }[] }>("/api/analytics/growth"),
  pipeline: () =>
    request<{ pipeline: { status: string; count: number; percentage: number }[]; total: number }>(
      "/api/analytics/pipeline"
    ),
  demand: () =>
    request<{
      byArea: { area: string | null; count: number }[];
      byPropertyType: { type: string | null; count: number }[];
      byNationality: { nationality: string | null; count: number }[];
    }>("/api/analytics/demand"),
  timeToClose: () =>
    request<{ averageDays: number | null; totalWon: number }>("/api/analytics/time-to-close"),
};

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () =>
    request<{
      agent: { id: string; email: string; name: string; role: string };
      settings: { defaultLinkExpiryDays: number; emailOnNewLead: boolean; hasSeenTour: boolean } | null;
    }>("/api/settings"),
  update: (data: { defaultLinkExpiryDays?: number; emailOnNewLead?: boolean }) =>
    request<{ settings: object }>("/api/settings", { method: "PATCH", body: JSON.stringify(data) }),
  replayTour: () =>
    request<{ message: string }>("/api/settings/replay-tour", { method: "POST" }),
  exportData: () => fetch("/api/settings/export-data", { method: "POST" }),
  deleteAccount: (data: { currentPassword: string; confirmPhrase: "DELETE MY ACCOUNT" }) =>
    request<{ message: string }>("/api/settings/account", {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
};

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  area?: string | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  budget?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
  intakeLinkId?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; status: string } | null;
};

export type Property = {
  id: string;
  title: string;
  address: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms?: number | null;
  monthlyRent: string;
  available: boolean;
  availableFrom?: string | null;
  description?: string | null;
  epcRating?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Tenant = {
  id: string;
  status: string;
  leaseStart: string;
  leaseEnd?: string | null;
  monthlyRent: string;
  depositHeld?: string | null;
  createdAt: string;
  lead: { id: string; name: string; email: string; phone?: string | null; nationality?: string | null };
  property: { id: string; title: string; address: string; type: string; bedrooms: number };
};

export type IntakeLink = {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  url: string;
  expiryDays: number;
};

export type CreateLeadData = {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  area?: string;
  propertyType?: string;
  bedrooms?: number;
  budget?: string;
  source?: string;
  notes?: string;
};

export type PublicLeadData = CreateLeadData & {
  intakeLinkId: string;
  turnstileToken: string;
  website?: string;
};

export type CreatePropertyData = {
  title: string;
  address: string;
  city?: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  monthlyRent: string;
  available?: boolean;
  availableFrom?: string;
  description?: string;
  epcRating?: string;
};

export type CreateTenantData = {
  leadId: string;
  propertyId: string;
  leaseStart: string;
  leaseEnd?: string;
  monthlyRent: string;
  depositHeld?: string;
};
