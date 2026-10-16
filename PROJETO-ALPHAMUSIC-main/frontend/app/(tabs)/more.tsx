import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Platform } from "react-native";
import { useStore } from "./store";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MoreScreen() {
  const { alunos, pagamentos, limparUsuarioLogado, configuracoes, setConfiguracoes, carregarDados } = useStore();

  const [nomeEscola, setNomeEscola] = useState(configuracoes?.nomeEscola || "");
  const [responsavel, setResponsavel] = useState(configuracoes?.responsavel || "");
  const [contato, setContato] = useState(configuracoes?.contato || "");
  const [pix, setPix] = useState(configuracoes?.pix || "");
  const [banco, setBanco] = useState(configuracoes?.banco || "");

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (configuracoes) {
      setNomeEscola(configuracoes.nomeEscola || "");
      setResponsavel(configuracoes.responsavel || "");
      setContato(configuracoes.contato || "");
      setPix(configuracoes.pix || "");
      setBanco(configuracoes.banco || "");
    }
  }, [configuracoes]);

  const avisar = (titulo: string, msg: string) => {
    if (Platform.OS === "web") {
      alert(`${titulo} ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  const salvarConfiguracoes = async () => {
    await setConfiguracoes({
      nomeEscola: nomeEscola.trim(),
      responsavel: responsavel.trim(),
      contato: contato.trim(),
      pix: pix.trim(),
      banco: banco.trim(),
    });
    avisar("✅ Sucesso!", "Dados da escola salvos!");
  };

  // 📤 EXPORTAR BACKUP (Gera download do arquivo JSON)
  const exportarBackup = async () => {
    try {
      const state = useStore.getState();
      const dadosCompletos = {
        alunos: state.alunos,
        pagamentos: state.pagamentos,
        configuracoes: state.configuracoes,
        dataBackup: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(dadosCompletos, null, 2);

      if (Platform.OS === "web") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_alphamusic_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        avisar("✅ Sucesso!", "Arquivo de backup baixado! Envie-o para o computador.");
      } else {
        avisar("Backup", "Recurso disponível no navegador.");
      }
    } catch (e) {
      avisar("❌ Erro", "Não foi possível gerar o backup.");
    }
  };

  // 📥 IMPORTAR BACKUP (Lê o arquivo JSON e atualiza tudo)
  const importarBackup = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const dados = JSON.parse(e.target.result);

            if (dados.alunos && Array.isArray(dados.alunos)) {
              if (window.localStorage) {
                window.localStorage.setItem("alunos", JSON.stringify(dados.alunos));
                window.localStorage.setItem("pagamentos", JSON.stringify(dados.pagamentos || []));
                window.localStorage.setItem("configuracoes", JSON.stringify(dados.configuracoes || {}));
              }
              await AsyncStorage.setItem("alunos", JSON.stringify(dados.alunos));
              await AsyncStorage.setItem("pagamentos", JSON.stringify(dados.pagamentos || []));
              await AsyncStorage.setItem("configuracoes", JSON.stringify(dados.configuracoes || {}));

              await carregarDados();
              avisar("✅ Sucesso!", "Dados sincronizados com sucesso!");
              window.location.reload();
            } else {
              avisar("❌ Erro", "Arquivo de backup inválido.");
            }
          } catch (err) {
            avisar("❌ Erro", "Falha ao processar o arquivo de backup.");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  };

  const alunosInadimplentes = alunos.filter((aluno) => {
    const ultimoPagamento = pagamentos
      .filter((p) => (p.aluno || "").trim().toLowerCase() === (aluno.nome || "").trim().toLowerCase())
      .sort((a, b) => {
        const dataA = a.dataPagamento.split("/").reverse().join("-");
        const dataB = b.dataPagamento.split("/").reverse().join("-");
        return new Date(dataB).getTime() - new Date(dataA).getTime();
      })[0];

    if (!ultimoPagamento) return true;

    const dataUltimo = new Date(ultimoPagamento.dataPagamento.split("/").reverse().join("-"));
    const hoje = new Date();
    const mesesPassados =
      (hoje.getFullYear() - dataUltimo.getFullYear()) * 12 +
      (hoje.getMonth() - dataUltimo.getMonth());

    return mesesPassados >= 2;
  });

  const fazerLogout = async () => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm("Tem certeza que deseja sair?");
      if (confirmou) {
        await limparUsuarioLogado();
        window.location.reload();
      }
    } else {
      Alert.alert(
        "Sair da conta",
        "Tem certeza que deseja sair?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: async () => {
              await limparUsuarioLogado();
            },
          },
        ]
      );
    }
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

      {/* 🔄 ÁREA DE SINCRONIZAÇÃO / BACKUP */}
      <View style={styles.card}>
        <Text style={styles.subtitulo}>🔄 Sincronização e Backup</Text>
        <Text style={styles.descricaoBackup}>
          Exporte os dados cadastrados no celular e importe no computador para manter tudo igual em ambos.
        </Text>

        <TouchableOpacity style={styles.botaoExportar} onPress={exportarBackup}>
          <Text style={styles.botaoTexto}>📤 Exportar Dados (Baixar Backup)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoImportar} onPress={importarBackup}>
          <Text style={styles.botaoTexto}>📥 Importar Dados (Restaurar no PC)</Text>
        </TouchableOpacity>
      </View>

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
  descricaoBackup: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
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
    padding: 14,
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
  botaoExportar: {
    backgroundColor: "#2E86AB",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  botaoImportar: {
    backgroundColor: "#8E44AD",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 5,
  },
  botao: {
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
    fontSize: 15,
    fontWeight: "bold",
  },
});
