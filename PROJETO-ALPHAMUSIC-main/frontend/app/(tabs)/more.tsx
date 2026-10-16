import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import { useStore } from "./store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

// ✅ Função para SALVAR TODOS OS DADOS
const salvarTodosOsDados = async () => {
  try {
    const { alunos, pagamentos, configuracoes } = useStore.getState();

    await AsyncStorage.setItem("alunos", JSON.stringify(alunos));
    await AsyncStorage.setItem("pagamentos", JSON.stringify(pagamentos));
    await AsyncStorage.setItem("configuracoes", JSON.stringify(configuracoes));

    console.log("✅ Dados salvos com sucesso!");
    return true;
  } catch (erro) {
    console.log("❌ Erro ao salvar:", erro);
    return false;
  }
};

export default function MoreScreen() {
  const { alunos, pagamentos, limparUsuarioLogado, configuracoes, setConfiguracoes } = useStore();

  // Estados locais para os campos de configuração
  const [nomeEscola, setNomeEscola] = React.useState(configuracoes.nomeEscola);
  const [responsavel, setResponsavel] = React.useState(configuracoes.responsavel || "");
  const [contato, setContato] = React.useState(configuracoes.contato || "");
  const [pix, setPix] = React.useState(configuracoes.pix || "");
  const [banco, setBanco] = React.useState(configuracoes.banco || "");

  // Atualiza os dados no store quando o usuário salva
  const salvarConfiguracoes = () => {
    setConfiguracoes({
      nomeEscola,
      responsavel,
      contato,
      pix,
      banco,
    });
    Alert.alert("✅ Sucesso!", "Dados da escola salvos!");
  };

  // ✅ Calcula inadimplentes
  const alunosInadimplentes = alunos.filter((aluno) => {
    const ultimoPagamento = pagamentos
      .filter((p) => p.aluno === aluno.nome)
      .sort((a, b) => {
        const dataA = a.dataPagamento.split("/").reverse().join("-");
        const dataB = b.dataPagamento.split("/").reverse().join("-");
        return new Date(dataB) - new Date(dataA);
      })[0];

    if (!ultimoPagamento) return true;

    const dataUltimo = new Date(ultimoPagamento.dataPagamento.split("/").reverse().join("-"));
    const hoje = new Date();
    const mesesPassados =
      (hoje.getFullYear() - dataUltimo.getFullYear()) * 12 +
      (hoje.getMonth() - dataUltimo.getMonth());

    return mesesPassados >= 2;
  });

  const fazerLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            limparUsuarioLogado();
            Alert.alert("✅ Você saiu!");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>⚙️ Mais Opções</Text>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>🏫 Dados da Escola</Text>

        <Text style={styles.label}>Nome da Escola</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da escola"
          value={nomeEscola}
          onChangeText={setNomeEscola}
        />

        <Text style={styles.label}>Responsável</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do responsável"
          value={responsavel}
          onChangeText={setResponsavel}
        />

        <Text style={styles.label}>📞 Contato</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefone/WhatsApp"
          value={contato}
          onChangeText={setContato}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>💳 Chave PIX</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua chave PIX"
          value={pix}
          onChangeText={setPix}
        />

        <Text style={styles.label}>🏦 Banco</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do banco"
          value={banco}
          onChangeText={setBanco}
        />

        <TouchableOpacity style={styles.botaoSalvarConfig} onPress={salvarConfiguracoes}>
          <Text style={styles.textoSalvarConfig}>💾 Salvar Dados da Escola</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>📊 Resumo</Text>
        <Text style={styles.info}>👨‍🏫 Total de Alunos: {alunos.length}</Text>
        <Text style={styles.info}>💳 Pagamentos Registrados: {pagamentos.length}</Text>
        <Text style={styles.infoInadimplentes}>⚠️ Alunos Inadimplentes: {alunosInadimplentes.length}</Text>
      </View>

      <TouchableOpacity
        style={styles.botao}
        onPress={async () => {
          const ok = await salvarTodosOsDados();
          Alert.alert(ok ? "✅ Sucesso!" : "❌ Erro", ok ? "Dados salvos!" : "Não foi possível salvar.");
        }}
      >
        <Text style={styles.botaoTexto}>💾 Salvar Dados Manualmente</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, styles.botaoSair]} onPress={fazerLogout}>
        <Text style={styles.botaoTexto}>🚪 Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#444",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 6,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  botaoSalvarConfig: {
    backgroundColor: "#27AE60",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  textoSalvarConfig: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
  },
  infoInadimplentes: {
    fontSize: 15,
    color: "#E74C3C",
    fontWeight: "500",
    marginTop: 5,
  },
  botao: {
    backgroundColor: "#2E86AB",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  botaoSair: {
    backgroundColor: "#C0392B",
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});