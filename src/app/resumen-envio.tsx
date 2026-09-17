import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { colors, money, radius } from "@/theme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function ResumenEnvio() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getShipment, setRating, user } = useApp();
  const shipmentId = Array.isArray(id) ? id[0] : id;
  const shipment = getShipment(shipmentId);

  const [stars, setStars] = useState(shipment?.rated ?? 0);

  useEffect(() => {
    if (shipment?.rated != null) setStars(shipment.rated);
  }, [shipment?.rated]);

  if (!shipment) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.muted} />
        <Text style={styles.notFoundText}>No encontramos el envío solicitado.</Text>
      </View>
    );
  }

  const delivered = shipment.status === "Entregado";
  const rated = shipment.rated != null;

  const rate = (value: number) => {
    setStars(value);
    setRating(shipment.id, value);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {delivered ? (
        <View style={styles.delivered}>
          <Ionicons name="checkmark-circle" size={30} color={colors.primaryDark} />
          <Text style={styles.deliveredText}>✓ Envío entregado</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.number}>{shipment.id}</Text>
            <Text style={styles.company}>{shipment.company}</Text>
          </View>
          <View style={[styles.vehicle, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons
              name={shipment.vehicle as never}
              size={24}
              color={colors.primary}
            />
          </View>
        </View>
        <StatusBadge status={shipment.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Información del envío</Text>
        <Row label="Servicio" value={shipment.service} />
        <Row label="Origen" value={shipment.origin} />
        <Row label="Destino" value={shipment.destination} />
        <Row label="Costo" value={money(shipment.price)} />
        <Row label="Fecha" value={shipment.date} />
        <Row label="Hora" value={shipment.time} />
        {shipment.scheduledDate ? (
          <Row
            label="Entregar el"
            value={`${shipment.scheduledDate} · ${shipment.scheduledTime ?? ""}`}
          />
        ) : null}
        <Row label="Distancia" value={`${shipment.distance} km`} />
        <Row label="Tiempo estimado" value={`${shipment.estimatedTime} min`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Información de la carga</Text>
        <Row label="Tipo" value={shipment.cargo} />
        <Row label="Peso" value={shipment.weight} />
        <Row label="Tamaño" value={shipment.size} />
        {shipment.description ? <Row label="Descripción" value={shipment.description} /> : null}
        {shipment.observations ? <Row label="Observaciones" value={shipment.observations} /> : null}
      </View>

      <Pressable
        onPress={() => router.push(`/seguimiento/${shipment.id}`)}
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
      >
        <Ionicons name="map" size={18} color={colors.white} />
        <Text style={styles.primaryBtnText}>Ver seguimiento</Text>
      </Pressable>

      {delivered ? (
        <View style={[styles.card, styles.receipt]}>
          <Text style={styles.section}>Comprobante de entrega</Text>
          <Text style={styles.receiptId}>{shipment.id}</Text>
          <Text style={styles.receiptText}>Entregado correctamente</Text>
          <Text style={styles.receiptMeta}>
            {shipment.company} · {shipment.date} {shipment.time}
          </Text>

          <View style={styles.divider} />

          {rated ? (
            <View style={styles.thanks}>
              <Ionicons name="sparkles" size={18} color={colors.primaryDark} />
              <Text style={styles.thanksText}>¡Gracias por tu calificación!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.rateLabel}>
                {user?.type === "Empresa" ? "Calificar al cliente" : "Calificar servicio"}
              </Text>
              <Text style={styles.rateHint}>
                {user?.type === "Empresa"
                  ? "Como empresa no calificas tu propio servicio: valora al cliente que solicitó este envío."
                  : "Valora la atención y rapidez de la empresa que realizó este envío."}
              </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => rate(n)} hitSlop={6}>
                    <Ionicons
                      name={n <= stars ? "star" : "star-outline"}
                      size={30}
                      color={colors.star}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  notFoundText: { color: colors.muted, fontSize: 14 },
  delivered: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: 14,
  },
  deliveredText: { fontSize: 15, fontWeight: "800", color: colors.primaryDark },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  number: { fontSize: 20, fontWeight: "900", color: colors.text },
  company: { fontSize: 13.5, color: colors.muted, marginTop: 2 },
  vehicle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "right" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  pressed: { opacity: 0.75 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  receipt: { borderStyle: "dashed", borderColor: colors.primary },
  receiptId: { fontSize: 24, fontWeight: "900", color: colors.primaryDark },
  receiptText: { fontSize: 13.5, color: colors.subtle },
  receiptMeta: { fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  rateLabel: { fontSize: 13.5, fontWeight: "800", color: colors.text },
  rateHint: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  stars: { flexDirection: "row", gap: 6, marginTop: 4 },
  thanks: { flexDirection: "row", alignItems: "center", gap: 8 },
  thanksText: { fontSize: 14, fontWeight: "800", color: colors.primaryDark },
});
