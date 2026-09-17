/**
 * Centralized API Configuration for Noir Studio Frontend
 * Ensures all API calls connect to the live production server or configured environment.
 */

export const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  // Guard against invalid localhost URL in production deployment
  const isInvalidLocalhostInProd =
    process.env.NODE_ENV === "production" &&
    envUrl &&
    (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));

  const candidate =
    envUrl && !isInvalidLocalhostInProd
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
