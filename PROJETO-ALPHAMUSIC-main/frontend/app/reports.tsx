import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Icon from "@react-native-vector-icons/ionicons";
import { api } from "@/src/api";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { fmtBRL, MONTHS_SHORT } from "@/src/format";

export default function Reports() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: fin, isLoading } = useQuery<any>({ queryKey: ["reports-fin", year], queryFn: () => api<any>(`/reports/financial/${year}`) });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Icon name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Relatórios</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.yearRow}>
        <Pressable onPress={() => setYear(year - 1)}><Icon name="chevron-back" size={22} color={colors.onSurface} /></Pressable>
        <Text style={styles.yearText}>{year}</Text>
        <Pressable onPress={() => setYear(year + 1)}><Icon name="chevron-forward" size={22} color={colors.onSurface} /></Pressable>
      </View>
      {isLoading || !fin ? (
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
          <View style={styles.totals}>
            <Total label="Pago" value={fin.total_pago} color={colors.success} />
            <Total label="Pendente" value={fin.total_pendente} color={colors.warning} />
            <Total label="Atrasado" value={fin.total_atrasado} color={colors.error} />
          </View>
          <Text style={styles.section}>Por mês</Text>
          <View style={styles.card}>
            {Object.entries(fin.per_month).map(([m, v]: [string, any]) => (
              <View key={m} style={styles.mrow}>
                <Text style={styles.mlabel}>{MONTHS_SHORT[parseInt(m) - 1]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mpaid}>Pago: {fmtBRL(v.pago)}</Text>
                  <Text style={styles.mother}>Pendente: {fmtBRL(v.pendente)} · Atrasado: {fmtBRL(v.atrasado)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Total({ label, value, color }: any) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary, padding: spacing.md, borderRadius: radius.md, gap: 4 }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
      <Text style={{ color, fontSize: 14, fontWeight: "800" }}>{fmtBRL(value)}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: c.onSurface, fontSize: 18, fontWeight: "700" },
  yearRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingVertical: spacing.sm },
  yearText: { color: c.onSurface, fontWeight: "800", fontSize: 18, minWidth: 80, textAlign: "center" },
  totals: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  section: { color: c.onSurface, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  card: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  mrow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: c.divider, paddingBottom: spacing.sm },
  mlabel: { color: c.onSurface, fontWeight: "700", width: 40 },
  mpaid: { color: c.success, fontWeight: "700", fontSize: 13 },
  mother: { color: c.muted, fontSize: 12, marginTop: 2 },
}));
