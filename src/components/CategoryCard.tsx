import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import type { Category } from "@/data/companies";
import { colors, radius } from "@/theme";

interface CategoryCardProps {
  category: Category;
  onPress: (title: string) => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={() => onPress(category.title)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons
        name={category.icon as never}
        size={24}
        color={category.color}
      />
      <Text style={styles.title} numberOfLines={2}>
        {category.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
    minHeight: 96,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.65 },
  title: { fontSize: 13, fontWeight: "700", color: colors.text },
});
