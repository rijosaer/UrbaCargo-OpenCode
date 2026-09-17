import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CompanyCard } from "@/components/CompanyCard";
import { useApp } from "@/context/AppContext";
import { companies, companyCanHandle, estimatePrice } from "@/data/companies";
import { DESTINATION, ORIGIN } from "@/data/shipments";
import { colors, radius } from "@/theme";
import { parseCoord } from "@/utils/geo";

const asString = (v: string | string[] | undefined, fallback = "") =>
  Array.isArray(v) ? v[0] : v ?? fallback;

export default function Empresas() {
  const router = useRouter();
  const { createShipment } = useApp();
  const params = useLocalSearchParams();

  const service = asString(params.service, "Mensajería Exprés");
  const cargo = asString(params.cargo, "Paquete");
  const description = asString(params.description, "");
  const weight = asString(params.weight, "5 kg");
  const size = asString(params.size, "Mediano");
  const origin = asString(params.origin, "Barrio Centro");
  const destination = asString(params.destination, "Barrio San Francisco");
  const date = asString(params.date, "");
  const time = asString(params.time, "");
  const observations = asString(params.observations, "");
  const distance = Number(asString(params.distance, "4.2")) || 4.2;
  const weightNumber = Number(weight.replace(/[^0-9.]/g, "")) || 0;
  const originCoord = parseCoord(params.originCoord) ?? ORIGIN;
  const destinationCoord = parseCoord(params.destinationCoord) ?? DESTINATION;

  const available = companies.filter((c) => companyCanHandle(c, cargo, weightNumber, size));

  const selectCompany = (company: (typeof companies)[number]) => {
    const price =
      Math.round((estimatePrice(weightNumber, distance, size) * company.multiplier) / 100) * 100;
    const shipment = createShipment({
      service,
      company: company.name,
      vehicle: company.vehicle,
      origin,
      destination,
      originCoord,
      destinationCoord,
      price,
      distance,
      estimatedTime: company.baseTime,
      cargo,
      weight,
      size,
      description,
      observations,
    });
    router.replace({ pathname: "/resumen-envio", params: { id: shipment.id } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summary}>
        <View style={styles.routeRow}>
          <Ionicons name="location-sharp" size={16} color={colors.primaryDark} />
          <Text style={styles.routeText} numberOfLines={1}>
            {origin}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={colors.muted} />
          <Ionicons name="flag" size={15} color={colors.primaryDark} />
          <Text style={styles.routeText} numberOfLines={1}>
            {destination}
          </Text>
        </View>
        <Text style={styles.summaryMeta}>
          {service} · {cargo} · {weight} · {size} · {distance} km
        </Text>
      </View>

      <Text style={styles.title}>Elige una empresa</Text>
      <Text style={styles.subtitle}>
        Compara precio, tiempo y calificación y selecciona la opción que prefieras.
      </Text>

      {available.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.muted} />
          <Text style={styles.emptyTitle}>Ninguna empresa puede con este envío</Text>
          <Text style={styles.emptyText}>
            {"Prueba con un peso menor, un tamaño más chico o vuelve atrás y cambia el tipo de carga."}
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {available.map((company) => {
          const price =
            Math.round(
              (estimatePrice(weightNumber, distance, size) * company.multiplier) / 100
            ) * 100;
          return (
            <CompanyCard
              key={company.id}
              name={company.name}
              service={company.service}
              rating={company.rating}
              vehicle={company.vehicle}
              tagline={company.tagline}
              available={company.available}
              price={price}
              time={company.baseTime}
              cta="Seleccionar"
              onPress={() => selectCompany(company)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 36 },
  summary: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: 14,
    gap: 6,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeText: { flex: 1, fontSize: 13.5, fontWeight: "700", color: colors.primaryDark },
  summaryMeta: { fontSize: 12, color: colors.subtle },
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 20 },
  subtitle: { fontSize: 12.5, color: colors.muted, marginTop: 4 },
  list: { gap: 12, marginTop: 16 },
  empty: {
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 14.5, fontWeight: "800", color: colors.text, textAlign: "center" },
  emptyText: { fontSize: 12.5, color: colors.muted, textAlign: "center", lineHeight: 18 },
});
