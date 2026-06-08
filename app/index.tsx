import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { gradients, font } from "@/constants/theme";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/(auth)/welcome"), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <Animated.View entering={ZoomIn.duration(700)}>
        <View style={styles.logoCard}>
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(300).duration(700)} style={styles.title}>
        MouldHealth
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(450).duration(700)} style={styles.tagline}>
        Smart mould inspection, simplified
      </Animated.Text>

      <Animated.View entering={FadeIn.delay(900).duration(800)} style={styles.footer}>
        <Text style={styles.footerText}>Emami Group · Maintenance</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  blobTop: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -90,
    right: -80,
  },
  blobBottom: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -40,
    left: -60,
  },
  logoCard: {
    width: 132,
    height: 132,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 104, height: 104 },
  title: { color: "#fff", fontSize: 34, fontWeight: font.black, marginTop: 26, letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.9)", fontSize: font.body, fontWeight: font.medium, marginTop: 8 },
  footer: { position: "absolute", bottom: 48 },
  footerText: { color: "rgba(255,255,255,0.85)", fontSize: font.sub, fontWeight: font.semibold, letterSpacing: 0.4 },
});
