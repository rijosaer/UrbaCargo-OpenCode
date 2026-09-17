export type ShipmentStatus =
  | "En preparación"
  | "Recogiendo paquete"
  | "En camino"
  | "Cerca del destino"
  | "Entregado";

export const STATUS_ORDER: ShipmentStatus[] = [
  "En preparación",
  "Recogiendo paquete",
  "En camino",
  "Cerca del destino",
  "Entregado",
];

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Shipment {
  id: string;
  service: string;
  company: string;
  vehicle: string;
  origin: string;
  destination: string;
  originCoord: LatLng;
  destinationCoord: LatLng;
  price: number;
  status: ShipmentStatus;
  distance: number;
  estimatedTime: number;
  date: string;
  time: string;
  cargo: string;
  weight: string;
  size: string;
  description: string;
  observations: string;
  rated: number | null;
}

export type ShipmentDraft = Omit<
  Shipment,
  "id" | "status" | "date" | "time" | "rated"
>;

export const nextStatus = (s: ShipmentStatus): ShipmentStatus => {
  const i = STATUS_ORDER.indexOf(s);
  return i < 0 || i >= STATUS_ORDER.length - 1 ? "Entregado" : STATUS_ORDER[i + 1];
};

export const statusIndex = (s: ShipmentStatus) => STATUS_ORDER.indexOf(s);

export const ORIGIN: LatLng = { latitude: -36.8262, longitude: -73.0503 };
export const DESTINATION: LatLng = { latitude: -36.8109, longitude: -73.0638 };

export const initialShipments: Shipment[] = [
  {
    id: "ENV-1001",
    service: "Mensajería Exprés",
    company: "URBAMOTO",
    vehicle: "motorbike",
    origin: "Barrio Centro",
    destination: "Barrio San Francisco",
    originCoord: { latitude: -36.8262, longitude: -73.0503 },
    destinationCoord: { latitude: -36.8109, longitude: -73.0638 },
    price: 18000,
    status: "Entregado",
    distance: 4.2,
    estimatedTime: 25,
    date: "02/09/2026",
    time: "10:35",
    cargo: "Paquete",
    weight: "5 kg",
    size: "Mediano",
    description: "Documentos y un paquete pequeño",
    observations: "Entregar en recepción",
    rated: null,
  },
  {
    id: "ENV-1002",
    service: "Bicicleta de carga",
    company: "ECOBIKE",
    vehicle: "bicycle",
    origin: "Barrio San Pedro",
    destination: "Barrio Centro",
    originCoord: { latitude: -36.8368, longitude: -73.0445 },
    destinationCoord: { latitude: -36.8262, longitude: -73.0503 },
    price: 15000,
    status: "En camino",
    distance: 3.1,
    estimatedTime: 35,
    date: "10/09/2026",
    time: "16:10",
    cargo: "Caja",
    weight: "12 kg",
    size: "Grande",
    description: "Insumos para cafetería",
    observations: "Timbre 2 veces",
    rated: null,
  },
];
