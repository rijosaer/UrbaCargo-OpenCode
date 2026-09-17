export const colors = {
  primary: "#16A34A",
  primaryDark: "#15803D",
  primaryLight: "#DCFCE7",
  primarySoft: "#F0FDF4",
  accent: "#0D9488",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#111827",
  subtle: "#374151",
  muted: "#6B7280",
  border: "#E5E7EB",
  star: "#F59E0B",
  danger: "#DC2626",
  info: "#2563EB",
  purple: "#7C3AED",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
};

export const money = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

export const nowDate = () =>
  new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });

export const nowTime = () =>
  new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
