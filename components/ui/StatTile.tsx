import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, font, shadow } from "@/constants/theme";

type Props = {
  value: string | number;
  label: string;
  icon?: ReactNode;
  tint?: string;
  tintBg?: string;
  style?: ViewStyle;
};

/** Small KPI tile — number + label + tinted icon chip. */
export default function StatTile({ value, label, icon, tint = colors.brand, tintBg = colors.brandSoft, style }: Props) {
  return (
    <View style={[styles.card, shadow.soft, style]}>
      {!!icon && (
        <View style={[styles.iconChip, { backgroundColor: tintBg }]}>{icon}</View>
      )}
      <Text style={[styles.value, { color: colors.ink }]}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius._20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: { fontSize: 24, fontWeight: font.black, letterSpacing: -0.5 },
  label: { fontSize: font.caption, color: colors.textMuted, fontWeight: font.medium, marginTop: 2 },
});
