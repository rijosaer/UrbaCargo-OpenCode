import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PlacePicker } from "@/components/PlacePicker";
import { SelectSheet } from "@/components/SelectSheet";
import { cargoTypes, estimatePrice, places, services, sizes } from "@/data/companies";
import type { LatLng } from "@/data/shipments";
import { colors, money, radius } from "@/theme";
import { coordParam, haversine } from "@/utils/geo";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const DEFAULT_DISTANCE = 4.2;
const placeByName = (name: string) => places.find((p) => p.name === name)?.coord ?? null;

const fmtDateShort = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const fmtTimeShort = (d: Date) => {
  const h = d.getHours();
  const h12 = h % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "p. m." : "a. m.";
  return `${h12}:${m} ${ap}`;
};

function RouteField({ value, onOpen }: { value: string; onOpen: () => void }) {
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.routeField, pressed && styles.pressed]}
    >
      <Text style={[styles.routeValue, !value && styles.routePlaceholder]} numberOfLines={2}>
        {value || "Elegir lugar"}
      </Text>
      <Ionicons name="chevron-down" size={15} color={colors.muted} />
    </Pressable>
  );
}

export function CrearEnvioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();

  const [service, setService] = useState(
    typeof params.service === "string" ? params.service : "Domicilios"
  );
  const [cargo, setCargo] = useState("Paquete");
  const [size, setSize] = useState<string>("Mediano");
  const [weight, setWeight] = useState("5");
  const [origin, setOrigin] = useState("Barrio Centro");
  const [originCoord, setOriginCoord] = useState<LatLng | null>(placeByName("Barrio Centro"));
  const [destination, setDestination] = useState("Barrio San Francisco");
  const [destinationCoord, setDestinationCoord] = useState<LatLng | null>(
    placeByName("Barrio San Francisco")
  );
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");

  const [serviceOpen, setServiceOpen] = useState(false);
  const [cargoStep, setCargoStep] = useState<"tipo" | "tamano" | null>(null);
  const [progOpen, setProgOpen] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [error, setError] = useState("");

  const weightNumber = Number(weight.replace(",", ".")) || 0;
  const distance =
    originCoord && destinationCoord
      ? Math.max(0.4, haversine(originCoord, destinationCoord))
      : DEFAULT_DISTANCE;
  const estimated = estimatePrice(weightNumber, distance, size);

  const onChangeDate = (_e: DateTimePickerEvent, selected?: Date) => {
    setShowDate(Platform.OS === "ios");
    if (selected) setDate(selected);
  };
  const onChangeTime = (_e: DateTimePickerEvent, selected?: Date) => {
    setShowTime(Platform.OS === "ios");
    if (selected) setTime(selected);
  };

  const swapRoute = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginCoord(destinationCoord);
    setDestinationCoord(originCoord);
  };

  const handleContinue = () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Selecciona la dirección de origen y de destino.");
      return;
    }
    if (weightNumber <= 0) {
      setError("Ingresa un peso aproximado válido.");
      return;
    }
    setError("");
    router.push({
      pathname: "/empresas",
      params: {
        service,
        cargo,
        description,
        weight: `${weightNumber} kg`,
        size,
        origin,
        destination,
        originCoord: coordParam(originCoord),
        destinationCoord: coordParam(destinationCoord),
        date: new Date(date).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }),
        time: new Date(time).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
        observations,
        distance: distance.toFixed(2),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.title}>Crear envío</Text>
          <Text style={styles.subtitle}>Completa los datos de tu envío</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Ruta</Text>
          <Pressable onPress={swapRoute} style={styles.swapBtn} hitSlop={8}>
            <Ionicons name="swap-vertical" size={15} color={colors.primary} />
            <Text style={styles.swapText}>Cambiar</Text>
          </Pressable>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeGutter}>
            <View style={[styles.gutterDot, { backgroundColor: colors.primary }]} />
            <View style={styles.gutterLine} />
            <View style={[styles.gutterDot, { backgroundColor: colors.danger }]} />
          </View>
          <View style={styles.routeFields}>
            <PlacePicker
              value={origin}
              onChange={(v, c) => {
                setOrigin(v);
                if (c) setOriginCoord(c);
              }}
              places={places}
              title="Origen"
              icon="location-outline"
              initialCenter={originCoord}
              renderTrigger={(open) => <RouteField value={origin} onOpen={open} />}
            />
            <View style={styles.routeDivider} />
            <PlacePicker
              value={destination}
              onChange={(v, c) => {
                setDestination(v);
                if (c) setDestinationCoord(c);
              }}
              places={places}
              title="Destino"
              icon="flag-outline"
              initialCenter={originCoord}
              renderTrigger={(open) => <RouteField value={destination} onOpen={open} />}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Servicio</Text>
        <Pressable
          onPress={() => setServiceOpen(true)}
          style={({ pressed }) => [styles.selectCard, pressed && styles.pressed]}
        >
          <View style={styles.selectBody}>
            <Text style={styles.selectLabel}>Tipo de servicio</Text>
            <Text style={styles.selectValue} numberOfLines={1}>
              {service}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>

        <Text style={styles.sectionLabel}>¿Qué vas a enviar?</Text>
        <Pressable
          onPress={() => setCargoStep("tipo")}
          style={({ pressed }) => [styles.selectCard, pressed && styles.pressed]}
        >
          <View style={styles.selectBody}>
            <Text style={styles.selectLabel}>Tipo de carga</Text>
            <Text style={styles.selectValue} numberOfLines={1}>
              {cargo} · {size}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>

        <Text style={styles.sectionLabel}>Detalles</Text>
        <View style={styles.row}>
          <View style={[styles.detailCard, styles.col]}>
            <Text style={styles.detailLabel}>Peso aproximado</Text>
            <View style={styles.detailInputRow}>
              <Ionicons name="scale-outline" size={16} color={colors.primary} />
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={styles.detailInput}
                placeholder="5"
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.detailUnit}>kg</Text>
            </View>
          </View>
          <View style={[styles.detailCard, styles.col]}>
            <Text style={styles.detailLabel}>Distancia</Text>
            <View style={styles.detailInputRow}>
              <Ionicons name="speedometer-outline" size={16} color={colors.primary} />
              <Text style={styles.detailValue}>{distance.toFixed(2)} km</Text>
            </View>
            <Text style={styles.detailHint}>Automática</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Programación</Text>
        <Pressable
          onPress={() => setProgOpen(true)}
          style={({ pressed }) => [styles.progCard, pressed && styles.pressed]}
        >
          <View style={styles.progIcon}>
            <Ionicons name="calendar-clear-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.progBody}>
            <Text style={styles.progLabel}>Programar entrega</Text>
            <Text style={styles.progValue}>
              {fmtDateShort(date)} · {fmtTimeShort(time)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>

        <Text style={styles.sectionLabel}>Información adicional</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={17} color={colors.muted} />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción (opcional)"
              placeholderTextColor={colors.muted}
              style={styles.infoInput}
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="chatbox-ellipses-outline" size={17} color={colors.muted} />
            <TextInput
              value={observations}
              onChangeText={setObservations}
              placeholder="Observaciones (opcional)"
              placeholderTextColor={colors.muted}
              style={styles.infoInput}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.ctaBar}>
        <View style={styles.ctaInfo}>
          <Text style={styles.ctaSummary} numberOfLines={1}>
            {service} · {cargo} {size.toLowerCase()}
          </Text>
          <Text style={styles.ctaPrice}>{money(estimated)}</Text>
        </View>
        <Pressable onPress={handleContinue} style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}>
          <Text style={styles.ctaBtnText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.white} />
        </Pressable>
      </View>

      <SelectSheet
        visible={serviceOpen}
        title="Tipo de servicio"
        options={services}
        value={service}
        onSelect={(v) => {
          setService(v);
          setServiceOpen(false);
        }}
        onClose={() => setServiceOpen(false)}
      />

      <SelectSheet
        visible={cargoStep === "tipo"}
        title="¿Qué vas a enviar?"
        subtitle="Elige el tipo de carga"
        options={cargoTypes}
        value={cargo}
        onSelect={(v) => {
          setCargo(v);
          setCargoStep("tamano");
        }}
        onClose={() => setCargoStep(null)}
      />

      <SelectSheet
        visible={cargoStep === "tamano"}
        title="Tamaño"
        subtitle={cargo}
        options={sizes}
        value={size}
        onSelect={(v) => {
          setSize(v);
          setCargoStep(null);
        }}
        onClose={() => setCargoStep(null)}
      />

      <Modal
        visible={progOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProgOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.progSheet}>
            <View style={styles.progSheetHeader}>
              <Text style={styles.progSheetTitle}>Programar entrega</Text>
              <Pressable onPress={() => setProgOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowDate(true)}
              style={({ pressed }) => [styles.progOption, pressed && styles.pressed]}
            >
              <Ionicons name="calendar-outline" size={17} color={colors.primary} />
              <Text style={styles.progOptionLabel}>Fecha</Text>
              <Text style={styles.progOptionValue}>{fmtDateShort(date)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => setShowTime(true)}
              style={({ pressed }) => [styles.progOption, pressed && styles.pressed]}
            >
              <Ionicons name="time-outline" size={17} color={colors.primary} />
              <Text style={styles.progOptionLabel}>Hora</Text>
              <Text style={styles.progOptionValue}>{fmtTimeShort(time)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>

            {showDate ? (
              <View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={onChangeDate}
                />
                {Platform.OS === "ios" ? (
                  <Pressable style={styles.doneBtn} onPress={() => setShowDate(false)}>
                    <Text style={styles.doneText}>Listo</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {showTime ? (
              <View>
                <DateTimePicker value={time} mode="time" onChange={onChangeTime} />
                {Platform.OS === "ios" ? (
                  <Pressable style={styles.doneBtn} onPress={() => setShowTime(false)}>
                    <Text style={styles.doneText}>Listo</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  head: { marginBottom: 18 },
  title: { fontSize: 24, fontWeight: "900", color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 8,
  },
  swapBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  swapText: { fontSize: 12.5, fontWeight: "700", color: colors.primary },

  routeCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  routeGutter: { alignItems: "center", paddingVertical: 6, paddingLeft: 14 },
  gutterDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.white },
  gutterLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  routeFields: { flex: 1, paddingVertical: 4 },
  routeField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexShrink: 1,
  },
  routeValue: { flex: 1, fontSize: 15.5, fontWeight: "700", color: colors.text },
  routePlaceholder: { color: colors.muted, fontWeight: "600" },
  routeDivider: { height: 1, backgroundColor: colors.border, marginLeft: 14, marginRight: 8 },

  selectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  selectBody: { flex: 1 },
  selectLabel: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  selectValue: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },

  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    minHeight: 92,
  },
  detailLabel: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  detailInputRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10 },
  detailInput: { flex: 1, fontSize: 18, fontWeight: "800", color: colors.text, padding: 0 },
  detailUnit: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  detailValue: { flex: 1, fontSize: 18, fontWeight: "800", color: colors.text },
  detailHint: { fontSize: 11, color: colors.muted, marginTop: 6 },

  progCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  progIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progBody: { flex: 1 },
  progLabel: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  progValue: { fontSize: 15.5, fontWeight: "800", color: colors.text, marginTop: 2 },

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoInput: { flex: 1, fontSize: 14.5, color: colors.text, padding: 0 },
  infoDivider: { height: 1, backgroundColor: colors.border, marginLeft: 40, marginRight: 8 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: radius.md,
    padding: 12,
    marginTop: 16,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 13, fontWeight: "600" },
  pressed: { opacity: 0.75 },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  ctaInfo: { flex: 1 },
  ctaSummary: { fontSize: 12.5, color: colors.muted, fontWeight: "600" },
  ctaPrice: { fontSize: 21, fontWeight: "900", color: colors.primaryDark, marginTop: 1 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  ctaBtnText: { color: colors.white, fontSize: 15.5, fontWeight: "800" },

  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  progSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: 28,
  },
  progSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progSheetTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  progOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progOptionLabel: { flex: 1, fontSize: 14.5, fontWeight: "700", color: colors.text },
  progOptionValue: { fontSize: 14, fontWeight: "800", color: colors.primaryDark },
  doneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
  },
  doneText: { color: colors.primaryDark, fontWeight: "800" },
});