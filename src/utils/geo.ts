import * as Location from "expo-location";

import type { LatLng } from "@/data/shipments";

export const CONCEPCION: LatLng = { latitude: -36.8269, longitude: -73.0498 };

export async function getCurrentPosition(): Promise<LatLng | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

export async function reverseGeocode(c: LatLng): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync(c);
    const r = results[0];
    if (r) {
      const parts = [r.street ?? r.name, r.district ?? r.subregion, r.city].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
  } catch {
    // sin geocodificación disponible
  }
  return `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`;
}

export const haversine = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 100) / 100;
};

export const coordParam = (c?: LatLng | null) =>
  c ? `${c.latitude.toFixed(6)},${c.longitude.toFixed(6)}` : "";

export const parseCoord = (value?: string | string[]): LatLng | undefined => {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return undefined;
  const [lat, lng] = v.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { latitude: lat, longitude: lng };
};

export const sampleLine = (a: LatLng, b: LatLng, n = 12): LatLng[] =>
  Array.from({ length: n }, (_, i) => ({
    latitude: a.latitude + (b.latitude - a.latitude) * (i / (n - 1)),
    longitude: a.longitude + (b.longitude - a.longitude) * (i / (n - 1)),
  }));
