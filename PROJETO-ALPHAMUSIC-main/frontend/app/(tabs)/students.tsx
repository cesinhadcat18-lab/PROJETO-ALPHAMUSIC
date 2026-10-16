import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Clipboard } from "react-native";
import { useState, useEffect } from "react";
import { useStore } from "./store";

const DIAS_SEMANA = [
  { valor: "SEG", label: "Segunda" },
  { valor: "TER", label: "Terça" },
  { valor: "QUA", label: "Quarta" },
  { valor: "QUI", label: "Quinta" },
  { valor: "SEX", label: "Sexta" },
  { valor: "SAB", label: "Sábado" },
];

const TIPOS_AULA = [
  { valor: "canto", label: "🎤 Canto" },
  { valor: "teclado", label: "🎹 Teclado" },
  { valor: "piano", label: "🎹 Piano" },
  { valor: "violao", label: "🎸 Violão" },
  { valor: "guitarra", label: "🎸 Guitarra" },
];

export default function StudentsScreen() {
  const { alunos, adicionarAluno, editarAluno, excluirAluno, configuracoes, carregarDados } = useStore();

  const [nome, setNome] = useState("");
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [horarioAula, setHorarioAula] = useState("");
  const [tipoAula, setTipoAula] = useState("");
  const [telefoneAluno, setTelefoneAluno] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);

  // ✅ Carrega os dados ao abrir a tela
  useEffect(() => {
    carregarDados();
  }, []);

  const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

  const gerarMensagemCobranca = (aluno) => {
    return `Olá, ${aluno.nome}! 😊
Aula de ${TIPOS_AULA.find(t => t.valor === aluno.tipoAula)?.label} — ${DIAS_SEMANA.find(d => d.valor === aluno.diaSemana)?.label} às ${aluno.horarioAula}
💰 Valor: ${formatarMoeda(aluno.valorMensalidade)}
📅 Vencimento: ${aluno.dataVencimento}
💳 PIX: ${configuracoes.pix || ""}
🏦 Banco: ${configuracoes.banco || ""}
Atenciosamente,
${configuracoes.nomeEscola || "Alpha Music"}`;
  };

  const copiarMensagem = (aluno) => {
    Clipboard.setString(gerarMensagemCobranca(aluno));
    Alert.alert("✅ Copiado!", "Mensagem copiada!");
  };

  const iniciarEdicao = (aluno) => {
    setAlunoEmEdicao(aluno.id);
    setNome(aluno.nome);
    setValorMensalidade(aluno.valorMensalidade.toString().replace(".", ","));
    setDataVencimento(aluno.dataVencimento);
    setDiaSemana(aluno.diaSemana);
    setHorarioAula(aluno.horarioAula);
    setTipoAula(aluno.tipoAula);
    setTelefoneAluno(aluno.telefoneAluno || "");
    setTelefoneResponsavel(aluno.telefoneResponsavel || "");
    setObservacoes(aluno.observacoes || "");
  };

  const cancelarEdicao = () => {
    setAlunoEmEdicao(null);
    setNome(""); setValorMensalidade(""); setDataVencimento("");
    setDiaSemana(""); setHorarioAula(""); setTipoAula("");
    setTelefoneAluno(""); setTelefoneResponsavel(""); setObservacoes("");
  };

  // ✅ Função de salvar atualizada com async/await
  const salvarAluno = async () => {
    if (!nome.trim()) return Alert.alert("⚠️", "Digite o nome!");
    if (!valorMensalidade.trim()) return Alert.alert("⚠️", "Digite o valor!");
    if (!dataVencimento.trim()) return Alert.alert("⚠️", "Digite a data de vencimento!");
    if (!diaSemana) return Alert.alert("⚠️", "Selecione o dia da semana!");
    if (!horarioAula.trim()) return Alert.alert("⚠️", "Digite o horário!");
    if (!tipoAula) return Alert.alert("⚠️", "Selecione o tipo de aula!");

    const valorNumerico = parseFloat(valorMensalidade.replace(",", "."));

    if (alunoEmEdicao) {
      // ✅ Edição
      await editarAluno(alunoEmEdicao, {
        nome: nome.trim(),
        valorMensalidade: valorNumerico,
        dataVencimento: dataVencimento.trim(),
        diaSemana,
        horarioAula: horarioAula.trim(),
        tipoAula,
        telefoneAluno: telefoneAluno.trim(),
        telefoneResponsavel: telefoneResponsavel.trim(),
        observacoes: observacoes.trim(),
      });
      Alert.alert("✅", "Aluno atualizado!");
    } else {
      // ✅ Cadastro novo
      await adicionarAluno({
        nome: nome.trim(),
        valorMensalidade: valorNumerico,
        dataVencimento: dataVencimento.trim(),
        diaSemana,
        horarioAula: horarioAula.trim(),
        tipoAula,
        telefoneAluno: telefoneAluno.trim(),
        telefoneResponsavel: telefoneResponsavel.trim(),
        observacoes: observacoes.trim(),
        ativo: true,
      });
      Alert.alert("✅", "Aluno cadastrado!");
    }
    cancelarEdicao();
  };

  // ✅ Excluir com async/await
  const pedirExclusao = (id, nome) => {
    Alert.alert(
      "Excluir?",
      `${nome} será removido.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          await excluirAluno(id);
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>👨‍🏫 Alunos</Text>

      <View style={alunoEmEdicao ? [styles.card, styles.cardEdicao] : styles.card}>
        <Text style={styles.subtitulo}>{alunoEmEdicao ? "✏️ Editar Aluno" : "➕ Cadastrar Aluno"}</Text>

        <Text style={styles.label}>Nome Completo </Text>
        <TextInput style={styles.input} placeholder="Nome do aluno" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>📅 Dia da Semana </Text>
        <View style={styles.opcoes}>
          {DIAS_SEMANA.map(dia => (
            <Pressable key={dia.valor} style={[styles.botaoOpcao, diaSemana === dia.valor && styles.opcaoSelecionada]} onPress={() => setDiaSemana(dia.valor)}>
              <Text style={[styles.textoOpcao, diaSemana === dia.valor && styles.textoSelecionado]}>{dia.valor}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>🕒 Horário da Aula </Text>
        <TextInput style={styles.input} placeholder="Digite o horário" value={horarioAula} onChangeText={setHorarioAula} />

        <Text style={styles.label}>🎵 Tipo de Aula </Text>
        <View style={styles.opcoes}>
          {TIPOS_AULA.map(tipo => (
            <Pressable key={tipo.valor} style={[styles.botaoOpcao, tipoAula === tipo.valor && styles.opcaoSelecionada]} onPress={() => setTipoAula(tipo.valor)}>
              <Text style={[styles.textoOpcao, tipoAula === tipo.valor && styles.textoSelecionado]}>{tipo.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>💰 Mensalidade (R$) </Text>
        <TextInput style={styles.input} placeholder="200,00" keyboardType="decimal-pad" value={valorMensalidade} onChangeText={setValorMensalidade} />

        <Text style={styles.label}>📅 Data de Vencimento </Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataVencimento} onChangeText={setDataVencimento} />

        <Text style={styles.label}>📞 Telefone do Aluno</Text>
        <TextInput
          style={styles.input}
          placeholder="Apenas números"
          value={telefoneAluno}
          onChangeText={(texto) => {
            const soNumeros = texto.replace(/[^0-9]/g, "");
            if (soNumeros.length <= 11) setTelefoneAluno(soNumeros);
          }}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>👨‍👩‍👦 Telefone do Responsável</Text>
        <TextInput
          style={styles.input}
          placeholder="Apenas números"
          value={telefoneResponsavel}
          onChangeText={(texto) => {
            const soNumeros = texto.replace(/[^0-9]/g, "");
            if (soNumeros.length <= 11) setTelefoneResponsavel(soNumeros);
          }}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>📝 Observações</Text>
        <TextInput style={[styles.input, styles.textoGrande]} placeholder="Observações..." value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={3} />

        <View style={styles.botoesForm}>
          {alunoEmEdicao && <Pressable style={styles.botaoCancelar} onPress={cancelarEdicao}><Text style={styles.textoCancelar}>❌ Cancelar</Text></Pressable>}
          <Pressable style={styles.botaoSalvar} onPress={salvarAluno}><Text style={styles.textoSalvar}>{alunoEmEdicao ? "✅ Salvar" : "✅ Cadastrar"}</Text></Pressable>
        </View>
      </View>

      <View style={styles.listaCard}>
        <Text style={styles.subtitulo}>📋 Alunos Cadastrados ({alunos.length})</Text>
        {alunos.length === 0 ? (
          <Text style={styles.vazio}>Nenhum aluno cadastrado.</Text>
        ) : alunos.sort((a, b) => a.diaSemana.localeCompare(b.diaSemana) || a.horarioAula.localeCompare(b.horarioAula)).map(aluno => (
          <View key={aluno.id} style={styles.item}>
            <View style={styles.cabecalhoItem}>
              <Text style={styles.nomeItem}>{aluno.nome}</Text>
              <Text style={styles.diaItem}>{aluno.diaSemana} {aluno.horarioAula}</Text>
            </View>
            <Text style={styles.detalhe}>{TIPOS_AULA.find(t => t.valor === aluno.tipoAula)?.label} | {formatarMoeda(aluno.valorMensalidade)} | Vence: {aluno.dataVencimento}</Text>
            {aluno.telefoneAluno ? <Text style={styles.detalhe}>📞 Aluno: {aluno.telefoneAluno}</Text> : null}
            {aluno.telefoneResponsavel ? <Text style={styles.detalhe}>👨‍👩‍👦 Resp: {aluno.telefoneResponsavel}</Text> : null}
            {aluno.observacoes ? <Text style={styles.obsItem}>📝 {aluno.observacoes}</Text> : null}
            <View style={styles.botoesItem}>
              <Pressable style={styles.btnEditar} onPress={() => iniciarEdicao(aluno)}><Text style={styles.btnTexto}>✏️ Editar</Text></Pressable>
              <Pressable style={styles.btnCopiar} onPress={() => copiarMensagem(aluno)}><Text style={styles.btnTexto}>📋 Copiar</Text></Pressable>
              <Pressable style={styles.btnExcluir} onPress={() => pedirExclusao(aluno.id, aluno.nome)}><Text style={styles.btnTexto}>🗑️</Text></Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#1A1A2E",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#7B4B94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardEdicao: {
    borderWidth: 2,
    borderColor: "#9B6BB4",
    backgroundColor: "#FAF7FC",
  },
  listaCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1A1A2E",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
    color: "#4B5563",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    color: "#2C2C2C",
  },
  textoGrande: {
    height: 80,
    textAlignVertical: "top",
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  botaoOpcao: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  opcaoSelecionada: {
    backgroundColor: "#7B4B94",
    borderColor: "#7B4B94",
  },
  textoOpcao: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  textoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  botoesForm: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: "#7B4B94",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#7B4B94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoCancelar: {
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  textoSalvar: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  textoCancelar: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 15,
  },
  vazio: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 40,
    fontSize: 15,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cabecalhoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nomeItem: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  diaItem: {
    fontSize: 13,
    color: "#7B4B94",
    fontWeight: "600",
    backgroundColor: "#F3EAF9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detalhe: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 3,
    lineHeight: 18,
  },
  obsItem: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 6,
    marginBottom: 8,
  },
  botoesItem: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnEditar: {
    backgroundColor: "#3B82F6",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnCopiar: {
    backgroundColor: "#10B981",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnExcluir: {
    backgroundColor: "#FEF2F2",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  btnTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});