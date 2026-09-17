import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { MapPicker } from "@/components/MapPicker";
import type { Place } from "@/data/companies";
import type { LatLng } from "@/data/shipments";
import { colors, radius } from "@/theme";
import { getCurrentPosition, reverseGeocode } from "@/utils/geo";

interface PlacePickerProps {
  value: string;
  onChange: (value: string, coord?: LatLng) => void;
  places: Place[];
  title: string;
  icon: string;
  initialCenter?: LatLng | null;
  renderTrigger?: (open: () => void) => ReactNode;
}

export function PlacePicker({
  value,
  onChange,
  places,
  title,
  icon,
  initialCenter,
  renderTrigger,
}: PlacePickerProps) {
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [working, setWorking] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter(
      (p) => p.name.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q)
    );
  }, [query, places]);

  const select = (place: Place) => {
    onChange(place.name, place.coord);
    setOpen(false);
    setQuery("");
  };

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const useLocation = async () => {
    setWorking(true);
    const pos = await getCurrentPosition();
    if (!pos) {
      setWorking(false);
      Alert.alert(
        "Ubicación no disponible",
        "Activa el GPS y concede el permiso de ubicación para usar esta función."
      );
      return;
    }
    const label = await reverseGeocode(pos);
    setWorking(false);
    onChange(label, pos);
    close();
  };

  const confirmMap = async (coord: LatLng) => {
    setMapOpen(false);
    setWorking(true);
    const label = await reverseGeocode(coord);
    setWorking(false);
    onChange(label, coord);
    close();
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.field, pressed && styles.pressed]}
        >
          <Ionicons name={icon as never} size={18} color={colors.muted} />
          <Text style={[styles.fieldText, !value && styles.placeholder]} numberOfLines={1}>
            {value || title}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.muted} />
        </Pressable>
      )}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={close} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.search}>
              <Ionicons name="search" size={17} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar barrio o sector"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>

            <Pressable
              onPress={() => {
                setMapOpen(true);
              }}
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            >
              <Ionicons name="map" size={17} color={colors.primary} />
              <Text style={styles.actionText}>Elegir en el mapa</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={useLocation}
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            >
              {working ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="navigate" size={17} color={colors.primary} />
              )}
              <Text style={styles.actionText}>Usar mi ubicación actual</Text>
            </Pressable>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Ionicons name="location-outline" size={17} color={colors.primary} />
                  <View style={styles.optionBody}>
                    <Text style={styles.optionTitle}>{item.name}</Text>
                    <Text style={styles.optionZone}>{item.zone}</Text>
                  </View>
                  {item.name === value ? (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Sin resultados.</Text>}
            />
          </View>
        </View>
      </Modal>

      <MapPicker
        visible={mapOpen}
        initialCenter={initialCenter}
        title={`Elegir ${title.toLowerCase()} en el mapa`}
        onCancel={() => setMapOpen(false)}
        onConfirm={confirmMap}
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  fieldText: { flex: 1, fontSize: 14.5, color: colors.text },
  placeholder: { color: colors.muted },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.text },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.primary },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionBody: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  optionZone: { fontSize: 12, color: colors.muted, marginTop: 1 },
  empty: { textAlign: "center", color: colors.muted, paddingVertical: 24 },
});
