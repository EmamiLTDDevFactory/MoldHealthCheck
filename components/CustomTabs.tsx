import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { colors, font, shadow } from "@/constants/theme";

type TabMeta = { label: string; Icon: Icons.Icon };

const TABS: Record<string, TabMeta> = {
  index: { label: "Home", Icon: Icons.House },
  statistics: { label: "Insights", Icon: Icons.ChartLineUp },
  profile: { label: "Profile", Icon: Icons.UserCircle },
};

function TabItem({
  meta,
  focused,
  onPress,
}: {
  meta: TabMeta;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, { damping: 14, stiffness: 160 });
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const { Icon } = meta;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.iconWrap, focused && styles.iconWrapActive, animStyle]}>
        <Icon
          size={24}
          weight={focused ? "fill" : "regular"}
          color={focused ? colors.brand : colors.textFaint}
        />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? colors.brand : colors.textFaint }]}>
        {meta.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CustomTabs({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, shadow.floating, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === index;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return <TabItem key={route.key} meta={meta} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  iconWrap: {
    width: 52,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: colors.brandSoft },
  label: { fontSize: font.micro, fontWeight: font.bold },
});
