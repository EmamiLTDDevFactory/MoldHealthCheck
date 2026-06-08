import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, font } from "@/constants/theme";

export type StatusKind =
  | "due"
  | "overdue"
  | "done"
  | "approved"
  | "pending"
  | "draft"
  | "yes"
  | "no"
  | "inprogress"
  | "notstarted";

const MAP: Record<StatusKind, { bg: string; fg: string; label: string; dot: string }> = {
  due: { bg: colors.warningSoft, fg: "#B26A00", label: "Due", dot: colors.warning },
  overdue: { bg: colors.dangerSoft, fg: colors.danger, label: "Overdue", dot: colors.danger },
  done: { bg: colors.successSoft, fg: colors.success, label: "Done", dot: colors.success },
  approved: { bg: colors.successSoft, fg: colors.success, label: "Approved", dot: colors.success },
  pending: { bg: colors.warningSoft, fg: "#B26A00", label: "Pending", dot: colors.warning },
  draft: { bg: colors.infoSoft, fg: colors.info, label: "Draft", dot: colors.info },
  yes: { bg: colors.successSoft, fg: colors.success, label: "Yes", dot: colors.success },
  no: { bg: colors.dangerSoft, fg: colors.danger, label: "No", dot: colors.danger },
  inprogress: { bg: colors.infoSoft, fg: colors.info, label: "In progress", dot: colors.info },
  notstarted: { bg: colors.divider, fg: colors.textMuted, label: "Not started", dot: colors.textFaint },
};

export default function StatusPill({
  kind,
  label,
}: {
  kind: StatusKind;
  label?: string;
}) {
  const s = MAP[kind];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text style={[styles.text, { color: s.fg }]}>{label ?? s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: font.caption, fontWeight: font.bold },
});
