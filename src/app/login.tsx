import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { users, type UserType } from "@/data/users";
import { colors, radius } from "@/theme";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginWith } = useApp();

  const [role, setRole] = useState<UserType>("Particular");
  const [email, setEmail] = useState("cliente@test.com");
  const [password, setPassword] = useState("123456");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const selectRole = (next: UserType) => {
    setRole(next);
    setError("");
    const demo = users.find((u) => u.type === next);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const handleLogin = () => {
    const ok = login(email, password);
    if (!ok) {
      setError("Credenciales incorrectas. Revisa el correo y la contraseña.");
      return;
    }
    setError("");
    router.replace("/(tabs)");
  };

  const handleGoogle = () => {
    setError("");
    loginWith({
      type: "Particular",
      name: "María Pérez",
      email: "maria.perez@gmail.com",
      location: "Barrio Centro, Concepción",
    });
    router.replace("/(tabs)");
  };

  const handleGuest = () => {
    setError("");
    loginWith({
      type: "Particular",
      name: "Invitado",
      email: "invitado@urbacargo.app",
      location: "Concepción",
    });
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="truck-fast" size={38} color={colors.white} />
          </View>
          <Text style={styles.brand}>UrbaCargo</Text>
          <Text style={styles.slogan}>Mensajería exprés y micro-logística sostenible</Text>
        </View>

        <View style={styles.segment}>
          {(["Particular", "Empresa"] as UserType[]).map((t) => {
            const active = role === t;
            return (
              <Pressable
                key={t}
                onPress={() => selectRole(t)}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                <Ionicons
                  name={t === "Particular" ? "person" : "business"}
                  size={16}
                  color={active ? colors.white : colors.muted}
                />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Correo</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="correo@test.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry={!showPass}
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={handleGoogle}
          style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
        >
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.googleText}>Continuar con Google</Text>
        </Pressable>

        <Pressable
          onPress={handleGuest}
          style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}
        >
          <Ionicons name="person-circle-outline" size={19} color={colors.primaryDark} />
          <Text style={styles.guestText}>Entrar como invitado</Text>
        </Pressable>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Datos de prueba</Text>
          <Text style={styles.hintText}>Particular · cliente@test.com / 123456</Text>
          <Text style={styles.hintText}>Empresa · empresa@test.com / 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 28, fontWeight: "900", color: colors.text, marginTop: 14 },
  slogan: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13.5, fontWeight: "700", color: colors.muted },
  segmentTextActive: { color: colors.white },
  label: { fontSize: 13, fontWeight: "700", color: colors.subtle, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 13, fontWeight: "600" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    marginTop: 4,
  },
  pressed: { opacity: 0.75 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: 14,
  },
  googleText: { fontSize: 15, fontWeight: "700", color: colors.text },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.md,
    marginTop: 10,
  },
  guestText: { fontSize: 14.5, fontWeight: "700", color: colors.primaryDark },
  hint: {
    marginTop: 22,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    gap: 3,
  },
  hintTitle: { fontSize: 12.5, fontWeight: "800", color: colors.primaryDark },
  hintText: { fontSize: 12, color: colors.subtle },
});
