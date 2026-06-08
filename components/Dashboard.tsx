import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Icons from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useInspection, MouldRecord, progressOf } from "@/lib/inspectionStore";
import { api } from "@/lib/config";
import { colors, font, radius, gradients, shadow } from "@/constants/theme";
import Chip from "@/components/ui/Chip";
import StatusPill from "@/components/ui/StatusPill";
import ProgressRing from "@/components/ui/ProgressRing";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type VendorType = { vendorCode: string; vendorName: string; email: string; matnr: string };
type MaterialItem = {
  materialCode: string;
  materialDescription: string;
  componentPart: string;
  runnerType: string;
  granulesGrade: string;
  machineCode: string;
  cavity: string;
  runningCavity: string;
  cycleTime: string;
  efficiency: string;
  hoursPerDay: string;
  designCode: string;
  mouldLife: string;
  mouldShots: string;
  planningCode: string;
  fgCode: string;
};

const STATUS_FILTERS = [
  { key: "All", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
  { key: "not_started", label: "Not started" },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value || "—"}
    </Text>
  </View>
);

function statusKind(rec?: MouldRecord) {
  if (rec?.status === "done") return "done" as const;
  if (rec?.status === "in_progress") return "inprogress" as const;
  return "notstarted" as const;
}

function MouldCard({
  item,
  index,
  record,
  onInspect,
}: {
  item: MaterialItem;
  index: number;
  record?: MouldRecord;
  onInspect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress = progressOf(record);
  const started = record && record.status !== "not_started";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setExpanded((e) => !e);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(450)} style={[styles.card, shadow.card]}>
      <View style={styles.cardTop}>
        <View style={styles.thumb}>
          <Icons.Cube size={26} color={colors.brand} weight="duotone" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.code} numberOfLines={1}>
            {item.materialCode}
          </Text>
          <Text style={styles.desc} numberOfLines={2}>
            {item.materialDescription}
          </Text>
        </View>
        {started ? (
          <ProgressRing progress={progress} size={50} strokeWidth={6} />
        ) : (
          <View style={styles.ringPlaceholder}>
            <Icons.ArrowRight size={18} color={colors.brand} weight="bold" />
          </View>
        )}
      </View>

      {/* status + photos */}
      <View style={styles.metaRow}>
        <StatusPill kind={statusKind(record)} />
        {!!record?.photos && (
          <View style={styles.photoChip}>
            <Icons.Camera size={13} color={colors.textMuted} weight="fill" />
            <Text style={styles.photoChipText}>{record.photos}</Text>
          </View>
        )}
      </View>

      {/* quick spec chips */}
      <View style={styles.specRow}>
        {!!item.machineCode && <SpecChip icon={<Icons.Factory size={13} color={colors.textMuted} weight="bold" />} text={item.machineCode} />}
        {!!item.cavity && <SpecChip icon={<Icons.GridFour size={13} color={colors.textMuted} weight="bold" />} text={`${item.cavity} cav`} />}
        {!!item.cycleTime && <SpecChip icon={<Icons.Timer size={13} color={colors.textMuted} weight="bold" />} text={`${item.cycleTime}s`} />}
      </View>

      {expanded && (
        <View style={styles.detailsGrid}>
          <DetailItem label="Runner" value={item.runnerType} />
          <DetailItem label="Grade" value={item.granulesGrade} />
          <DetailItem label="Running Cav." value={item.runningCavity} />
          <DetailItem label="Efficiency" value={item.efficiency} />
          <DetailItem label="Hours / Day" value={item.hoursPerDay} />
          <DetailItem label="Design Code" value={item.designCode} />
          <DetailItem label="Mould Life" value={item.mouldLife} />
          <DetailItem label="Mould Shots" value={item.mouldShots} />
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.detailsBtn} onPress={toggle} activeOpacity={0.7}>
          <Text style={styles.detailsBtnText}>{expanded ? "Hide" : "Details"}</Text>
          <Icons.CaretDown
            size={15}
            color={colors.textMuted}
            weight="bold"
            style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={onInspect} style={{ flex: 1 }}>
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.inspectBtn}>
            <Icons.ClipboardText size={17} color="#fff" weight="fill" />
            <Text style={styles.inspectText}>{started ? "Continue" : "Start Inspection"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const SpecChip = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={styles.specChip}>
    {icon}
    <Text style={styles.specText}>{text}</Text>
  </View>
);

export default function DashboardScreen() {
  const { user, setUser } = useAuth();
  const { records, startInspection, getRecord } = useInspection();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    if (user?.Email) loadDashboard();
    else setLoading(false);
  }, [user?.Email]);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get("/dashboard", { params: { SMTP_ADDR: user?.Email } });
      if (data?.success) {
        console.log(data);
        setVendor(data.vendor);
        setUser(data.vendor);
        const unique = (data.materials as MaterialItem[]).filter(
          (it, i, self) => i === self.findIndex((t) => t.materialCode === it.materialCode)
        );
        setMaterials(unique);
      }
    } catch (e) {
      // keep silent; UI shows empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // status counts across the vendor's moulds
  const counts = useMemo(() => {
    let done = 0;
    let inProgress = 0;
    for (const m of materials) {
      const s = records[m.materialCode]?.status;
      if (s === "done") done++;
      else if (s === "in_progress") inProgress++;
    }
    return { done, inProgress, total: materials.length };
  }, [materials, records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery =
        !q || m.materialCode?.toLowerCase().includes(q) || m.materialDescription?.toLowerCase().includes(q);
      const s = records[m.materialCode]?.status ?? "not_started";
      const matchesFilter = filter === "All" || s === filter;
      return matchesQuery && matchesFilter;
    });
  }, [materials, query, filter, records]);

  const onInspect = (item: MaterialItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startInspection({ materialCode: item.materialCode, materialDescription: item.materialDescription });
    router.push({ pathname: "/(modals)/InjectMould", params: { ...item } });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.loaderText}>Loading your moulds…</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboard();
            }}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* HERO */}
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <View style={styles.heroBlob} />
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting()} 👋</Text>
              <Text style={styles.vendorName} numberOfLines={1}>
                {vendor?.vendorName || "Vendor"}
              </Text>
              {!!vendor?.vendorCode && (
                <View style={styles.vendorCodeChip}>
                  <Icons.Factory size={12} color="#fff" weight="fill" />
                  <Text style={styles.vendorCodeText}>Vendor {vendor.vendorCode}</Text>
                </View>
              )}
            </View>
            <View style={styles.avatar}>
              <Icons.Factory size={24} color="#fff" weight="fill" />
            </View>
          </View>

          {/* inspection mini-stats */}
          <View style={styles.heroStats}>
            <HeroStat value={counts.total} label="Total moulds" />
            <View style={styles.heroDivider} />
            <HeroStat value={counts.inProgress} label="In progress" />
            <View style={styles.heroDivider} />
            <HeroStat value={counts.done} label="Inspected" />
          </View>

          {/* search */}
          <View style={styles.searchBar}>
            <Icons.MagnifyingGlass size={20} color={colors.textMuted} weight="bold" />
            <TextInput
              placeholder="Search mould code or name"
              placeholderTextColor={colors.textFaint}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
            {!!query && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                <Icons.XCircle size={20} color={colors.textFaint} weight="fill" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* STATUS FILTER CHIPS */}
        <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {STATUS_FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </Animated.ScrollView>

        {/* LIST */}
        <View style={{ marginTop: 10 }}>
          <SectionTitle title="Your Moulds" subtitle={`${filtered.length} item${filtered.length === 1 ? "" : "s"}`} />
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Icons.Cube size={34} color={colors.brand} weight="duotone" />}
              title={materials.length === 0 ? "No moulds assigned yet" : "No matches"}
              message={materials.length === 0 ? "Pull down to refresh once moulds are assigned to you." : "Try a different search or filter."}
            />
          ) : (
            <View style={{ paddingHorizontal: 16, gap: 14 }}>
              {filtered.map((item, i) => (
                <MouldCard key={item.materialCode + i} item={item} index={i} record={getRecord(item.materialCode)} onInspect={() => onInspect(item)} />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const HeroStat = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.heroStat}>
    <Text style={styles.heroStatValue}>{value}</Text>
    <Text style={styles.heroStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 12 },
  loaderText: { color: colors.textMuted, fontWeight: font.medium, fontSize: font.sub },

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  heroBlob: { position: "absolute", width: 200, height: 200, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", top: -80, right: -50 },
  heroTopRow: { flexDirection: "row", alignItems: "center" },
  greeting: { color: "rgba(255,255,255,0.92)", fontSize: font.sub, fontWeight: font.semibold },
  vendorName: { color: "#fff", fontSize: 22, fontWeight: font.black, marginTop: 2, letterSpacing: -0.4 },
  vendorCodeChip: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, height: 24, borderRadius: radius.pill, marginTop: 8 },
  vendorCodeText: { color: "#fff", fontSize: font.micro, fontWeight: font.bold },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius._20,
    paddingVertical: 14,
    marginTop: 18,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: { color: "#fff", fontSize: 20, fontWeight: font.black },
  heroStatLabel: { color: "rgba(255,255,255,0.85)", fontSize: font.micro, fontWeight: font.semibold, marginTop: 2 },
  heroDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 4 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: radius._17,
    paddingHorizontal: 14,
    height: 50,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontSize: font.body, color: colors.ink, fontWeight: font.medium, padding: 0 },

  chipsRow: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4, gap: 10 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius._24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.brandSoft2,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  code: { fontSize: font.title, fontWeight: font.black, color: colors.ink },
  desc: { fontSize: font.sub, color: colors.textMuted, marginTop: 2, lineHeight: 18 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  photoChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, height: 26, borderRadius: radius.pill },
  photoChipText: { fontSize: font.caption, color: colors.textBody, fontWeight: font.bold },

  specRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  specChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: radius.pill,
  },
  specText: { fontSize: font.caption, color: colors.textBody, fontWeight: font.semibold },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius._15,
    padding: 12,
    marginTop: 14,
  },
  detailItem: { width: "48%", marginBottom: 10 },
  detailLabel: { fontSize: font.micro, color: colors.textFaint, fontWeight: font.semibold, textTransform: "uppercase" },
  detailValue: { fontSize: font.sub, color: colors.textBody, fontWeight: font.bold, marginTop: 2 },

  cardActions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  detailsBtnText: { fontSize: font.sub, fontWeight: font.bold, color: colors.textBody },
  inspectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radius._15,
  },
  inspectText: { color: "#fff", fontSize: font.body, fontWeight: font.bold },
});
