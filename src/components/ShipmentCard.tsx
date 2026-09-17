import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Shipment } from "@/data/shipments";
import { colors, money, radius } from "@/theme";
import { StatusBadge } from "@/components/StatusBadge";

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: () => void;
}

export function ShipmentCard({ shipment, onPress }: ShipmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name={shipment.vehicle as never}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.head}>
          <Text style={styles.id}>{shipment.id}</Text>
          <Text style={styles.company}>{shipment.company}</Text>
        </View>
        <StatusBadge status={shipment.status} />
      </View>

      <View style={styles.route}>
        <Text style={styles.place} numberOfLines={1}>
          {shipment.origin}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={colors.muted} />
        <Text style={styles.place} numberOfLines={1}>
          {shipment.destination}
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.price}>{money(shipment.price)}</Text>
        <Text style={styles.date}>
          {shipment.date} · {shipment.time}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  head: { flex: 1 },
  id: { fontSize: 14, fontWeight: "800", color: colors.text },
  company: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  route: { flexDirection: "row", alignItems: "center", gap: 8 },
  place: { flex: 1, fontSize: 13, color: colors.subtle },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  price: { fontSize: 16, fontWeight: "800", color: colors.primaryDark },
  date: { fontSize: 12, color: colors.muted },
});
