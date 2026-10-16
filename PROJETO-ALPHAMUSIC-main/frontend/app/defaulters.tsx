import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Icon from "@react-native-vector-icons/ionicons";
import { api } from "@/src/api";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { fmtBRL, fmtDateBR } from "@/src/format";

export default function Defaulters() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useQuery<any[]>({ queryKey: ["defaulters"], queryFn: () => api<any[]>("/defaulters") });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} testID="back"><Icon name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Inadimplentes</Text>
        <View style={{ width: 26 }} />
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
          {(!data || data.length === 0) ? <Text style={styles.empty}>🎉 Nenhum aluno em atraso</Text> : data.map((g) => (
            <View key={g.student_id} style={styles.card} testID={`def-${g.student_id}`}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={styles.red}><Icon name="alert" size={20} color={colors.onError} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{g.student_name}</Text>
                  <Text style={styles.sub}>{g.dias_atraso} dias em atraso · {fmtBRL(g.total)}</Text>
                </View>
              </View>
              {g.items.map((p: any) => (
                <Text key={p.id} style={styles.item}>• {fmtBRL(p.valor)} — venc {fmtDateBR(p.vencimento)}</Text>
              ))}
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
  card: { backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  red: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.error, alignItems: "center", justifyContent: "center" },
  name: { color: c.onSurface, fontSize: 16, fontWeight: "700" },
  sub: { color: c.error, fontSize: 12, fontWeight: "600", marginTop: 2 },
  item: { color: c.muted, fontSize: 13, marginLeft: 52 },
  empty: { color: c.muted, textAlign: "center", marginTop: 60, fontSize: 16 },
}));
