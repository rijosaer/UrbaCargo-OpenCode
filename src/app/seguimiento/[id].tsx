import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { LeafletMap } from "@/components/LeafletMap";
import { RouteMapFallback } from "@/components/RouteMap";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import {
  DESTINATION,
  ORIGIN,
  STATUS_ORDER,
  statusIndex,
  type ShipmentStatus,
} from "@/data/shipments";
import { colors, money, radius } from "@/theme";
import { sampleLine } from "@/utils/geo";

export default function Seguimiento() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shipmentId = Array.isArray(id) ? id[0] : id;
  const { getShipment, advanceStatus, user } = useApp();
  const shipment = getShipment(shipmentId);

  const isCompany = user?.type === "Empresa";

  const [progress, setProgress] = useState(0);

  const status: ShipmentStatus = shipment?.status ?? "En preparación";
  const originCoord = shipment?.originCoord ?? ORIGIN;
  const destinationCoord = shipment?.destinationCoord ?? DESTINATION;

  const fallbackRoute = useMemo(
    () => sampleLine(originCoord, destinationCoord, 16),
    [originCoord, destinationCoord]
  );

  useEffect(() => {
    if (status === "En preparación") setProgress(0);
    else if (status === "Recogiendo paquete") setProgress(0.12);
    else if (status === "Cerca del destino") setProgress(0.85);
    else if (status === "Entregado") setProgress(1);
  }, [status]);

  useEffect(() => {
    if (status !== "En camino") return;
    setProgress((p) => (p < 0.15 ? 0.15 : p));
    const timer = setInterval(() => {
      setProgress((p) => (p < 0.82 ? Math.min(0.82, p + 0.02) : p));
    }, 900);
    return () => clearInterval(timer);
  }, [status]);

  if (!shipment) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.muted} />
        <Text style={styles.notFoundText}>No encontramos el envío solicitado.</Text>
      </View>
    );
  }

  const ratio = progress;
  const kmLeft = Math.max(0, shipment.distance * (1 - ratio));
  const eta = Math.max(0, Math.round(shipment.estimatedTime * (1 - ratio)));
  const delivered = status === "Entregado";
  const currentStatusIdx = statusIndex(status);
  const fallbackIdx = Math.round(ratio * (fallbackRoute.length - 1));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statusHeader}>
        <View>
          <Text style={styles.number}>{shipment.id}</Text>
          <Text style={styles.company}>
            {shipment.company} · {shipment.service}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{kmLeft.toFixed(1)} km</Text>
          <Text style={styles.metricLabel}>restantes</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{delivered ? "0" : eta} min</Text>
          <Text style={styles.metricLabel}>tiempo estimado</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{money(shipment.price)}</Text>
          <Text style={styles.metricLabel}>costo</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        {Platform.OS === "web" ? (
          <RouteMapFallback
            route={fallbackRoute}
            vehicle={shipment.vehicle}
            progress={fallbackIdx}
            originLabel={shipment.origin}
            destinationLabel={shipment.destination}
          />
        ) : (
          <LeafletMap
            origin={originCoord}
            destination={destinationCoord}
            progress={ratio}
            vehicleIcon={shipment.vehicle}
            originLabel={shipment.origin}
            destinationLabel={shipment.destination}
          />
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Origen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primaryDark }]} />
          <Text style={styles.legendText}>Repartidor</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendText}>Destino</Text>
        </View>
      </View>

      <View style={styles.stepper}>
        {STATUS_ORDER.map((s, i) => {
          const done = i <= currentStatusIdx;
          return (
            <View key={s} style={styles.step}>
              <View style={[styles.stepDot, done && styles.stepDotDone]}>
                {done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
              </View>
              <Text style={[styles.stepText, done && styles.stepTextDone]}>{s}</Text>
            </View>
          );
        })}
      </View>

      {delivered ? (
        <Pressable
          onPress={() => router.push({ pathname: "/resumen-envio", params: { id: shipment.id } })}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Ionicons name="document-text" size={18} color={colors.white} />
          <Text style={styles.primaryBtnText}>Ver comprobante</Text>
        </Pressable>
      ) : isCompany ? (
        <Pressable
          onPress={() => advanceStatus(shipment.id)}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Ionicons name="sync" size={18} color={colors.white} />
          <Text style={styles.primaryBtnText}>Actualizar estado</Text>
        </Pressable>
      ) : (
        <View style={styles.passiveNote}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={styles.passiveNoteText}>
            La empresa actualiza el estado del envío en tiempo real. Solo puedes verlo.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push({ pathname: "/resumen-envio", params: { id: shipment.id } })}
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
      >
        <Ionicons name="reader-outline" size={17} color={colors.primaryDark} />
        <Text style={styles.secondaryBtnText}>Ver resumen del envío</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 36, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  notFoundText: { color: colors.muted, fontSize: 14 },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  number: { fontSize: 19, fontWeight: "900", color: colors.text },
  company: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { fontSize: 15.5, fontWeight: "900", color: colors.primaryDark },
  metricLabel: { fontSize: 11, color: colors.muted, marginTop: 1 },
  metricDivider: { width: 1, height: 28, backgroundColor: colors.border },
  mapWrap: {
    height: 340,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#e5e7eb",
  },
  legend: { flexDirection: "row", gap: 16, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.subtle, fontWeight: "600" },
  stepper: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  step: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: { backgroundColor: colors.primary },
  stepText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  stepTextDone: { color: colors.text, fontWeight: "800" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  pressed: { opacity: 0.75 },
  primaryBtnText: { color: colors.white, fontSize: 15.5, fontWeight: "800" },
  secondaryBtnText: { color: colors.primaryDark, fontSize: 14, fontWeight: "800" },
  passiveNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 12,
  },
  passiveNoteText: { flex: 1, fontSize: 12.5, color: colors.primaryDark, fontWeight: "600" },
});
