import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, font, shadow } from "@/constants/theme";

type Props = {
  value: string | number;
  label: string;
  icon?: ReactNode;
  tint?: string;
  tintBg?: string;
  footerText?: string;
  style?: ViewStyle;
};

/** Small KPI tile — materialized design. */
export default function StatTile({ value, label, icon, tint = colors.brand, tintBg = colors.brandSoft, footerText, style }: Props) {
  return (
    <View style={[styles.card, shadow.card, style]}>
      {!!icon && (
        <View style={[styles.iconChip, { backgroundColor: tint, shadowColor: tint }]}>
          {icon}
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Text style={[styles.value, { color: colors.ink }]}>{value}</Text>
      </View>
      
      {!!footerText && (
        <>
          <View style={styles.divider} />
          <Text style={styles.footerText}>{footerText}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius._15,
    padding: 16,
    paddingTop: 12,
    marginTop: 24, // space for floating icon
    minHeight: 110,
    overflow: 'visible',
    position: 'relative',
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: 'absolute',
    top: -16,
    left: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'flex-end',
  },
  label: { 
    fontSize: font.sub, 
    color: colors.textMuted, 
    fontWeight: font.medium,
  },
  value: { 
    fontSize: 26, 
    fontWeight: font.black, 
    letterSpacing: -0.5,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(236, 236, 241, 0.8)',
    marginTop: 16,
    marginBottom: 12,
  },
  footerText: {
    fontSize: font.micro,
    color: colors.textFaint,
    fontWeight: font.medium,
  }
});
