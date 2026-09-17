import type { LatLng } from "@/data/shipments";

export interface Company {
  id: string;
  name: string;
  service: string;
  rating: number;
  baseTime: number;
  multiplier: number;
  vehicle: string;
  color: string;
  tagline: string;
  available: boolean;
  minWeight: number;
  maxWeight: number;
  minSize: Size;
  maxSize: Size;
  excludedCargos: string[];
}

export const sizes = ["Pequeño", "Mediano", "Grande", "Extra grande"] as const;
export type Size = (typeof sizes)[number];

export const sizeIndex = (size: string) => {
  const i = sizes.indexOf(size as Size);
  return i < 0 ? 0 : i;
};

export const companies: Company[] = [
  {
    id: "u1",
    name: "URBAMOTO",
    service: "Mensajería Exprés",
    rating: 4.8,
    baseTime: 25,
    multiplier: 0.95,
    vehicle: "motorbike",
    color: "#16A34A",
    tagline: "Rápida y ágil por la ciudad",
    available: true,
    minWeight: 0,
    maxWeight: 25,
    minSize: "Pequeño",
    maxSize: "Grande",
    excludedCargos: ["Carga Pesada", "Pallet"],
  },
  {
    id: "u2",
    name: "ECOBIKE",
    service: "Bicicleta de carga",
    rating: 4.9,
    baseTime: 35,
    multiplier: 0.78,
    vehicle: "bicycle",
    color: "#0D9488",
    tagline: "100% sostenible, cero emisiones",
    available: true,
    minWeight: 0,
    maxWeight: 20,
    minSize: "Pequeño",
    maxSize: "Grande",
    excludedCargos: ["Carga Pesada", "Pallet"],
  },
  {
    id: "u3",
    name: "URBAFLEET",
    service: "Carga pesada / Flota",
    rating: 4.7,
    baseTime: 20,
    multiplier: 1.3,
    vehicle: "truck-fast",
    color: "#2563EB",
    tagline: "Para cargas grandes y pallets",
    available: true,
    minWeight: 30,
    maxWeight: 9999,
    minSize: "Grande",
    maxSize: "Extra grande",
    excludedCargos: ["Documento", "Paquete", "Comida", "Frágil"],
  },
];

export const companyCanHandle = (
  company: Company,
  cargo: string,
  weight: number,
  size: string
) => {
  if (company.excludedCargos.includes(cargo)) return false;
  if (weight < company.minWeight) return false;
  if (weight > company.maxWeight) return false;
  const si = sizeIndex(size);
  if (si < sizeIndex(company.minSize)) return false;
  if (si > sizeIndex(company.maxSize)) return false;
  return true;
};

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: "c1", title: "Mensajería Exprés", icon: "flash", color: "#16A34A" },
  { id: "c2", title: "Carga Pesada", icon: "package-variant-closed", color: "#2563EB" },
  { id: "c3", title: "Flota", icon: "truck-fast", color: "#7C3AED" },
  { id: "c4", title: "Micro-logística", icon: "warehouse", color: "#0D9488" },
  { id: "c5", title: "Domicilios", icon: "home-variant", color: "#F59E0B" },
  { id: "c6", title: "Bicicleta de carga", icon: "bicycle", color: "#059669" },
  { id: "c7", title: "Moto eléctrica", icon: "motorbike", color: "#DB2777" },
  { id: "c8", title: "Paquetería", icon: "cube-outline", color: "#EA580C" },
];

export const services = [
  "Mensajería Exprés",
  "Domicilios",
  "Micro-logística",
  "Carga Pesada",
  "Bicicleta de carga",
];

export const cargoTypes = ["Paquete", "Documento", "Caja", "Pallet", "Comida", "Frágil"];

export const estimatePrice = (weight: number, distance: number, size: string) =>
  3000 + weight * 1200 + sizeIndex(size) * 1500 + distance * 1800;

export interface Place {
  id: string;
  name: string;
  zone: string;
  coord: LatLng;
}

export const places: Place[] = [
  { id: "p1", name: "Barrio Centro", zone: "Concepción", coord: { latitude: -36.8262, longitude: -73.0503 } },
  { id: "p2", name: "Barrio San Francisco", zone: "Concepción", coord: { latitude: -36.8109, longitude: -73.0638 } },
  { id: "p3", name: "Barrio San Pedro", zone: "Concepción", coord: { latitude: -36.8368, longitude: -73.0445 } },
  { id: "p4", name: "Barrio Universitario", zone: "Concepción", coord: { latitude: -36.8285, longitude: -73.0422 } },
  { id: "p5", name: "Barrio Brasil", zone: "Concepción", coord: { latitude: -36.8167, longitude: -73.0567 } },
  { id: "p6", name: "Barrio Norte", zone: "Concepción", coord: { latitude: -36.808, longitude: -73.052 } },
  { id: "p7", name: "Barrio Laguna Redonda", zone: "Concepción", coord: { latitude: -36.833, longitude: -73.056 } },
  { id: "p8", name: "Barrio Los Cerros", zone: "Concepción", coord: { latitude: -36.821, longitude: -73.033 } },
  { id: "p9", name: "Barrio Estación", zone: "Concepción", coord: { latitude: -36.83, longitude: -73.055 } },
  { id: "p10", name: "Barrio Pedro de Valdivia", zone: "Concepción", coord: { latitude: -36.827, longitude: -73.04 } },
];
