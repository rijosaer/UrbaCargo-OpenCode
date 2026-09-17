import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius } from "@/theme";

interface HeaderProps {
  name: string;
  location: string;
  right?: ReactNode;
}

export function Header({ name, location, right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 14 }]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.hello}>Hola, {name.split(" ")[0]} 👋</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-sharp" size={13} color="rgba(255,255,255,0.9)" />
            <Text style={styles.loc} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: "800" },
  info: { flex: 1 },
  hello: { color: colors.white, fontSize: 18, fontWeight: "800" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  loc: { color: "rgba(255,255,255,0.9)", fontSize: 12.5 },
});
