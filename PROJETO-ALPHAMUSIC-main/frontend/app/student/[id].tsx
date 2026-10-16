import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@react-native-vector-icons/ionicons";
import { api } from "@/src/api";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { WEEKDAYS } from "@/src/format";

const INSTRUMENTS = ["Piano", "Teclado", "Violão", "Guitarra", "Baixo", "Bateria", "Canto", "Violino"];
const STATUSES = ["Ativo", "Inativo", "Trancado"];
const REGRAS = ["Reposicao", "Recesso", "AulaAvulsa", "AulaNormal", "Outro"];

export default function StudentEdit() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = !id || id === "new";

  const { data: existing } = useQuery<any>({
    queryKey: ["student", id],
    queryFn: () => api<any>(`/students/${id}`),
    enabled: !isNew,
  });

  const [form, setForm] = useState<any>({
    nome_completo: "",
    nome_preferencia: "",
    telefone: "",
    whatsapp: "",
    email: "",
    instrumento: "Piano",
    nivel: "Iniciante",
    dia_semana: 1,
    horario: "15:00",
    valor_mensal: 200,
    dia_vencimento: 10,
    forma_pagamento: "PIX",
    status: "Ativo",
    quinta_semana_regra: "Reposicao",
    responsavel_nome: "",
    responsavel_telefone: "",
    observacoes: "",
  });

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing });
  }, [existing]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const save = useMutation({
    mutationFn: async () => {
      if (isNew) return api("/students", { method: "POST", body: JSON.stringify(form) });
      return api(`/students/${id}`, { method: "PATCH", body: JSON.stringify(form) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.back();
    },
    onError: (e: any) => Alert.alert("Erro", e.message),
  });

  const del = useMutation({
    mutationFn: () => api(`/students/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); router.back(); },
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} testID="back-btn"><Icon name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>{isNew ? "Novo aluno" : "Editar aluno"}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Section title="Dados pessoais">
          <Field label="Nome completo" value={form.nome_completo} onChange={(v) => set("nome_completo", v)} testID="fld-nome" />
          <Field label="Nome de preferência" value={form.nome_preferencia} onChange={(v) => set("nome_preferencia", v)} testID="fld-nick" />
          <Field label="Telefone" value={form.telefone} onChange={(v) => set("telefone", v)} keyboardType="phone-pad" testID="fld-tel" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} keyboardType="phone-pad" testID="fld-wpp" />
          <Field label="E-mail" value={form.email} onChange={(v) => set("email", v)} keyboardType="email-address" testID="fld-email" />
        </Section>

        <Section title="Aula">
          <PickerRow label="Instrumento" options={INSTRUMENTS} value={form.instrumento} onChange={(v) => set("instrumento", v)} testID="fld-inst" />
          <PickerRow label="Dia da semana" options={WEEKDAYS} value={WEEKDAYS[form.dia_semana]} onChange={(v) => set("dia_semana", WEEKDAYS.indexOf(v))} testID="fld-dia" />
          <Field label="Horário (HH:MM)" value={form.horario} onChange={(v) => set("horario", v)} testID="fld-hora" />
          <PickerRow label="Regra 5ª semana" options={REGRAS} value={form.quinta_semana_regra} onChange={(v) => set("quinta_semana_regra", v)} testID="fld-5s" />
        </Section>

        <Section title="Financeiro">
          <Field label="Valor mensal (R$)" value={String(form.valor_mensal)} onChange={(v) => set("valor_mensal", parseFloat(v) || 0)} keyboardType="numeric" testID="fld-valor" />
          <Field label="Dia de vencimento" value={String(form.dia_vencimento)} onChange={(v) => set("dia_vencimento", parseInt(v) || 10)} keyboardType="numeric" testID="fld-venc" />
          <Field label="Forma de pagamento" value={form.forma_pagamento} onChange={(v) => set("forma_pagamento", v)} testID="fld-forma" />
        </Section>

        <Section title="Outros">
          <PickerRow label="Status" options={STATUSES} value={form.status} onChange={(v) => set("status", v)} testID="fld-status" />
          <Field label="Responsável (menor)" value={form.responsavel_nome} onChange={(v) => set("responsavel_nome", v)} testID="fld-resp" />
          <Field label="Telefone do responsável" value={form.responsavel_telefone} onChange={(v) => set("responsavel_telefone", v)} keyboardType="phone-pad" testID="fld-resp-tel" />
          <Field label="Observações" value={form.observacoes} onChange={(v) => set("observacoes", v)} multiline testID="fld-obs" />
        </Section>

        <Pressable testID="save-student" style={styles.saveBtn} onPress={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.saveText}>Salvar</Text>}
        </Pressable>
        {!isNew && (
          <Pressable testID="delete-student" style={styles.delBtn} onPress={() => del.mutate()}>
            <Text style={{ color: colors.error, fontWeight: "700" }}>Excluir aluno</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: any) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, marginBottom: spacing.sm }}>{title.toUpperCase()}</Text>
      <View style={{ backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm }}>{children}</View>
    </View>
  );
}

function Field({ label, value, onChange, keyboardType, multiline, testID }: any) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={{ backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15, minHeight: multiline ? 80 : undefined }}
      />
    </View>
  );
}

function PickerRow({ label, options, value, onChange, testID }: any) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}>
        {options.map((o: string) => (
          <Pressable
            key={o}
            testID={`${testID}-${o}`}
            onPress={() => onChange(o)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, height: 36, justifyContent: "center", borderRadius: radius.pill, backgroundColor: value === o ? colors.brandPrimary : colors.surfaceTertiary, flexShrink: 0 }}
          >
            <Text style={{ color: value === o ? colors.onBrandPrimary : colors.onSurface, fontSize: 13, fontWeight: "600" }}>{o}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { color: c.onSurface, fontSize: 18, fontWeight: "700" },
  saveBtn: { backgroundColor: c.brandPrimary, paddingVertical: 16, borderRadius: radius.md, alignItems: "center", marginTop: spacing.md },
  saveText: { color: c.onBrandPrimary, fontWeight: "700", fontSize: 16 },
  delBtn: { alignItems: "center", paddingVertical: spacing.md, marginTop: spacing.sm },
}));
