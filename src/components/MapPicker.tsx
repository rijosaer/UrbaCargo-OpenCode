import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import type { LatLng } from "@/data/shipments";
import { colors, radius } from "@/theme";
import { CONCEPCION, getCurrentPosition } from "@/utils/geo";

interface MapPickerProps {
  visible: boolean;
  initialCenter?: LatLng | null;
  title: string;
  onCancel: () => void;
  onConfirm: (coord: LatLng) => void;
}

const buildHtml = (center: LatLng) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e5e7eb; }
  .pin { background: #DC2626; width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
         transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.4); }
  .badge { position: absolute; z-index: 999; left: 50%; top: 12px; transform: translateX(-50%);
           background: rgba(17,24,39,.85); color: #fff; border-radius: 999px; padding: 6px 12px;
           font: 600 12px -apple-system, Roboto, sans-serif; white-space: nowrap; }
</style>
</head>
<body>
<div id="map"></div>
<div class="badge">Toca el mapa para ubicar el destino</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var center = ${JSON.stringify([center.latitude, center.longitude])};
  var map = L.map('map', { zoomControl: false, attributionControl: true }).setView(center, 14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  var marker = null;
  function post(lat, lng) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
    }
  }
  function place(lat, lng) {
    if (!marker) {
      marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [30, 30], iconAnchor: [15, 30] })
      }).addTo(map);
      marker.on('dragend', function () {
        var p = marker.getLatLng();
        post(p.lat, p.lng);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
  }
  map.on('click', function (e) { place(e.latlng.lat, e.latlng.lng); post(e.latlng.lat, e.latlng.lng); });
  window.setView = function (lat, lng, zoom) { map.setView([lat, lng], zoom || 15); };
  window.setMarker = function (lat, lng) { place(lat, lng); };
  true;
</script>
</body>
</html>`;

export function MapPicker({ visible, initialCenter, title, onCancel, onConfirm }: MapPickerProps) {
  const ref = useRef<WebView>(null);
  const [picked, setPicked] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const center = initialCenter ?? CONCEPCION;

  const html = useMemo(() => buildHtml(center), [center.latitude, center.longitude]);

  useEffect(() => {
    if (visible) setPicked(null);
  }, [visible]);

  const locate = async () => {
    setLocating(true);
    const pos = await getCurrentPosition();
    setLocating(false);
    if (pos) {
      setPicked(pos);
      ref.current?.injectJavaScript(
        `window.setView(${pos.latitude}, ${pos.longitude}, 16); window.setMarker(${pos.latitude}, ${pos.longitude}); true;`
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.mapWrap}>
          <WebView
            ref={ref}
            source={{ html }}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            geolocationEnabled
            scrollEnabled={false}
            style={styles.web}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (Number.isFinite(data.lat) && Number.isFinite(data.lng)) {
                  setPicked({ latitude: data.lat, longitude: data.lng });
                }
              } catch {
                // mensaje no válido
              }
            }}
          />

          <Pressable onPress={locate} style={styles.locateBtn}>
            {locating ? (
              <ActivityIndicator size="small" color={colors.primaryDark} />
            ) : (
              <Ionicons name="locate" size={20} color={colors.primaryDark} />
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.coord}>
            {picked
              ? `${picked.latitude.toFixed(5)}, ${picked.longitude.toFixed(5)}`
              : "Sin punto seleccionado"}
          </Text>
          <Pressable
            onPress={() => picked && onConfirm(picked)}
            disabled={!picked}
            style={({ pressed }) => [
              styles.confirmBtn,
              !picked && styles.confirmDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="checkmark" size={18} color={colors.white} />
            <Text style={styles.confirmText}>Confirmar ubicación</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  mapWrap: { flex: 1 },
  web: { flex: 1, backgroundColor: "#e5e7eb" },
  locateBtn: {
    position: "absolute",
    right: 14,
    bottom: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  footer: { padding: 16, gap: 10 },
  coord: { fontSize: 12.5, color: colors.muted, textAlign: "center" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  confirmDisabled: { backgroundColor: colors.border },
  pressed: { opacity: 0.75 },
  confirmText: { color: colors.white, fontSize: 15.5, fontWeight: "800" },
});
