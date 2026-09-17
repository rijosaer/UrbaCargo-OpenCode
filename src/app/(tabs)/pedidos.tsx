import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ShipmentCard } from "@/components/ShipmentCard";
import { useApp } from "@/context/AppContext";
import { colors, radius } from "@/theme";

type Segment = "activos" | "porcalificar" | "historico";

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: "activos", label: "Activos" },
  { key: "porcalificar", label: "Por calificar" },
  { key: "historico", label: "Histórico" },
];

export default function Pedidos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { shipments } = useApp();
  const [segment, setSegment] = useState<Segment>("activos");

  const counts = useMemo(
    () => ({
      activos: shipments.filter((s) => s.status !== "Entregado").length,
      porcalificar: shipments.filter((s) => s.status === "Entregado" && s.rated == null).length,
      historico: shipments.length,
    }),
    [shipments]
  );

  const list = useMemo(() => {
    if (segment === "activos") return shipments.filter((s) => s.status !== "Entregado");
    if (segment === "porcalificar")
      return shipments.filter((s) => s.status === "Entregado" && s.rated == null);
    return shipments;
  }, [shipments, segment]);

  const open = (id: string) => {
    if (segment === "porcalificar" || segment === "historico") {
      router.push({ pathname: "/resumen-envio", params: { id } });
    } else {
      router.push(`/seguimiento/${id}`);
    }
  };

  const emptyCopy: Record<Segment, { icon: string; title: string; text: string }> = {
    activos: {
      icon: "bicycle-outline",
      title: "No hay envíos activos",
      text: "Crea un envío y verás aquí su seguimiento en vivo.",
    },
    porcalificar: {
      icon: "star-outline",
      title: "Nada pendiente de calificar",
      text: "Cuando entreguen un envío podrás ver el comprobante y calificar.",
    },
    historico: {
      icon: "reader-outline",
      title: "Historial vacío",
      text: "Tus envíos finalizados aparecerán aquí con su comprobante.",
    },
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Mis pedidos</Text>
        <Text style={styles.subtitle}>
          {counts.activos} activos · {counts.porcalificar} por calificar · {counts.historico}{" "}
          históricos
        </Text>

        <View style={styles.segment}>
          {SEGMENTS.map((s) => {
            const active = segment === s.key;
            const badge =
              s.key === "porcalificar" && counts.porcalificar > 0 ? counts.porcalificar : null;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSegment(s.key)}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {s.label}
                </Text>
                {badge ? <View style={styles.segmentBadge}><Text style={styles.segmentBadgeText}>{badge}</Text></View> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ShipmentCard shipment={item} onPress={() => open(item.id)} />
        )}
        ListHeaderComponent={
          segment === "porcalificar" && list.length > 0 ? (
            <View style={styles.hint}>
              <Ionicons name="star" size={15} color={colors.star} />
              <Text style={styles.hintText}>
                Toca un pedido para ver el comprobante y dejarlo calificado.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name={emptyCopy[segment].icon as never} size={42} color={colors.muted} />
            <Text style={styles.emptyTitle}>{emptyCopy[segment].title}</Text>
            <Text style={styles.emptyText}>{emptyCopy[segment].text}</Text>
            <Link href="/crear" asChild>
              <Pressable style={styles.emptyBtn}>
                <Ionicons name="add-circle" size={18} color={colors.white} />
                <Text style={styles.emptyBtnText}>Crear envío</Text>
              </Pressable>
            </Link>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  title: { color: colors.white, fontSize: 24, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 12.5, marginTop: 2 },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.md,
    padding: 4,
    marginTop: 14,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.white },
  segmentText: { fontSize: 12.5, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  segmentTextActive: { color: colors.primaryDark },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.star,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  segmentBadgeText: { color: colors.white, fontSize: 11, fontWeight: "900" },
  list: { padding: 20, gap: 12, paddingBottom: 32 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: radius.md,
    padding: 11,
    marginBottom: 2,
  },
  hintText: { flex: 1, fontSize: 12.5, color: colors.subtle, fontWeight: "600" },
  empty: { alignItems: "center", gap: 8, paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 6 },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 19 },
  emptyBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: colors.white, fontWeight: "800" },
});