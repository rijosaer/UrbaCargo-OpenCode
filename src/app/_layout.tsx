import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/context/AppContext";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.primaryDark,
            headerTitleStyle: { fontWeight: "800" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="nuevo-envio" options={{ title: "Nuevo envío" }} />
          <Stack.Screen name="empresas" options={{ title: "Empresas disponibles" }} />
          <Stack.Screen name="resumen-envio" options={{ title: "Resumen del envío" }} />
          <Stack.Screen name="seguimiento/[id]" options={{ title: "Seguimiento GPS" }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Acerca de UrbaCargo" }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
