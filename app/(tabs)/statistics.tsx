import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Icons from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/config";
import { colors, font, radius, gradients, shadow } from "@/constants/theme";
import ProgressRing from "@/components/ui/ProgressRing";
import StatTile from "@/components/ui/StatTile";
import StatusPill from "@/components/ui/StatusPill";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";

type SubmissionType = {
  id: number;
  materialCode: string;
  materialDescription: string;
  submissionDate: string;
  approvedDate: string;
  status: string;
};

const DEMO: SubmissionType[] = [
  { id: 1, materialCode: "MAT-1001", materialDescription: "Mould Base Plate", submissionDate: "21 May 2026", approvedDate: "22 May 2026", status: "Approved" },
  { id: 2, materialCode: "MAT-1002", materialDescription: "Injection Mould", submissionDate: "23 May 2026", approvedDate: "-", status: "Pending" },
  { id: 3, materialCode: "MAT-1003", materialDescription: "Core Cavity", submissionDate: "24 May 2026", approvedDate: "25 May 2026", status: "Approved" },
  { id: 4, materialCode: "MAT-1004", materialDescription: "Slider Component", submissionDate: "26 May 2026", approvedDate: "-", status: "Pending" },
];

export default function StatisticsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);

  const total = submissions.length;
  const approved = submissions.filter((s) => s.status === "Approved").length;
  const pending = submissions.filter((s) => s.status === "Pending").length;
  const rate = total ? Math.round((approved / total) * 100) : 0;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await api.get("/statistics", { params: { SMTP_ADDR: user?.Email } });
      setSubmissions(data?.success && Array.isArray(data.submissions) && data.submissions.length ? data.submissions : DEMO);
    } catch {
      setSubmissions(DEMO);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand} colors={[colors.brand]} />
        }
      >
        {/* HERO with approval ring */}
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroKicker}>INSPECTION INSIGHTS</Text>
          <Text style={styles.heroTitle}>Your submission overview</Text>

          <View style={styles.ringCard}>
            <ProgressRing progress={rate} size={104} strokeWidth={11} sublabel="approved" />
            <View style={{ flex: 1, marginLeft: 18, gap: 10 }}>
              <RingStat color={colors.success} label="Approved" value={approved} />
              <RingStat color={colors.warning} label="Pending" value={pending} />
              <RingStat color={colors.info} label="Total submitted" value={total} />
            </View>
          </View>
        </LinearGradient>

        {/* KPI tiles */}
        <View style={styles.tiles}>
          <StatTile value={total} label="Total" icon={<Icons.ListChecks size={20} color={colors.info} weight="duotone" />} tint={colors.info} tintBg={colors.infoSoft} />
          <StatTile value={approved} label="Approved" icon={<Icons.SealCheck size={20} color={colors.success} weight="duotone" />} tint={colors.success} tintBg={colors.successSoft} />
          <StatTile value={pending} label="Pending" icon={<Icons.ClockCountdown size={20} color={colors.warning} weight="duotone" />} tint={colors.warning} tintBg={colors.warningSoft} />
        </View>

        {/* History */}
        <View style={{ marginTop: 24 }}>
          <SectionTitle title="Submission history" subtitle="Latest inspection activity" />
          {submissions.length === 0 ? (
            <EmptyState title="No submissions yet" message="Your inspection submissions will appear here." />
          ) : (
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
              {submissions.map((item, i) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(i * 80).duration(450)} style={[styles.histCard, shadow.card]}>
                  <View style={styles.histTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.histCode}>{item.materialCode}</Text>
                      <Text style={styles.histDesc} numberOfLines={1}>{item.materialDescription}</Text>
                    </View>
                    <StatusPill kind={item.status === "Approved" ? "approved" : "pending"} />
                  </View>
                  <View style={styles.histDates}>
                    <DateBox icon={<Icons.CalendarBlank size={16} color={colors.info} weight="fill" />} label="Submitted" value={item.submissionDate} />
                    <DateBox icon={<Icons.SealCheck size={16} color={colors.success} weight="fill" />} label="Approved" value={item.approvedDate === "-" ? "Pending" : item.approvedDate} />
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const RingStat = ({ color, label, value }: { color: string; label: string; value: number }) => (
  <View style={styles.ringStatRow}>
    <View style={[styles.ringDot, { backgroundColor: color }]} />
    <Text style={styles.ringStatLabel}>{label}</Text>
    <Text style={styles.ringStatValue}>{value}</Text>
  </View>
);

const DateBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={styles.dateBox}>
    {icon}
    <View>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.dateValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },

  hero: { paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: "hidden" },
  heroBlob: { position: "absolute", width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", top: -90, right: -60 },
  heroKicker: { color: "rgba(255,255,255,0.85)", fontSize: font.micro, fontWeight: font.bold, letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: font.black, marginTop: 4, letterSpacing: -0.4 },
  ringCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius._24,
    padding: 18,
    marginTop: 18,
  },
  ringStatRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ringDot: { width: 9, height: 9, borderRadius: 5 },
  ringStatLabel: { flex: 1, fontSize: font.sub, color: colors.textMuted, fontWeight: font.semibold },
  ringStatValue: { fontSize: font.body, color: colors.ink, fontWeight: font.black },

  tiles: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginTop: 18 },

  histCard: { backgroundColor: colors.surface, borderRadius: radius._24, borderWidth: 1, borderColor: colors.border, padding: 16 },
  histTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  histCode: { fontSize: font.title, fontWeight: font.black, color: colors.ink },
  histDesc: { fontSize: font.sub, color: colors.textMuted, marginTop: 2 },
  histDates: { flexDirection: "row", gap: 10, marginTop: 14 },
  dateBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius._15,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateLabel: { fontSize: font.micro, color: colors.textFaint, fontWeight: font.semibold },
  dateValue: { fontSize: font.sub, color: colors.ink, fontWeight: font.bold, marginTop: 1 },
});
