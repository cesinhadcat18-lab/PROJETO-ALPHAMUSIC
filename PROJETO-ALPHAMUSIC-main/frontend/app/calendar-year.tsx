import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Icon from "@react-native-vector-icons/ionicons";
import { api } from "@/src/api";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { MONTHS, WEEKDAYS_SHORT } from "@/src/format";

export default function CalendarYear() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useQuery<any[]>({ queryKey: ["cal", year], queryFn: () => api<any[]>(`/calendar/${year}`) });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Icon name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Calendário {year}</Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Pressable onPress={() => setYear(year - 1)} testID="prev-year"><Icon name="chevron-back" size={22} color={colors.onSurface} /></Pressable>
          <Pressable onPress={() => setYear(year + 1)} testID="next-year"><Icon name="chevron-forward" size={22} color={colors.onSurface} /></Pressable>
        </View>
      </View>
      {isLoading || !data ? (
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
          {data.map((m) => (
            <View key={m.month} style={styles.card} testID={`month-${m.month}`}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.mtitle}>{MONTHS[m.month - 1]}</Text>
                <Text style={styles.mdays}>{m.days} dias</Text>
              </View>
              <View style={styles.occs}>
                {[0, 1, 2, 3, 4, 5, 6].map((wd) => (
                  <View key={wd} style={styles.occCol}>
                    <Text style={styles.occLabel}>{WEEKDAYS_SHORT[(wd + 6) % 7]}</Text>
                    <View style={[styles.occBadge, m.five_week_weekdays.includes((wd + 6) % 7) && { backgroundColor: colors.warning }]}>
                      <Text style={[styles.occNum, m.five_week_weekdays.includes((wd + 6) % 7) && { color: colors.onWarning }]}>{m.occurrences[(wd + 6) % 7]}</Text>
                    </View>
                  </View>
                ))}
              </View>
              {m.five_week_weekdays.length > 0 && (
                <Text style={styles.hint}>⚡ 5ª ocorrência de {m.five_week_weekdays.map((i: number) => WEEKDAYS_SHORT[i]).join(", ")}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: c.onSurface, fontSize: 18, fontWeight: "700" },
  card: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  mtitle: { color: c.onSurface, fontSize: 16, fontWeight: "700" },
  mdays: { color: c.muted, fontSize: 12 },
  occs: { flexDirection: "row", justifyContent: "space-between" },
  occCol: { alignItems: "center", gap: 4 },
  occLabel: { color: c.muted, fontSize: 10, fontWeight: "700" },
  occBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  occNum: { color: c.onSurface, fontSize: 13, fontWeight: "700" },
  hint: { color: c.warning, fontSize: 12, fontWeight: "600", marginTop: 4 },
}));
