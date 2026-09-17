import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius } from "@/theme";

interface SelectSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: readonly string[];
  value?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectSheet({
  visible,
  title,
  subtitle,
  options,
  value,
  onSelect,
  onClose,
}: SelectSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView style={styles.list} bounces={false}>
            {options.map((o) => {
              const active = o === value;
              return (
                <Pressable
                  key={o}
                  onPress={() => onSelect(o)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionText, active && styles.optionActive]}>{o}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingTop: 16,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  list: { flexGrow: 0 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  optionText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  optionActive: { color: colors.primary, fontWeight: "800" },
});