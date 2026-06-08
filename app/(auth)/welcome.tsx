import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn, ZoomIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { colors, gradients, font, radius } from "@/constants/theme";
import GradientButton from "@/components/ui/GradientButton";

const FEATURES = [
  { Icon: Icons.ClipboardText, title: "Guided checklists", sub: "Every mould subsystem, step by step" },
  { Icon: Icons.SealCheck, title: "Track approvals", sub: "See submissions & status in real time" },
  { Icon: Icons.DeviceMobile, title: "Built for the floor", sub: "Fast, offline-friendly, on your phone" },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* HERO */}
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <Animated.View entering={ZoomIn.duration(700)} style={[styles.logoCard, { marginTop: insets.top + 30 }]}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(700)} style={styles.heroTitle}>
          MouldHealth
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(320).duration(700)} style={styles.heroSub}>
          The smart way to inspect & maintain your moulds
        </Animated.Text>
      </LinearGradient>

      {/* CONTENT */}
      <View style={styles.body}>
        <Animated.Text entering={FadeInDown.delay(400).duration(700)} style={styles.headline}>
          Everything your mould{"\n"}inspection needs 👋
        </Animated.Text>

        <View style={{ marginTop: 22, gap: 14 }}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.title}
              entering={FadeInDown.delay(520 + i * 120).duration(700)}
              style={styles.featureRow}
            >
              <View style={styles.featureIcon}>
                <f.Icon size={24} color={colors.brand} weight="duotone" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <Animated.View
        entering={FadeIn.delay(900).duration(700)}
        style={[styles.cta, { paddingBottom: insets.bottom + 18 }]}
      >
        <GradientButton
          title="Get Started"
          icon={<Icons.ArrowRight size={20} color="#fff" weight="bold" />}
          onPress={() => router.push("/(auth)/login")}
        />
        <Pressable style={styles.signupRow} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.signupText}>New vendor? </Text>
          <Text style={styles.signupLink}>Create an account</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    alignItems: "center",
    paddingBottom: 36,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  blob1: { position: "absolute", width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", top: -60, right: -50 },
  blob2: { position: "absolute", width: 160, height: 160, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", bottom: -30, left: -40 },
  logoCard: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 78, height: 78 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: font.black, marginTop: 16, letterSpacing: -0.5 },
  heroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: font.body,
    fontWeight: font.medium,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 21,
  },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 26 },
  headline: { fontSize: 24, fontWeight: font.black, color: colors.ink, lineHeight: 31, letterSpacing: -0.4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: radius._17,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: font.title, fontWeight: font.bold, color: colors.ink },
  featureSub: { fontSize: font.sub, color: colors.textMuted, marginTop: 2 },
  cta: { paddingHorizontal: 22, paddingTop: 8 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  signupText: { color: colors.textMuted, fontSize: font.body, fontWeight: font.medium },
  signupLink: { color: colors.brand, fontSize: font.body, fontWeight: font.bold },
});
