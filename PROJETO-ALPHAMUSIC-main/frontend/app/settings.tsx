import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@react-native-vector-icons/ionicons";
import { api } from "@/src/api";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

export default function Settings() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { data } = useQuery<any>({ queryKey: ["settings"], queryFn: () => api<any>("/settings") });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: () => api("/settings", { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); router.back(); },
  });

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} testID="back"><Icon name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Configurações</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <Sec title="Escola">
          <F l="Nome da escola" v={form.escola_nome} on={(v) => set("escola_nome", v)} t="fld-escola" />
          <F l="Nome do professor" v={form.professor_nome} on={(v) => set("professor_nome", v)} t="fld-prof" />
          <F l="CNPJ" v={form.cnpj} on={(v) => set("cnpj", v)} t="fld-cnpj" />
          <F l="Telefone" v={form.telefone} on={(v) => set("telefone", v)} t="fld-tel" />
          <F l="WhatsApp" v={form.whatsapp} on={(v) => set("whatsapp", v)} t="fld-wpp" />
          <F l="E-mail" v={form.email} on={(v) => set("email", v)} t="fld-email" />
          <F l="Instagram" v={form.instagram} on={(v) => set("instagram", v)} t="fld-ig" />
        </Sec>
        <Sec title="PIX">
          <F l="Tipo da chave (CPF/CNPJ/Celular/E-mail/Aleatória)" v={form.pix_tipo} on={(v) => set("pix_tipo", v)} t="fld-pix-tipo" />
          <F l="Chave PIX" v={form.pix_chave} on={(v) => set("pix_chave", v)} t="fld-pix-chave" />
          <F l="Nome do recebedor" v={form.pix_recebedor} on={(v) => set("pix_recebedor", v)} t="fld-pix-rec" />
          <F l="Banco" v={form.banco} on={(v) => set("banco", v)} t="fld-banco" />
          <F l="Agência" v={form.agencia} on={(v) => set("agencia", v)} t="fld-agencia" />
          <F l="Conta" v={form.conta} on={(v) => set("conta", v)} t="fld-conta" />
        </Sec>
        <Sec title="Regras">
          <F l="Valor padrão da mensalidade" v={String(form.valor_padrao || "")} on={(v) => set("valor_padrao", parseFloat(v) || 0)} k="numeric" t="fld-valor-p" />
          <F l="Dia padrão de vencimento" v={String(form.dia_vencimento_padrao || "")} on={(v) => set("dia_vencimento_padrao", parseInt(v) || 10)} k="numeric" t="fld-venc-p" />
          <F l="Duração da aula (min)" v={String(form.duracao_aula || "")} on={(v) => set("duracao_aula", parseInt(v) || 60)} k="numeric" t="fld-dur" />
          <F l="Estado" v={form.estado} on={(v) => set("estado", v)} t="fld-uf" />
          <F l="Município" v={form.municipio} on={(v) => set("municipio", v)} t="fld-muni" />
        </Sec>
        <Pressable testID="save-settings" style={styles.saveBtn} onPress={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.saveText}>Salvar</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Sec({ title, children }: any) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, marginBottom: spacing.sm }}>{title.toUpperCase()}</Text>
      <View style={{ backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>{children}</View>
    </View>
  );
}

function F({ l, v, on, k, t }: any) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>{l}</Text>
      <TextInput testID={t} value={v || ""} onChangeText={on} keyboardType={k} placeholderTextColor={colors.muted} style={{ backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15 }} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { color: c.onSurface, fontSize: 18, fontWeight: "700" },
  saveBtn: { backgroundColor: c.brandPrimary, paddingVertical: 16, borderRadius: radius.md, alignItems: "center" },
  saveText: { color: c.onBrandPrimary, fontWeight: "700", fontSize: 16 },
}));
