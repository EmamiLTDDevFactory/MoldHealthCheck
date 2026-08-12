import GradientButton from "@/components/ui/GradientButton";
import { colors, font, gradients, radius, shadow } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Icons from "phosphor-react-native";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LOGO_BASE64 = 'data:image/png;base64,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';

const FEATURES = [
  { Icon: Icons.ClipboardText, title: "Guided checklists", sub: "Every mould subsystem, step by step" },
  { Icon: Icons.SealCheck, title: "Track approvals", sub: "See submissions & status in real time" },
  { Icon: Icons.DeviceMobile, title: "Built for the floor", sub: "Fast, user-friendly, on your phone" },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={[styles.root, styles.webRoot]}>
        <StatusBar style="light" />
        
        {/* Lighter Background Gradient */}
        <LinearGradient 
          colors={['#f8fafc', '#e2e8f0', '#f1f5f9']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={StyleSheet.absoluteFill} 
        />
        
        {/* CSS for 3D Blob Animations */}
        <style>
          {`
            @keyframes float1 {
              0% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(150px, 100px) scale(1.2); }
              66% { transform: translate(-50px, 200px) scale(0.9); }
              100% { transform: translate(0, 0) scale(1); }
            }
            @keyframes float2 {
              0% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(-150px, -150px) scale(1.1); }
              66% { transform: translate(150px, -50px) scale(0.8); }
              100% { transform: translate(0, 0) scale(1); }
            }
          `}
        </style>

        {/* Animated Background Blobs for 3D depth feel */}
        <Animated.View style={styles.webBgBlob1} />
        <Animated.View style={styles.webBgBlob2} />

        <View style={styles.webModalContainer}>
          {/* Glassmorphism Orange Card */}
          <LinearGradient 
            colors={['rgba(255, 150, 60, 0.75)', 'rgba(255, 90, 70, 0.8)']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.webModalCard}
          >
            
            {/* Logo in White Pill */}
            <View style={styles.webLogoPill}>
              <Image source={{ uri: LOGO_BASE64 }} style={styles.webLogo} resizeMode="contain" />
            </View>

            <Animated.Text entering={FadeInDown.delay(200).duration(700)} style={styles.webHeroTitle}>
              MouldHealth Inspection Portal
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(320).duration(700)} style={styles.webHeroSub}>
              The smart way to inspect & maintain your moulds
            </Animated.Text>

            <View style={styles.webFeaturesContainer}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.title}
                  entering={FadeInDown.delay(520 + i * 120).duration(700)}
                  style={styles.webFeatureRow}
                >
                  <View style={styles.webFeatureIcon}>
                    <f.Icon size={20} color={colors.brand} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.webFeatureTitle}>{f.title}</Text>
                    <Text style={styles.webFeatureSub}>{f.sub}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={FadeIn.delay(900).duration(700)} style={styles.webCta}>
              <GradientButton
                title="Get Started"
                icon={<Icons.ArrowRight size={20} color="#fff" weight="bold" />}
                onPress={() => router.push("/mouldhealthcheck/(auth)/login")}
              />
              <Pressable style={styles.webSignupRow} onPress={() => router.push("/mouldhealthcheck/(auth)/register")}>
                {/* <Text style={styles.webSignupText}>New vendor? </Text>
                <Text style={styles.webSignupLink}>Create an account</Text> */}
              </Pressable>
            </Animated.View>
          </LinearGradient>
          
          <Text style={styles.webFooterText}>© 2026 Mold Inspection Portal - Emami Limited. All rights reserved.</Text>
        </View>
      </View>
    );
  }

  // MOBILE LAYOUT
  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* HERO */}
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <Animated.View entering={ZoomIn.duration(700)} style={[styles.logoCard, { marginTop: insets.top + 30 }]}>
          <Image source={{ uri: LOGO_BASE64 }} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(700)} style={styles.heroTitle}>
          MouldHealth Inspection Portal
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
          onPress={() => router.push("/mouldhealthcheck/(auth)/login")}
        />
        <Pressable style={styles.signupRow} onPress={() => router.push("/mouldhealthcheck/(auth)/register")}>
          {/* <Text style={styles.signupText}>New vendor? </Text>
          <Text style={styles.signupLink}>Create an account</Text> */}
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
    backgroundColor: "transparent",
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

  // WEB STYLES
  // @ts-ignore
  webRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8fafc', // Lighter fallback
    overflow: 'hidden',
  },
  // @ts-ignore
  // @ts-ignore
  webBgBlob1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(236, 72, 153, 0.35)', // Vibrant Pink for light background
    top: '10%',
    left: '10%',
    filter: 'blur(100px)' as any,
    animation: 'float1 18s infinite ease-in-out' as any,
  } as any,
  // @ts-ignore
  webBgBlob2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(59, 130, 246, 0.35)', // Vibrant Blue for light background
    bottom: '10%',
    right: '10%',
    filter: 'blur(100px)' as any,
    animation: 'float2 22s infinite ease-in-out' as any,
  } as any,
  webModalContainer: {
    alignItems: "center",
  },
  // @ts-ignore
  webModalCard: {
    width: 440,
    maxWidth: "90%",
    padding: 32,
    borderRadius: radius._24 || 24,
    alignItems: "center",
    backdropFilter: 'blur(24px)' as any, // Glass theme
    WebkitBackdropFilter: 'blur(24px)' as any,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    ...(shadow.card || { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }),
  } as any,
  webLogoPill: {
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius._15 || 16,
    marginBottom: 20,
  },
  webLogo: {
    width: 100,
    height: 100,
  },
  webHeroTitle: {
    color: "#fff",
    fontSize: font.title * 1.2,
    fontWeight: font.black,
    marginBottom: 8,
    textAlign: "center",
  },
  webHeroSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: font.sub,
    fontWeight: font.medium,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  webFeaturesContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  webFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: radius._15 || 16,
  },
  webFeatureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  webFeatureTitle: {
    fontSize: font.body,
    fontWeight: font.bold,
    color: "#fff",
  },
  webFeatureSub: {
    fontSize: font.micro,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  webCta: {
    width: "100%",
  },
  webSignupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  webSignupText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: font.body,
    fontWeight: font.medium,
  },
  webSignupLink: {
    color: "#fff",
    fontSize: font.body,
    fontWeight: font.bold,
  },
  webFooterText: {
    marginTop: 40,
    color: colors.textMuted,
    fontSize: font.micro,
    fontWeight: font.medium,
    textAlign: "center",
  },
}) as any;
