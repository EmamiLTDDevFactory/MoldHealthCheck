import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/config";
import { colors, gradients, font } from "@/constants/theme";
import Field from "@/components/ui/Field";
import GradientButton from "@/components/ui/GradientButton";
import AppHeader from "@/components/ui/AppHeader";

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Login", "Please enter your email address.");
      return;
    }
    setLoading(true);
    console.log("Attempting login with email:", email);
    try {
      const { data } = await api.get("/login", { params: { Email: email } });
      if (data?.user?.Email?.toLowerCase() === email.trim().toLowerCase()) {
        setUser(data.user);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "We couldn't find an account for that email.");
      }
    } catch (e) {
      Alert.alert("Login Failed", "Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* HERO HEADER */}
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.blob} />
        <View style={{ paddingTop: insets.top }}>
          <AppHeader back light />
        </View>
        <Animated.View entering={ZoomIn.duration(600)} style={styles.logoCard}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150).duration(600)} style={styles.title}>
          Welcome back 👋
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.subtitle}>
          Sign in to continue your inspections
        </Animated.Text>
      </LinearGradient>

      {/* FORM */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ gap: 16 }}>
            <Field
              label="Email"
              placeholder="you@emami.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              icon={<Icons.At size={22} color={colors.brand} weight="bold" />}
            />
            <Field
              label="Password"
              placeholder="Enter your password"
              password
              value={password}
              onChangeText={setPassword}
              icon={<Icons.Lock size={22} color={colors.brand} weight="bold" />}
            />

            <View style={{ marginTop: 6 }}>
              <GradientButton
                title="Login"
                loading={loading}
                onPress={handleLogin}
                icon={<Icons.SignIn size={20} color="#fff" weight="bold" />}
              />
            </View>
          </Animated.View>

          <Pressable style={styles.footer} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerText}>New to MouldHealth? </Text>
            <Text style={styles.footerLink}>Create an account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingBottom: 34,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: "center",
    overflow: "hidden",
  },
  blob: { position: "absolute", width: 200, height: 200, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", top: -70, right: -50 },
  logoCard: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  logo: { width: 60, height: 60 },
  title: { color: "#fff", fontSize: 24, fontWeight: font.black, marginTop: 14 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: font.body, fontWeight: font.medium, marginTop: 6 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 26 },
  footerText: { color: colors.textMuted, fontSize: font.body, fontWeight: font.medium },
  footerLink: { color: colors.brand, fontSize: font.body, fontWeight: font.bold },
});
