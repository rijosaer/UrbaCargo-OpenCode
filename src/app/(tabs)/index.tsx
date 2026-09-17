import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Header } from "@/components/Header";
import { ShipmentCard } from "@/components/ShipmentCard";
import { useApp } from "@/context/AppContext";
import type { Shipment } from "@/data/shipments";
import { colors, radius } from "@/theme";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, shipments } = useApp();

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

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

  const active = shipments.filter((s) => s.status !== "Entregado");
  const pendingRate = shipments.filter((s) => s.status === "Entregado" && s.rated == null);
  const delivered = shipments.filter((s) => s.status === "Entregado");
  const lastShipments: Shipment[] = ready ? shipments.slice(0, 3) : [];

  const openShipment = (shipment: Shipment) =>
    shipment.status === "Entregado"
      ? router.push({ pathname: "/resumen-envio", params: { id: shipment.id } })
      : router.push(`/seguimiento/${shipment.id}`);

  const stats = [
    { label: "En camino", value: active.length, icon: "bicycle" as const, color: "#2563EB" },
    { label: "Por calificar", value: pendingRate.length, icon: "star" as const, color: "#F59E0B" },
    { label: "Entregados", value: delivered.length, icon: "checkmark-circle" as const, color: "#16A34A" },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Header
        name={user?.name ?? "Invitado"}
        location={user?.location ?? "Concepción, Chile"}
        right={
          <View style={styles.headerActions}>
            <Link href="/modal" asChild>
              <Pressable style={styles.infoBtn} hitSlop={6}>
                <Ionicons name="information-circle-outline" size={24} color={colors.white} />
              </Pressable>
            </Link>
            <Pressable onPress={handleLogout} style={styles.infoBtn} hitSlop={6}>
              <Ionicons name="log-out-outline" size={24} color={colors.white} />
            </Pressable>
          </View>
        }
      />

      <View style={styles.body}>
        <Text style={styles.welcome}>
          Hola, {user?.name?.split(" ")[0] ?? "Invitado"} 👋
        </Text>
        <Text style={styles.welcomeSub}>Este es el resumen de tus envíos en UrbaCargo.</Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}1A` }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/crear")}
            style={({ pressed }) => [styles.actionPrimary, pressed && styles.pressed]}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.actionPrimaryText}>Nuevo envío</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/pedidos")}
            style={({ pressed }) => [styles.actionSecondary, pressed && styles.pressed]}
          >
            <Ionicons name="reader-outline" size={19} color={colors.primaryDark} />
            <Text style={styles.actionSecondaryText}>Mis pedidos</Text>
          </Pressable>
        </View>

        {ready ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Últimos envíos</Text>
              {shipments.length > 3 ? (
                <Link href="/pedidos" asChild>
                  <Pressable hitSlop={6}>
                    <Text style={styles.seeAll}>Ver todos</Text>
                  </Pressable>
                </Link>
              ) : null}
            </View>

            {lastShipments.length > 0 ? (
              <View style={styles.list}>
                {lastShipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onPress={() => openShipment(shipment)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="cube-outline" size={38} color={colors.muted} />
                <Text style={styles.emptyTitle}>Aún no tienes envíos</Text>
                <Text style={styles.emptyText}>
                  Crea tu primer envío y aparecerá en el resumen con su seguimiento.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Cargando resumen…</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  infoBtn: { padding: 4 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  body: { paddingHorizontal: 20, marginTop: 18, gap: 14 },
  welcome: { fontSize: 20, fontWeight: "900", color: colors.text },
  welcomeSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: colors.text, marginTop: 6 },
  statLabel: { fontSize: 11.5, color: colors.muted, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 2 },
  actionPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  actionPrimaryText: { color: colors.white, fontSize: 14.5, fontWeight: "800" },
  actionSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  actionSecondaryText: { color: colors.primaryDark, fontSize: 14.5, fontWeight: "800" },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  section: { fontSize: 16, fontWeight: "800", color: colors.text },
  seeAll: { fontSize: 13, fontWeight: "700", color: colors.primary },
  list: { gap: 12, marginTop: 4 },
  empty: {
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginTop: 4,
  },
  emptyTitle: { fontSize: 14.5, fontWeight: "800", color: colors.text },
  emptyText: { fontSize: 12.5, color: colors.muted, textAlign: "center", lineHeight: 18 },
  loading: { alignItems: "center", paddingVertical: 40 },
  loadingText: { fontSize: 13, color: colors.muted },
  pressed: { opacity: 0.75 },
});