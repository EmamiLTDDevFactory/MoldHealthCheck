import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";

import { api } from "@/lib/config";
import { colors, gradients, font } from "@/constants/theme";
import Field from "@/components/ui/Field";
import GradientButton from "@/components/ui/GradientButton";
import AppHeader from "@/components/ui/AppHeader";

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please complete all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/register", {
        ZmUser: name.trim(),
        ZmEmail: email.trim(),
        ZmPass: password,
      });
      if (data?.data || data?.success) {
        Alert.alert("Account created", "Your account is ready. Please sign in.", [
          { text: "Sign In", onPress: () => router.replace("/(auth)/login") },
        ]);
      } else {
        Alert.alert("Registration Failed", "Please try again.");
      }
    } catch (e) {
      Alert.alert("Registration Failed", "Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.blob} />
        <View style={{ paddingTop: insets.top }}>
          <AppHeader back light />
        </View>
        <Animated.View entering={ZoomIn.duration(600)} style={styles.logoCard}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150).duration(600)} style={styles.title}>
          Create your account
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.subtitle}>
          Join the smart mould-care network
        </Animated.Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ gap: 16 }}>
            <Field
              label="Full name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              icon={<Icons.User size={22} color={colors.brand} weight="bold" />}
            />
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
              placeholder="Create a password"
              password
              value={password}
              onChangeText={setPassword}
              icon={<Icons.Lock size={22} color={colors.brand} weight="bold" />}
            />

            <View style={{ marginTop: 6 }}>
              <GradientButton
                title="Create Account"
                loading={loading}
                onPress={handleRegister}
                icon={<Icons.UserPlus size={20} color="#fff" weight="bold" />}
              />
            </View>
          </Animated.View>

          <Pressable style={styles.footer} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.footerText}>Already registered? </Text>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: "center",
    overflow: "hidden",
  },
  blob: { position: "absolute", width: 200, height: 200, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", top: -70, right: -50 },
  logoCard: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  logo: { width: 54, height: 54 },
  title: { color: "#fff", fontSize: 23, fontWeight: font.black, marginTop: 12 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: font.body, fontWeight: font.medium, marginTop: 6 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: colors.textMuted, fontSize: font.body, fontWeight: font.medium },
  footerLink: { color: colors.brand, fontSize: font.body, fontWeight: font.bold },
});
