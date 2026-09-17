import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";

import type { LatLng } from "@/data/shipments";
import { colors } from "@/theme";

interface RouteMapFallbackProps {
  route: LatLng[];
  vehicle: string;
  progress: number;
  originLabel: string;
  destinationLabel: string;
}

const PAD = 38;

export function RouteMapFallback({
  route,
  vehicle,
  progress,
  originLabel,
  destinationLabel,
}: RouteMapFallbackProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const lats = route.map((p) => p.latitude);
  const lngs = route.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;

  const toXY = (p: LatLng) => ({
    x: PAD + ((p.longitude - minLng) / spanLng) * (Math.max(size.w, 1) - PAD * 2),
    y: PAD + ((maxLat - p.latitude) / spanLat) * (Math.max(size.h, 1) - PAD * 2),
  });

  const points = route.map(toXY);
  const vehicleIdx = Math.max(0, Math.min(progress, points.length - 1));
  const vehicleXY = points[vehicleIdx] ?? { x: 0, y: 0 };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={[styles.gridLine, { top: "25%" }]} />
      <View style={[styles.gridLine, { top: "50%" }]} />
      <View style={[styles.gridLine, { top: "75%" }]} />
      <View style={[styles.gridLineV, { left: "25%" }]} />
      <View style={[styles.gridLineV, { left: "50%" }]} />
      <View style={[styles.gridLineV, { left: "75%" }]} />

      {size.w > 0
        ? points.slice(0, -1).map((p, i) => {
            const q = points[i + 1];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const len = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);
            const midX = (p.x + q.x) / 2;
            const midY = (p.y + q.y) / 2;
            const done = i < vehicleIdx;
            return (
              <View
                key={`seg-${i}`}
                style={[
                  styles.segment,
                  {
                    left: midX - len / 2,
                    top: midY - 2,
                    width: len,
                    backgroundColor: done ? colors.primary : "#BBF7D0",
                    transform: [{ rotateZ: `${angle}rad` }],
                  },
                ]}
              />
            );
          })
        : null}

      {size.w > 0
        ? points.map((p, i) => (
            <View key={`dot-${i}`} style={[styles.dot, { left: p.x - 2.5, top: p.y - 2.5 }]} />
          ))
        : null}

      {size.w > 0 ? (
        <>
          <View
            style={[
              styles.pin,
              { left: points[0].x - 10, top: points[0].y - 10, backgroundColor: colors.primary },
            ]}
          />
          <View
            style={[
              styles.pin,
              {
                left: points[points.length - 1].x - 10,
                top: points[points.length - 1].y - 10,
                backgroundColor: colors.danger,
              },
            ]}
          />
          <View style={[styles.vehicle, { left: vehicleXY.x - 18, top: vehicleXY.y - 18 }]}>
            <MaterialCommunityIcons name={vehicle as never} size={18} color={colors.white} />
          </View>

          <View style={[styles.tag, { left: points[0].x - 20, top: points[0].y + 12 }]}>
            <Text style={styles.tagText} numberOfLines={1}>
              {originLabel}
            </Text>
          </View>
          <View
            style={[
              styles.tag,
              {
                left: points[points.length - 1].x - 20,
                top: points[points.length - 1].y + 12,
              },
            ]}
          >
            <Text style={styles.tagText} numberOfLines={1}>
              {destinationLabel}
            </Text>
          </View>
        </>
      ) : null}

      <View style={styles.caption}>
        <Text style={styles.captionText}>Mapa simulado · ruta y repartidor en vivo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "#E2E8F0" },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#E2E8F0" },
  segment: { position: "absolute", height: 4, borderRadius: 2 },
  dot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pin: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
  },
  vehicle: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  tag: {
    position: "absolute",
    maxWidth: 130,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10.5, fontWeight: "700", color: colors.subtle },
  caption: {
    position: "absolute",
    left: 10,
    bottom: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  captionText: { fontSize: 10, color: colors.muted, fontWeight: "600" },
});
