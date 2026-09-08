/**
 * Centralized API Configuration for Noir Studio Frontend
 * Ensures all API calls connect to the live production server or configured environment.
 */

export const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  // Prefer environment variable unless it's a legacy localhost reference in production
  const candidate =
    envUrl && !envUrl.includes("localhost:5000")
      ? envUrl
      : "https://server-mens-ware.vercel.app/api";

  const clean = candidate.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

export const API_BASE_URL = getBaseUrl();

export const getApiUrl = (endpoint: string = ""): string => {
  const base = getBaseUrl();
  if (!endpoint) return base;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getBaseUrl,
};
