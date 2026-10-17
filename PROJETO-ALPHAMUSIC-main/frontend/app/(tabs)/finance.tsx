import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useStore } from "./store";

const opcoesPagamento = [
  { id: "especie", nome: "💵 Espécie" },
  { id: "pix", nome: "⚡ Pix" },
  { id: "credito", nome: "💳 Cartão de Crédito" },
  { id: "debito", nome: "💳 Cartão de Débito" },
  { id: "transferencia", nome: "🏦 Transferência" },
];

export default function FinanceScreen() {
  const store: any = useStore();
  const alunos = store.alunos || [];
  const pagamentos = store.pagamentos || [];
  const registrarPagamento = store.registrarPagamento;
  const excluirPagamento = store.excluirPagamento;
  const configuracoes = store.configuracoes || {};
  const carregarDados = store.carregarDados;

  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [meioPagamento, setMeioPagamento] = useState("");
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [exibirRelatorioModal, setExibirRelatorioModal] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    if (carregarDados) carregarDados();
    setDataPagamento(new Date().toLocaleDateString("pt-BR"));
  }, []);

  const formatarMoeda = (val: any) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val) || 0);

  const formatarData = (texto: string) => {
    const limpo = texto.replace(/[^0-9]/g, "").slice(0, 8);
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 4) return `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    return `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}/${limpo.slice(4)}`;
  };

  const avisar = (titulo: string, msg: string) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${titulo} ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  const nomesAlunosValidos = alunos.map((a: any) => (a.nome || "").trim().toLowerCase());
  const pagamentosValidos = pagamentos.filter((p: any) =>
    nomesAlunosValidos.includes((p.aluno || "").trim().toLowerCase())
  );

  const totalRecebido = pagamentosValidos.reduce((acc: number, p: any) => acc + (Number(p.valor) || 0), 0);
  const totalAReceber = alunos.reduce((acc: number, a: any) => acc + (Number(a.valorMensalidade) || 0), 0);
  const diferenca = Math.max(0, totalAReceber - totalRecebido);

  const nomesPagaram = [...new Set(pagamentosValidos.map((p: any) => (p.aluno || "").trim().toLowerCase()))];
  const alunosPendentes = alunos.filter((a: any) => !nomesPagaram.includes((a.nome || "").trim().toLowerCase()));
  const totalPendente = alunosPendentes.reduce((acc: number, a: any) => acc + (Number(a.valorMensalidade) || 0), 0);

  const escolherAluno = (nome: string, valorMensalidade: number) => {
    if (alunoSelecionado && alunoSelecionado.nome === nome) {
      setAlunoSelecionado(null);
      setValor("");
    } else {
      setAlunoSelecionado({ nome, valor: valorMensalidade });
      setValor((Number(valorMensalidade) || 0).toFixed(2).replace(".", ","));
    }
    setMostrarLista(false);
  };

  const salvarPagamento = async () => {
    if (!alunoSelecionado) return avisar("⚠️", "Escolha um aluno!");
    if (!dataPagamento.trim()) return avisar("⚠️", "Informe a data!");
    if (!meioPagamento.trim()) return avisar("⚠️", "Escolha a forma de pagamento!");

    const valorNum = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) return avisar("⚠️", "Digite um valor válido!");

    if (registrarPagamento) {
      await registrarPagamento({
        aluno: alunoSelecionado.nome,
        valor: valorNum,
        dataPagamento: dataPagamento.trim(),
        meioPagamento: meioPagamento.trim(),
        observacao: observacao.trim(),
      });
    }

    setAlunoSelecionado(null);
    setValor("");
    setDataPagamento(new Date().toLocaleDateString("pt-BR"));
    setMeioPagamento("");
    setObservacao("");
    avisar("✅", "Pagamento registrado!");
  };

  const excluirPgto = async (id: string, nomeAluno: string) => {
    if (!id) return;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`Excluir pagamento de ${nomeAluno}?`) && excluirPagamento) {
        await excluirPagamento(id);
      }
    } else {
      Alert.alert("Excluir?", `${nomeAluno}`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => excluirPagamento && (await excluirPagamento(id)) },
      ]);
    }
  };

  // Carrega a biblioteca de PDF no navegador sob demanda (sem quebrar build)
  const carregarJsPDF = async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).jspdf) return (window as any).jspdf.jsPDF;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        resolve((window as any).jspdf ? (window as any).jspdf.jsPDF : null);
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  };

  // 📄 GERAÇÃO REAL DE ARQUIVO .PDF (Compatível com Celular e PC)
  const gerarArquivoPDF = async () => {
    if (gerandoPdf) return;
    setGerandoPdf(true);

    try {
      const JsPDFConstructor = await carregarJsPDF();
      if (!JsPDFConstructor) {
        avisar("⚠️", "Não foi possível carregar o gerador de PDF. Verifique a sua conexão.");
        setGerandoPdf(false);
        return;
      }

      const doc = new JsPDFConstructor({ orientation: "portrait", unit: "mm", format: "a4" });
      const escola = configuracoes?.nomeEscola || "Alpha Music Escola de Música";
      const dataHoje = new Date().toLocaleDateString("pt-BR");

      // CABEÇALHO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(123, 75, 148); // Roxo Alpha Music
      doc.text(escola, 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório Financeiro — Emitido em: ${dataHoje}`, 14, 25);

      // RESUMO CARDS
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(14, 30, 182, 18, 2, 2, "FD");

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Alunos: ${alunos.length}    |    Previsto: ${formatarMoeda(totalAReceber)}    |    Recebido: ${formatarMoeda(totalRecebido)}    |    Falta: ${formatarMoeda(diferenca)}`, 18, 41);

      let posVertical = 56;

      // SEÇÃO 1: PAGAMENTOS REALIZADOS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(123, 75, 148);
      doc.text(`Pagamentos Realizados (${pagamentosValidos.length})`, 14, posVertical);
      posVertical += 6;

      // CABEÇALHO DA TABELA
      doc.setFillColor(123, 75, 148);
      doc.rect(14, posVertical, 182, 7, "F");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Aluno", 18, posVertical + 5);
      doc.text("Data", 85, posVertical + 5);
      doc.text("Forma", 125, posVertical + 5);
      doc.text("Valor", 175, posVertical + 5);
      posVertical += 8;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      if (pagamentosValidos.length === 0) {
        doc.text("Nenhum pagamento registrado no momento.", 18, posVertical + 4);
        posVertical += 8;
      } else {
        pagamentosValidos.forEach((p: any) => {
          if (posVertical > 275) {
            doc.addPage();
            posVertical = 20;
          }
          doc.text(String(p.aluno || "").slice(0, 30), 18, posVertical + 4);
          doc.text(String(p.dataPagamento || ""), 85, posVertical + 4);
          doc.text(String(p.meioPagamento || "").slice(0, 20), 125, posVertical + 4);
          doc.text(formatarMoeda(p.valor), 175, posVertical + 4);

          doc.setDrawColor(240, 240, 240);
          doc.line(14, posVertical + 6, 196, posVertical + 6);
          posVertical += 7;
        });
      }

      posVertical += 8;

      // SEÇÃO 2: ALUNOS PENDENTES
      if (posVertical > 250) {
        doc.addPage();
        posVertical = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(123, 75, 148);
      doc.text(`Alunos com Pagamento Pendente (${alunosPendentes.length})`, 14, posVertical);
      posVertical += 6;

      doc.setFillColor(235, 140, 34);
      doc.rect(14, posVertical, 182, 7, "F");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Aluno", 18, posVertical + 5);
      doc.text("Valor da Mensalidade", 155, posVertical + 5);
      posVertical += 8;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      if (alunosPendentes.length === 0) {
        doc.text("Todos os alunos já pagaram a mensalidade!", 18, posVertical + 4);
      } else {
        alunosPendentes.forEach((a: any) => {
          if (posVertical > 275) {
            doc.addPage();
            posVertical = 20;
          }
          doc.text(String(a.nome || "").slice(0, 35), 18, posVertical + 4);
          doc.text(formatarMoeda(a.valorMensalidade), 155, posVertical + 4);

          doc.setDrawColor(240, 240, 240);
          doc.line(14, posVertical + 6, 196, posVertical + 6);
          posVertical += 7;
        });
      }

      // EXPORTAR COMO ARQUIVO .PDF REAL
      const nomeArquivo = `Relatorio_Financeiro_${dataHoje.replace(/\//g, "-")}.pdf`;
      const pdfBlob = doc.output("blob");

      // No celular: aciona compartilhamento nativo de ficheiro PDF
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], nomeArquivo, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Relatório Financeiro - ${escola}`,
            files: [file],
          });
          setGerandoPdf(false);
          return;
        }
      }

      // Fallback (ou no computador): download direto do arquivo .pdf
      doc.save(nomeArquivo);
    } catch (err) {
      avisar("Erro", "Não foi possível gerar o arquivo PDF.");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>💰 Financeiro</Text>

        <View style={styles.cardsResumo}>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>👨‍🏫 Alunos</Text>
            <Text style={styles.resumoValor}>{alunos.length}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>📋 Previsto</Text>
            <Text style={styles.resumoValorReceber}>{formatarMoeda(totalAReceber)}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>✅ Recebido</Text>
            <Text style={styles.resumoValorRecebido}>{formatarMoeda(totalRecebido)}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>📊 Falta</Text>
            <Text style={styles.resumoValorFalta}>{formatarMoeda(diferenca)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.botaoRelatorio} onPress={() => setExibirRelatorioModal(true)}>
          <Text style={styles.textoBotaoRelatorio}>📄 Ver Relatório Financeiro</Text>
        </TouchableOpacity>

        <View style={styles.pendentesCard}>
          <Text style={styles.subtitulo}>⚠️ Alunos Pendentes ({alunosPendentes.length})</Text>
          {alunosPendentes.map((aluno: any) => {
            const id = aluno.id || aluno._id;
            const selecionado = alunoSelecionado && alunoSelecionado.nome === aluno.nome;
            return (
              <View key={id} style={[styles.itemPendente, selecionado && styles.itemPendenteSelecionado]}>
                <View style={styles.linhaPendente}>
                  <Text style={[styles.nomePendente, selecionado && styles.nomeSelecionado]}>{aluno.nome}</Text>
                  <Text style={[styles.valorPendente, selecionado && styles.valorSelecionado]}>
                    {formatarMoeda(aluno.valorMensalidade)}
                  </Text>
                </View>
                <Pressable
                  style={[styles.botaoDarBaixa, selecionado && styles.botaoBaixaAtivo]}
                  onPress={() => escolherAluno(aluno.nome, aluno.valorMensalidade)}
                >
                  <Text style={styles.textoBotaoBaixa}>{selecionado ? "✓ Selecionado" : "✓ Dar Baixa"}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitulo}>➕ Registrar Pagamento</Text>
          <Text style={styles.label}>Aluno</Text>
          <Pressable
            style={[styles.seletor, alunoSelecionado && styles.seletorAtivo]}
            onPress={() => setMostrarLista(!mostrarLista)}
          >
            <Text style={alunoSelecionado ? styles.textoAtivo : styles.textoPlaceholder}>
              {alunoSelecionado ? `👤 ${alunoSelecionado.nome}` : "👉 Escolher aluno..."}
            </Text>
          </Pressable>

          {mostrarLista && (
            <View style={styles.listaAlunos}>
              {alunos.map((a: any) => (
                <Pressable
                  key={a.id || a._id}
                  style={[styles.itemAluno, alunoSelecionado?.nome === a.nome && styles.itemAlunoAtivo]}
                  onPress={() => escolherAluno(a.nome, a.valorMensalidade)}
                >
                  <Text style={alunoSelecionado?.nome === a.nome ? styles.textoAlunoAtivo : styles.nomeAlunoLista}>
                    {a.nome}
                  </Text>
                  <Text style={alunoSelecionado?.nome === a.nome ? styles.textoAlunoAtivo : styles.valorAlunoLista}>
                    {formatarMoeda(a.valorMensalidade)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
          />

          <Text style={styles.label}>Data do Pagamento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
            value={dataPagamento}
            onChangeText={(txt) => setDataPagamento(formatarData(txt))}
          />

          <Text style={styles.label}>Forma de Pagamento</Text>
          <Pressable style={styles.seletor} onPress={() => setMostrarOpcoes(!mostrarOpcoes)}>
            <Text style={meioPagamento ? styles.textoAtivo : styles.textoPlaceholder}>
              {meioPagamento || "👉 Escolher..."}
            </Text>
          </Pressable>

          {mostrarOpcoes && (
            <View style={styles.listaOpcoes}>
              {opcoesPagamento.map((op) => (
                <Pressable
                  key={op.id}
                  style={styles.itemOpcao}
                  onPress={() => {
                    setMeioPagamento(op.nome);
                    setMostrarOpcoes(false);
                  }}
                >
                  <Text style={styles.textoOpcao}>{op.nome}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textoGrande]}
            placeholder="Anotações..."
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={2}
          />

          <Pressable style={styles.botao} onPress={salvarPagamento}>
            <Text style={styles.botaoTexto}>✅ Salvar Pagamento</Text>
          </Pressable>
        </View>

        <View style={styles.listaCard}>
          <Text style={styles.subtitulo}>📋 Histórico de Pagamentos</Text>
          {pagamentosValidos.map((pg: any) => (
            <View key={pg.id || pg._id} style={styles.itemPagamento}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pgtoAluno}>{pg.aluno}</Text>
                <Text style={styles.pgtoData}>
                  📅 {pg.dataPagamento} | {pg.meioPagamento}
                </Text>
              </View>
              <Text style={styles.pgtoValor}>{formatarMoeda(pg.valor)}</Text>
              <Pressable style={styles.botaoExcluir} onPress={() => excluirPgto(pg.id || pg._id, pg.aluno)}>
                <Text style={styles.botaoExcluirTexto}>🗑️</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 📄 MODAL DO RELATÓRIO COM VOLTAR E EXPORTAR ARQUIVO .PDF REAL */}
      <Modal visible={exibirRelatorioModal} animationType="slide" onRequestClose={() => setExibirRelatorioModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalTopo}>
            <TouchableOpacity style={styles.btnVoltarModal} onPress={() => setExibirRelatorioModal(false)}>
              <Text style={styles.txtVoltarModal}>← Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnImprimirModal} onPress={gerarArquivoPDF} disabled={gerandoPdf}>
              <Text style={styles.txtImprimirModal}>{gerandoPdf ? "⏳ Gerando..." : "📥 Baixar / Exportar PDF"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalCorpo}>
            <Text style={styles.modalTituloEscola}>🎵 {configuracoes?.nomeEscola || "Alpha Music Escola de Música"}</Text>
            <Text style={styles.modalDataEmissao}>Relatório Financeiro — Emitido em: {new Date().toLocaleDateString("pt-BR")}</Text>

            <View style={styles.modalCardsResumo}>
              <View style={styles.modalCardMini}><Text style={styles.modalCardMiniTxt}>Alunos: {alunos.length}</Text></View>
              <View style={styles.modalCardMini}><Text style={styles.modalCardMiniTxt}>Previsto: {formatarMoeda(totalAReceber)}</Text></View>
              <View style={styles.modalCardMini}><Text style={[styles.modalCardMiniTxt, { color: "#27AE60" }]}>Recebido: {formatarMoeda(totalRecebido)}</Text></View>
              <View style={styles.modalCardMini}><Text style={[styles.modalCardMiniTxt, { color: "#E74C3C" }]}>Falta: {formatarMoeda(diferenca)}</Text></View>
            </View>

            <Text style={styles.modalSecaoTitulo}>💳 Pagamentos Realizados ({pagamentosValidos.length})</Text>
            {pagamentosValidos.length === 0 ? (
              <Text style={styles.modalTextoVazio}>Nenhum pagamento efetuado.</Text>
            ) : (
              pagamentosValidos.map((p: any) => (
                <View key={p.id || p._id} style={styles.modalLinhaItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemNome}>{p.aluno}</Text>
                    <Text style={styles.modalItemDetalhe}>{p.dataPagamento} • {p.meioPagamento}</Text>
                  </View>
                  <Text style={styles.modalItemValor}>{formatarMoeda(p.valor)}</Text>
                </View>
              ))
            )}

            <Text style={styles.modalSecaoTitulo}>⏳ Alunos Pendentes ({alunosPendentes.length})</Text>
            {alunosPendentes.length === 0 ? (
              <Text style={styles.modalTextoVazio}>Todos os alunos estão em dia!</Text>
            ) : (
              alunosPendentes.map((a: any) => (
                <View key={a.id || a._id} style={styles.modalLinhaItem}>
                  <Text style={styles.modalItemNome}>{a.nome}</Text>
                  <Text style={[styles.modalItemValor, { color: "#E67E22" }]}>{formatarMoeda(a.valorMensalidade)}</Text>
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  cardsResumo: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 10 },
  cardResumo: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  resumoLabel: { fontSize: 12, color: "#666" },
  resumoValor: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 4 },
  resumoValorReceber: { fontSize: 16, fontWeight: "bold", color: "#E67E22", marginTop: 4 },
  resumoValorRecebido: { fontSize: 16, fontWeight: "bold", color: "#27AE60", marginTop: 4 },
  resumoValorFalta: { fontSize: 16, fontWeight: "bold", color: "#E74C3C", marginTop: 4 },
  botaoRelatorio: { backgroundColor: "#7B4B94", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  textoBotaoRelatorio: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  pendentesCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  subtitulo: { fontSize: 17, fontWeight: "bold", marginBottom: 12, color: "#333" },
  itemPendente: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemPendenteSelecionado: { borderColor: "#7B4B94", borderWidth: 2, backgroundColor: "#FAF5FC" },
  linhaPendente: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  nomePendente: { fontSize: 14, fontWeight: "600", color: "#333" },
  nomeSelecionado: { color: "#7B4B94", fontWeight: "bold" },
  valorPendente: { fontSize: 14, fontWeight: "bold", color: "#E67E22" },
  valorSelecionado: { color: "#7B4B94" },
  botaoDarBaixa: {
    backgroundColor: "#27AE60",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  botaoBaixaAtivo: { backgroundColor: "#7B4B94" },
  textoBotaoBaixa: { color: "#fff", fontSize: 12, fontWeight: "600" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 16, elevation: 2 },
  listaCard: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 40, elevation: 2 },
  label: { fontSize: 13, fontWeight: "600", marginTop: 10, marginBottom: 4, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  textoGrande: { height: 60, textAlignVertical: "top" },
  seletor: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, backgroundColor: "#fafafa" },
  seletorAtivo: { borderColor: "#7B4B94", borderWidth: 2, backgroundColor: "#FAF5FC" },
  textoPlaceholder: { color: "#888" },
  textoAtivo: { color: "#7B4B94", fontWeight: "bold" },
  listaAlunos: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemAluno: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemAlunoAtivo: { backgroundColor: "#7B4B94", borderRadius: 6 },
  nomeAlunoLista: { fontSize: 14, color: "#333" },
  valorAlunoLista: { fontSize: 14, color: "#2E86AB" },
  textoAlunoAtivo: { color: "#fff", fontWeight: "bold" },
  listaOpcoes: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemOpcao: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcao: { fontSize: 14, color: "#333" },
  botao: { backgroundColor: "#27AE60", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 14 },
  botaoTexto: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  itemPagamento: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pgtoAluno: { fontSize: 14, fontWeight: "bold", color: "#333" },
  pgtoData: { fontSize: 12, color: "#666" },
  pgtoValor: { fontSize: 15, fontWeight: "bold", color: "#27AE60", marginRight: 10 },
  botaoExcluir: { padding: 6 },
  botaoExcluirTexto: { fontSize: 16 },

  // Estilos do Modal do Relatório
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#FAF9FB",
  },
  btnVoltarModal: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  txtVoltarModal: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  btnImprimirModal: {
    backgroundColor: "#7B4B94",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  txtImprimirModal: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  modalCorpo: { flex: 1, padding: 16 },
  modalTituloEscola: { fontSize: 20, fontWeight: "bold", color: "#1A1A2E" },
  modalDataEmissao: { fontSize: 13, color: "#666", marginTop: 2, marginBottom: 14 },
  modalCardsResumo: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  modalCardMini: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalCardMiniTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },
  modalSecaoTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#7B4B94",
    marginTop: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3EAF9",
    paddingBottom: 4,
  },
  modalTextoVazio: { fontSize: 13, color: "#9CA3AF", fontStyle: "italic", marginVertical: 6 },
  modalLinhaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemNome: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  modalItemDetalhe: { fontSize: 12, color: "#6B7280" },
  modalItemValor: { fontSize: 14, fontWeight: "bold", color: "#10B981" },
});
