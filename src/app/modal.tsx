import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import { users } from "@/data/users";
import { colors, radius } from "@/theme";

const features = [
  ["Log in con roles Particular y Empresa", "person-circle-outline"],
  ["Comparación de empresas y costos", "git-compare-outline"],
  ["Seguimiento GPS con mapa y ruta", "map-outline"],
  ["Estados del envío en tiempo real", "sync-outline"],
  ["Historial, comprobante y calificación", "star-outline"],
] as const;

export default function Modal() {
  const router = useRouter();
  const { logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de UrbaCargo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.badge}>
        <Ionicons name="leaf" size={30} color={colors.white} />
      </View>
      <Text style={styles.title}>UrbaCargo</Text>
      <Text style={styles.subtitle}>
        MVP académico de mensajería exprés y micro-logística sostenible. Todos los datos son
        locales y simulados, sin backend.
      </Text>

      <View style={styles.card}>
        {features.map(([text, icon]) => (
          <View key={text} style={styles.item}>
            <Ionicons name={icon} size={18} color={colors.primary} />
            <Text style={styles.itemText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos de prueba</Text>
        {users.map((u) => (
          <Text key={u.email} style={styles.cred}>
            {u.type}: {u.email} · {u.password}
          </Text>
        ))}
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Cerrar</Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40, alignItems: "center" },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  title: { fontSize: 24, fontWeight: "900", color: colors.text, marginTop: 12 },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemText: { flex: 1, fontSize: 13, color: colors.subtle },
  cred: { fontSize: 12.5, color: colors.subtle },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: 20,
  },
  pressed: { opacity: 0.75 },
  buttonText: { color: colors.white, fontSize: 15.5, fontWeight: "800" },
  logoutBtn: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingVertical: 13,
    borderRadius: radius.md,
    marginTop: 10,
  },
  logoutText: { color: colors.danger, fontSize: 14.5, fontWeight: "800" },
});
