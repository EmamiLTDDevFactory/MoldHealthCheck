import React, { ReactNode } from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radius, shadow } from "@/constants/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
  flat?: boolean;
};

/** White rounded card with a soft shadow. Optionally pressable (with haptics). */
export default function Card({ children, style, onPress, padded = true, flat }: Props) {
  const base = [
    styles.card,
    !flat && shadow.card,
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        style={base}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius._24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: 16 },
});
