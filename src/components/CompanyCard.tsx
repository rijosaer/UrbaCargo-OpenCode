import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, money, radius } from "@/theme";

interface CompanyCardProps {
  name: string;
  service: string;
  rating: number;
  price: number;
  time: number;
  vehicle: string;
  tagline?: string;
  available?: boolean;
  cta?: string;
  onPress?: () => void;
}

export function CompanyCard({
  name,
  service,
  rating,
  price,
  time,
  vehicle,
  tagline,
  available = true,
  cta,
  onPress,
}: CompanyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name={vehicle as never} size={26} color={colors.primary} />
        </View>
        <View style={styles.head}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.service}>{service}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.star} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.sep}>•</Text>
            <Text style={available ? styles.avail : styles.unavail}>
              {available ? "Disponible" : "No disponible"}
            </Text>
          </View>
        </View>
      </View>

      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.price}>{money(price)}</Text>
          <Text style={styles.time}>
            <Ionicons name="time-outline" size={12} color={colors.muted} /> {time} min
          </Text>
        </View>
        {cta ? (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>{cta}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
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
  top: { flexDirection: "row", gap: 12, alignItems: "center" },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  head: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text },
  service: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  rating: { fontSize: 12.5, fontWeight: "700", color: colors.text },
  sep: { color: colors.muted },
  avail: { fontSize: 12.5, color: colors.primary, fontWeight: "700" },
  unavail: { fontSize: 12.5, color: colors.danger, fontWeight: "700" },
  tagline: { fontSize: 12.5, color: colors.subtle },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  price: { fontSize: 18, fontWeight: "800", color: colors.primaryDark },
  time: { fontSize: 12, color: colors.muted, marginTop: 2 },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 13.5 },
});
