import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import type { LatLng } from "@/data/shipments";

interface LeafletMapProps {
  origin: LatLng;
  destination: LatLng;
  progress: number;
  vehicleIcon: string;
  originLabel: string;
  destinationLabel: string;
  follow?: boolean;
}

const emojiFor: Record<string, string> = {
  motorbike: "🛵",
  bicycle: "🚲",
  "truck-fast": "🚚",
};

const buildHtml = (
  origin: LatLng,
  destination: LatLng,
  vehicleIcon: string,
  originLabel: string,
  destinationLabel: string,
  follow: boolean
) => {
  const o = [origin.latitude, origin.longitude];
  const d = [destination.latitude, destination.longitude];
  const emoji = emojiFor[vehicleIcon] ?? "📦";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e5e7eb; }
  .veh { background: #15803D; width: 36px; height: 36px; border-radius: 50%; display: flex;
         align-items: center; justify-content: center; font-size: 18px; border: 3px solid #fff;
         box-shadow: 0 2px 6px rgba(0,0,0,.4); }
  .tag { background: rgba(255,255,255,.95); border-radius: 6px; padding: 2px 7px;
         font: 700 11px -apple-system, Roboto, sans-serif; color: #374151;
         box-shadow: 0 1px 3px rgba(0,0,0,.2); white-space: nowrap; }
  .badge { position: absolute; z-index: 999; left: 10px; top: 10px; background: rgba(255,255,255,.94);
           border-radius: 8px; padding: 5px 9px; font: 700 11px -apple-system, Roboto, sans-serif;
           color: #15803D; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
</style>
</head>
<body>
<div id="map"></div>
<div class="badge" id="badge">Calculando ruta por calles…</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var origin = ${JSON.stringify(o)};
  var dest = ${JSON.stringify(d)};
  var follow = ${follow ? "true" : "false"};
  var map = L.map('map', { zoomControl: false, attributionControl: true })
    .fitBounds([origin, dest], { padding: [40, 40] });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  function circle(latlng, color) {
    return L.circleMarker(latlng, { radius: 8, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 });
  }
  circle(origin, '#16A34A').addTo(map).bindPopup(${JSON.stringify(originLabel)});
  circle(dest, '#DC2626').addTo(map).bindPopup(${JSON.stringify(destinationLabel)});
  L.marker(origin, { icon: L.divIcon({ className: '', html: '<div class="tag">Origen</div>', iconSize: [0, 0] }), interactive: false }).addTo(map);
  L.marker(dest, { icon: L.divIcon({ className: '', html: '<div class="tag">Destino</div>', iconSize: [0, 0] }), interactive: false }).addTo(map);

  var casing = L.polyline([origin, dest], { color: '#166534', weight: 9, opacity: 0.35 }).addTo(map);
  var line = L.polyline([origin, dest], { color: '#22C55E', weight: 5, opacity: 0.95 }).addTo(map);
  var vehicleMarker = L.marker(origin, {
    icon: L.divIcon({ className: '', html: '<div class="veh">${emoji}</div>', iconSize: [36, 36], iconAnchor: [18, 18] })
  }).addTo(map);

  var coords = [origin, dest];
  var cum = [0, 0];
  var total = 0;
  var pending = 0;

  function recompute() {
    cum = [0];
    total = 0;
    for (var i = 1; i < coords.length; i++) {
      total += map.distance(coords[i - 1], coords[i]);
      cum.push(total);
    }
  }
  function posAt(f) {
    if (total <= 0) return origin;
    var dist = Math.max(0, Math.min(1, f)) * total;
    var i = 1;
    while (i < cum.length - 1 && cum[i] < dist) i++;
    var a = coords[i - 1], b = coords[i];
    var seg = (cum[i] - cum[i - 1]) || 1;
    var t = (dist - cum[i - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  window.setProgress = function (f) {
    pending = f;
    var ll = posAt(f);
    vehicleMarker.setLatLng(ll);
    if (follow && total > 0) map.panTo(ll, { animate: true, duration: 0.6 });
  };
  recompute();

  var url = 'https://router.project-osrm.org/route/v1/driving/' +
    origin[1] + ',' + origin[0] + ';' + dest[1] + ',' + dest[0] +
    '?overview=full&geometries=geojson';
  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (j && j.routes && j.routes[0] && j.routes[0].geometry) {
        coords = j.routes[0].geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
        casing.setLatLngs(coords);
        line.setLatLngs(coords);
        recompute();
        map.fitBounds(line.getBounds(), { padding: [44, 44] });
        document.getElementById('badge').innerHTML =
          'Ruta real por calles · ' + (j.routes[0].distance / 1000).toFixed(1) + ' km';
        window.setProgress(pending);
      } else {
        document.getElementById('badge').innerHTML = 'Ruta aproximada (sin conexión)';
      }
    })
    .catch(function () {
      document.getElementById('badge').innerHTML = 'Ruta aproximada (sin conexión)';
    });
  true;
</script>
</body>
</html>`;
};

export function LeafletMap({
  origin,
  destination,
  progress,
  vehicleIcon,
  originLabel,
  destinationLabel,
  follow = true,
}: LeafletMapProps) {
  const ref = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const html = useMemo(
    () => buildHtml(origin, destination, vehicleIcon, originLabel, destinationLabel, follow),
    [origin, destination, vehicleIcon, originLabel, destinationLabel, follow]
  );

  useEffect(() => {
    ref.current?.injectJavaScript(
      `window.setProgress && window.setProgress(${progress}); true;`
    );
  }, [progress]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={ref}
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.web}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#e5e7eb" },
  web: { flex: 1, backgroundColor: "transparent" },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
});
