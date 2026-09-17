import { StyleSheet, Text, View } from "react-native";

import type { ShipmentStatus } from "@/data/shipments";

const palette: Record<ShipmentStatus, { bg: string; fg: string }> = {
  "En preparación": { bg: "#FEF3C7", fg: "#B45309" },
  "Recogiendo paquete": { bg: "#DBEAFE", fg: "#1D4ED8" },
  "En camino": { bg: "#DCFCE7", fg: "#15803D" },
  "Cerca del destino": { bg: "#EDE9FE", fg: "#6D28D9" },
  Entregado: { bg: "#D1FAE5", fg: "#047857" },
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const c = palette[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.text, { color: c.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: "700" },
});
