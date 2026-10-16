import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useStore } from "./store";

// ==========================================================
// 📅 FERIADOS — ITABAIANA / SERGIPE
// ==========================================================
const feriadosNacionais = [
  { data: "01/01/2026", nome: "Confraternização Universal", tipo: "feriado" },
  { data: "17/02/2026", nome: "Terça-Feira de Carnaval", tipo: "facultativo" },
  { data: "18/02/2026", nome: "Quarta-Feira de Cinzas", tipo: "facultativo" },
  { data: "30/03/2026", nome: "Paixão de Cristo", tipo: "feriado" },
  { data: "21/04/2026", nome: "Tiradentes", tipo: "feriado" },
  { data: "01/05/2026", nome: "Dia do Trabalho", tipo: "feriado" },
  { data: "04/06/2026", nome: "Corpus Christi", tipo: "facultativo" },
  { data: "07/09/2026", nome: "Independência do Brasil", tipo: "feriado" },
  { data: "12/10/2026", nome: "Nossa Senhora Aparecida", tipo: "feriado" },
  { data: "02/11/2026", nome: "Finados", tipo: "feriado" },
  { data: "15/11/2026", nome: "Proclamação da República", tipo: "feriado" },
  { data: "08/12/2026", nome: "Nossa Senhora da Conceição", tipo: "feriado" },
  { data: "24/12/2026", nome: "Véspera de Natal", tipo: "facultativo" },
  { data: "25/12/2026", nome: "Natal", tipo: "feriado" },
  { data: "31/12/2026", nome: "Véspera de Ano Novo", tipo: "facultativo" },
  { data: "01/01/2027", nome: "Confraternização Universal", tipo: "feriado" },
  { data: "08/02/2027", nome: "Segunda-Feira de Carnaval", tipo: "facultativo" },
  { data: "09/02/2027", nome: "Terça-Feira de Carnaval", tipo: "facultativo" },
  { data: "10/02/2027", nome: "Quarta-Feira de Cinzas", tipo: "facultativo" },
  { data: "19/03/2027", nome: "São José", tipo: "feriado" },
  { data: "02/04/2027", nome: "Paixão de Cristo", tipo: "feriado" },
  { data: "21/04/2027", nome: "Tiradentes", tipo: "feriado" },
  { data: "01/05/2027", nome: "Dia do Trabalho", tipo: "feriado" },
  { data: "20/05/2027", nome: "Corpus Christi", tipo: "facultativo" },
  { data: "07/09/2027", nome: "Independência do Brasil", tipo: "feriado" },
  { data: "12/10/2027", nome: "Nossa Senhora Aparecida", tipo: "feriado" },
  { data: "02/11/2027", nome: "Finados", tipo: "feriado" },
  { data: "15/11/2027", nome: "Proclamação da República", tipo: "feriado" },
  { data: "08/12/2027", nome: "Nossa Senhora da Conceição", tipo: "feriado" },
  { data: "24/12/2027", nome: "Véspera de Natal", tipo: "facultativo" },
  { data: "25/12/2027", nome: "Natal", tipo: "feriado" },
  { data: "31/12/2027", nome: "Véspera de Ano Novo", tipo: "facultativo" },
];

const feriadosEstaduaisSE = [
  { data: "08/07/2026", nome: "Aniversário do Estado de Sergipe", tipo: "feriado" },
  { data: "08/07/2027", nome: "Aniversário do Estado de Sergipe", tipo: "feriado" },
];

const feriadosMunicipaisItabaiana = [
  { data: "29/01/2026", nome: "Nossa Senhora do Bom Parto", tipo: "feriado" },
  { data: "02/02/2026", nome: "Nossa Senhora da Conceição", tipo: "feriado" },
  { data: "13/06/2026", nome: "Santo Antônio", tipo: "feriado" },
  { data: "24/06/2026", nome: "São João (Padroeiro de Itabaiana)", tipo: "feriado" },
  { data: "28/08/2026", nome: "Aniversário de Itabaiana", tipo: "feriado" },
  { data: "29/01/2027", nome: "Nossa Senhora do Bom Parto", tipo: "feriado" },
  { data: "02/02/2027", nome: "Nossa Senhora da Conceição", tipo: "feriado" },
  { data: "13/06/2027", nome: "Santo Antônio", tipo: "feriado" },
  { data: "24/06/2027", nome: "São João (Padroeiro de Itabaiana)", tipo: "feriado" },
  { data: "28/08/2027", nome: "Aniversário de Itabaiana", tipo: "feriado" },
];

const todosFeriados = [...feriadosNacionais, ...feriadosEstaduaisSE, ...feriadosMunicipaisItabaiana];

const opcoesPagamento = [
  { id: "especie", nome: "💵 Espécie" },
  { id: "pix", nome: "⚡ Pix" },
  { id: "credito", nome: "💳 Cartão de Crédito" },
  { id: "debito", nome: "💳 Cartão de Débito" },
  { id: "transferencia", nome: "🏦 Transferência" },
];

// ==========================================================
// 📅 COMPONENTE DE CALENDÁRIO
// ==========================================================
const CalendarioCompleto = ({ dataSelecionada, aoSelecionarData }: any) => {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [infoFeriado, setInfoFeriado] = useState<string | null>(null);

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const verificarFeriado = (dia: number, mes: number, ano: number) => {
    const dataFormatada = `${dia.toString().padStart(2, "0")}/${(mes + 1).toString().padStart(2, "0")}/${ano}`;
    return todosFeriados.find(f => f.data === dataFormatada);
  };

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

  const dias = [];
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
  for (let d = 1; d <= diasNoMes; d++) dias.push(d);
  while (dias.length < 35) dias.push(null);

  const selecionarDia = (dia: number) => {
    setDiaSelecionado(dia);
    const feriado = verificarFeriado(dia, mesAtual, anoAtual);
    setInfoFeriado(feriado ? `${feriado.nome}` : null);
    aoSelecionarData(dia, mesAtual, anoAtual);
  };

  return (
    <View style={styles.calendario}>
      <View style={styles.calendarioCabecalho}>
        <Pressable onPress={() => {
          if (mesAtual === 0) { setMesAtual(11); setAnoAtual(anoAtual - 1); }
          else setMesAtual(mesAtual - 1);
          setDiaSelecionado(null); setInfoFeriado(null);
        }}>
          <Text style={styles.mesBotao}>◀</Text>
        </Pressable>
        <Text style={styles.mesNome}>{nomesMeses[mesAtual]} {anoAtual}</Text>
        <Pressable onPress={() => {
          if (mesAtual === 11) { setMesAtual(0); setAnoAtual(anoAtual + 1); }
          else setMesAtual(mesAtual + 1);
          setDiaSelecionado(null); setInfoFeriado(null);
        }}>
          <Text style={styles.mesBotao}>▶</Text>
        </Pressable>
      </View>

      <View style={styles.diasSemana}>
        {nomesDias.map((dia, i) => (
          <Text key={i} style={[styles.diaSemana, i === 0 && styles.diaSemanaDom, i === 6 && styles.diaSemanaSab]}>
            {dia}
          </Text>
        ))}
      </View>

      <View style={styles.gridDias}>
        {dias.map((dia, i) => {
          if (!dia) return <View key={i} style={styles.diaVazio} />;
          const feriado = verificarFeriado(dia, mesAtual, anoAtual);
          const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
          const ehSelecionado = dia === diaSelecionado;
          const diaSemana = i % 7;
          const ehFimDeSemana = diaSemana === 0 || diaSemana === 6;

          return (
            <Pressable
              key={i}
              style={[
                styles.diaBotao,
                ehHoje && styles.diaHoje,
                ehSelecionado && styles.diaSelecionado,
                feriado?.tipo === "feriado" && styles.diaFeriado,
                feriado?.tipo === "facultativo" && styles.diaFacultativo,
                ehFimDeSemana && !feriado && styles.diaFimDeSemana,
              ]}
              onPress={() => selecionarDia(dia)}
            >
              <Text style={[
                styles.diaTexto,
                ehHoje && styles.diaHojeTexto,
                ehSelecionado && styles.diaSelecionadoTexto,
                feriado && styles.diaFeriadoTexto,
                ehFimDeSemana && !feriado && styles.diaFimDeSemanaTexto,
              ]}>
                {dia}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {infoFeriado && (
        <View style={styles.caixaInfoFeriado}>
          <Text style={styles.textoInfoFeriado}>📌 {infoFeriado}</Text>
        </View>
      )}
    </View>
  );
};

// ==========================================================
// 📱 TELA PRINCIPAL — FINANCEIRO
// ==========================================================
export default function FinanceScreen() {
  const { alunos, pagamentos, registrarPagamento, excluirPagamento, carregarDados } = useStore();
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [meioPagamento, setMeioPagamento] = useState("");
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    carregarDados();
    const hoje = new Date().toLocaleDateString("pt-BR");
    setDataPagamento(hoje);
  }, []);

  const formatarMoeda = (val: any) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val) || 0);
  };

  const avisar = (titulo: string, msg: string) => {
    if (Platform.OS === "web") {
      alert(`${titulo} ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  // ✅ FILTRAGEM: Considera apenas pagamentos de alunos que ainda existem no sistema
  const nomesAlunosValidos = alunos.map(a => (a.nome || "").trim().toLowerCase());
  const pagamentosValidos = pagamentos.filter(p => {
    const nomeP = (p.aluno || "").trim().toLowerCase();
    return nomesAlunosValidos.includes(nomeP);
  });

  // ✅ CÁLCULOS SINCRONIZADOS COM A LISTA ATUAL DE ALUNOS
  const totalRecebido = pagamentosValidos.reduce((soma, p) => soma + (Number(p.valor) || 0), 0);
  const totalAReceber = alunos.reduce((soma, aluno) => soma + (Number(aluno.valorMensalidade) || 0), 0);
  const quantidadeAlunos = alunos.length;
  const diferenca = Math.max(0, totalAReceber - totalRecebido);

  // ✅ LISTA DE ALUNOS PENDENTES
  const nomesAlunosQuePagaram = [...new Set(pagamentosValidos.map(p => (p.aluno || "").trim().toLowerCase()))];
  const alunosPendentes = alunos.filter(aluno => !nomesAlunosQuePagaram.includes((aluno.nome || "").trim().toLowerCase()));
  const totalPendente = alunosPendentes.reduce((soma, aluno) => soma + (Number(aluno.valorMensalidade) || 0), 0);

  const escolherAluno = (nome: string, valorMensalidade: number) => {
    setAlunoSelecionado({ nome, valor: valorMensalidade });
    setValor((Number(valorMensalidade) || 0).toFixed(2).replace(".", ","));
    setMostrarLista(false);
  };

  const aoSelecionarData = (dia: number, mes: number, ano: number) => {
    const dataFormatada = `${dia.toString().padStart(2, "0")}/${(mes + 1).toString().padStart(2, "0")}/${ano}`;
    setDataPagamento(dataFormatada);
  };

  const salvarPagamento = async () => {
    if (!alunoSelecionado) {
      avisar("⚠️ Atenção", "Escolha um aluno da lista!");
      return;
    }
    if (!dataPagamento.trim()) {
      avisar("⚠️ Atenção", "Informe a data do pagamento!");
      return;
    }
    if (!meioPagamento.trim()) {
      avisar("⚠️ Atenção", "Escolha a forma de pagamento!");
      return;
    }
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      avisar("⚠️ Atenção", "Digite um valor válido!");
      return;
    }

    const novo = {
      aluno: alunoSelecionado.nome,
      valor: valorNumerico,
      dataPagamento: dataPagamento.trim(),
      meioPagamento: meioPagamento.trim(),
      observacao: observacao.trim(),
    };

    await registrarPagamento(novo);
    setAlunoSelecionado(null);
    setValor("");
    setDataPagamento(new Date().toLocaleDateString("pt-BR"));
    setMeioPagamento("");
    setObservacao("");
    avisar("✅ Sucesso!", "Pagamento registrado!");
  };

  const excluirPgto = async (id: string, nomeAluno: string) => {
    if (!id) return;

    if (Platform.OS === "web") {
      const confirmou = window.confirm(`Deseja excluir o pagamento de ${nomeAluno}?`);
      if (confirmou) {
        await excluirPagamento(id);
      }
    } else {
      Alert.alert(
        "Confirmar exclusão",
        `Excluir pagamento de ${nomeAluno}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: async () => { await excluirPagamento(id); } },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>💰 Financeiro</Text>

        {/* ✅ CARDS DE RESUMO */}
        <View style={styles.cardsResumo}>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>👨‍🏫 Alunos Ativos</Text>
            <Text style={styles.resumoValor}>{quantidadeAlunos}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>📋 Total a Receber</Text>
            <Text style={styles.resumoValorReceber}>{formatarMoeda(totalAReceber)}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>✅ Já Recebido</Text>
            <Text style={styles.resumoValorRecebido}>{formatarMoeda(totalRecebido)}</Text>
          </View>
          <View style={styles.cardResumo}>
            <Text style={styles.resumoLabel}>📊 Falta Receber</Text>
            <Text style={styles.resumoValorFalta}>{formatarMoeda(diferenca)}</Text>
          </View>
        </View>

        {/* ✅ LISTA DE ALUNOS PENDENTES */}
        <View style={styles.pendentesCard}>
          <Text style={styles.subtitulo}>⚠️ Alunos com Pagamento Pendente</Text>
          {alunosPendentes.length === 0 ? (
            <Text style={styles.tudoPago}>🎉 Todos os alunos já pagaram!</Text>
          ) : (
            <>
              <Text style={styles.quantidadePendentes}>
                {alunosPendentes.length} aluno{alunosPendentes.length > 1 ? "s" : ""} — Total: {formatarMoeda(totalPendente)}
              </Text>
              {alunosPendentes.map((aluno: any) => {
                const idAluno = aluno.id || aluno._id;
                return (
                  <View key={idAluno} style={styles.itemPendente}>
                    <View style={styles.linhaPendente}>
                      <Text style={styles.nomePendente}>⏳ {aluno.nome}</Text>
                      <Text style={styles.valorPendente}>{formatarMoeda(aluno.valorMensalidade)}</Text>
                    </View>
                    <Pressable
                      style={styles.botaoDarBaixa}
                      onPress={() => escolherAluno(aluno.nome, aluno.valorMensalidade)}
                    >
                      <Text style={styles.textoBotaoBaixa}>✓ Dar Baixa</Text>
                    </Pressable>
                  </View>
                );
              })}
            </>
          )}
        </View>

        {/* ✅ FORMULÁRIO DE PAGAMENTO */}
        <View style={styles.card}>
          <Text style={styles.subtitulo}>➕ Registrar Pagamento</Text>

          <Text style={styles.label}>Selecionar Aluno </Text>
          <Pressable style={styles.seletor} onPress={() => setMostrarLista(!mostrarLista)}>
            <Text style={alunoSelecionado ? styles.textoSelecionado : styles.textoPlaceholder}>
              {alunoSelecionado ? `👤 ${alunoSelecionado.nome}` : "👉 Toque para escolher um aluno..."}
            </Text>
          </Pressable>

          {mostrarLista && (
            <View style={styles.listaAlunos}>
              {alunos.length === 0 ? (
                <Text style={styles.avisoLista}>Nenhum aluno cadastrado ainda. Vá na aba "Alunos" e cadastre primeiro!</Text>
              ) : (
                alunos.map((aluno: any) => {
                  const idAluno = aluno.id || aluno._id;
                  return (
                    <Pressable
                      key={idAluno}
                      style={styles.itemAluno}
                      onPress={() => escolherAluno(aluno.nome, aluno.valorMensalidade)}
                    >
                      <Text style={styles.nomeAlunoLista}>{aluno.nome}</Text>
                      <Text style={styles.valorAlunoLista}>{formatarMoeda(aluno.valorMensalidade)}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          <Text style={styles.label}>Valor (R$) </Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
          />

          <Text style={styles.label}>Data do Pagamento </Text>
          <Pressable style={styles.seletor} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
            <Text style={styles.textoSelecionado}>
              📅 {dataPagamento} {mostrarCalendario ? "▲" : "▼"}
            </Text>
          </Pressable>

          {mostrarCalendario && (
            <View style={styles.calendarioContainer}>
              <CalendarioCompleto dataSelecionada={dataPagamento} aoSelecionarData={aoSelecionarData} />
              <Pressable style={styles.botaoFechar} onPress={() => setMostrarCalendario(false)}>
                <Text style={styles.botaoFecharTexto}>✓ Usar esta data</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>Forma de Pagamento </Text>
          <Pressable style={styles.seletor} onPress={() => setMostrarOpcoes(!mostrarOpcoes)}>
            <Text style={meioPagamento ? styles.textoSelecionado : styles.textoPlaceholder}>
              {meioPagamento ? meioPagamento : "👉 Toque para escolher..."} {mostrarOpcoes ? "▲" : "▼"}
            </Text>
          </Pressable>

          {mostrarOpcoes && (
            <View style={styles.listaOpcoes}>
              {opcoesPagamento.map((opcao) => (
                <Pressable
                  key={opcao.id}
                  style={styles.itemOpcao}
                  onPress={() => { setMeioPagamento(opcao.nome); setMostrarOpcoes(false); }}
                >
                  <Text style={styles.textoOpcao}>{opcao.nome}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textoGrande]}
            placeholder="Anotações adicionais..."
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
          />

          <Pressable style={styles.botao} onPress={salvarPagamento}>
            <Text style={styles.botaoTexto}>✅ Salvar Pagamento</Text>
          </Pressable>
        </View>

        {/* ✅ HISTÓRICO DE PAGAMENTOS */}
        <View style={styles.listaCard}>
          <Text style={styles.subtitulo}>📋 Histórico de Pagamentos</Text>
          {pagamentosValidos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum pagamento registrado ainda.</Text>
          ) : (
            pagamentosValidos.map((pgto: any) => {
              const idPgto = pgto.id || pgto._id;
              return (
                <View key={idPgto} style={styles.itemPagamento}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pgtoAluno}>{pgto.aluno}</Text>
                    <Text style={styles.pgtoData}>📅 {pgto.dataPagamento}</Text>
                    <Text style={styles.pgtoMeio}>💳 {pgto.meioPagamento}</Text>
                    {pgto.observacao ? <Text style={styles.pgtoObs}>📝 {pgto.observacao}</Text> : null}
                  </View>
                  <View style={styles.pgtoValorContainer}>
                    <Text style={styles.pgtoValor}>{formatarMoeda(pgto.valor)}</Text>
                    <Pressable style={styles.botaoExcluir} onPress={() => excluirPgto(idPgto, pgto.aluno)}>
                      <Text style={styles.botaoExcluirTexto}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  cardsResumo: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  cardResumo: { width: "48%", backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  resumoLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  resumoValor: { fontSize: 24, fontWeight: "bold", color: "#333" },
  resumoValorReceber: { fontSize: 18, fontWeight: "bold", color: "#E67E22" },
  resumoValorRecebido: { fontSize: 18, fontWeight: "bold", color: "#27AE60" },
  resumoValorFalta: { fontSize: 18, fontWeight: "bold", color: "#E74C3C" },
  pendentesCard: { backgroundColor: "#FFF8E1", borderRadius: 12, padding: 20, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: "#F39C12", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  quantidadePendentes: { fontSize: 14, color: "#856404", marginBottom: 12, fontWeight: "500" },
  tudoPago: { fontSize: 16, color: "#27AE60", fontStyle: "italic", textAlign: "center", paddingVertical: 10 },
  itemPendente: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#F8ECC2" },
  linhaPendente: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  nomePendente: { fontSize: 15, fontWeight: "600", color: "#856404" },
  valorPendente: { fontSize: 15, fontWeight: "bold", color: "#E67E22" },
  botaoDarBaixa: { backgroundColor: "#27AE60", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: "flex-start" },
  textoBotaoBaixa: { color: "#fff", fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  listaCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 40 },
  subtitulo: { fontSize: 18, fontWeight: "600", marginBottom: 15, color: "#444" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "#555" },
  seletor: { borderWidth: 1, borderColor: "#2E86AB", borderRadius: 8, padding: 14, marginBottom: 12, backgroundColor: "#f0f8ff" },
  textoPlaceholder: { color: "#888" },
  textoSelecionado: { color: "#2E86AB", fontWeight: "500" },
  listaAlunos: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: "#eee" },
  avisoLista: { textAlign: "center", color: "#888", fontStyle: "italic", padding: 10 },
  itemAluno: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  nomeAlunoLista: { fontSize: 15, color: "#333" },
  valorAlunoLista: { fontSize: 14, color: "#2E86AB", fontWeight: "500" },
  calendarioContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
  calendario: { width: "100%" },
  calendarioCabecalho: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  mesBotao: { fontSize: 20, color: "#2E86AB", paddingHorizontal: 15, fontWeight: "600" },
  mesNome: { fontSize: 18, fontWeight: "bold", color: "#333" },
  diasSemana: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  diaSemana: { fontSize: 12, fontWeight: "600", color: "#666", width: "14.28%", textAlign: "center" },
  diaSemanaDom: { color: "#C0392B" },
  diaSemanaSab: { color: "#E67E22" },
  gridDias: { flexDirection: "row", flexWrap: "wrap" },
  diaBotao: { width: "14.28%", paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  diaTexto: { fontSize: 15, color: "#333" },
  diaVazio: { width: "14.28%", paddingVertical: 10 },
  diaHoje: { backgroundColor: "#2E86AB" },
  diaHojeTexto: { color: "#fff", fontWeight: "bold" },
  diaSelecionado: { backgroundColor: "#1A5276" },
  diaSelecionadoTexto: { color: "#fff", fontWeight: "bold" },
  diaFeriado: { backgroundColor: "#FDEDEC" },
  diaFeriadoTexto: { color: "#C0392B", fontWeight: "600" },
  diaFacultativo: { backgroundColor: "#FEF5E7" },
  diaFimDeSemana: { backgroundColor: "#F0F7FF" },
  diaFimDeSemanaTexto: { color: "#5499C7" },
  caixaInfoFeriado: { marginTop: 10, padding: 8, backgroundColor: "#FFF3CD", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#F39C12" },
  textoInfoFeriado: { fontSize: 13, color: "#856404", fontStyle: "italic" },
  botaoFechar: { marginTop: 12, backgroundColor: "#2E86AB", padding: 10, borderRadius: 8, alignItems: "center" },
  botaoFecharTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
  listaOpcoes: { backgroundColor: "#f9f9f9", borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#eee" },
  itemOpcao: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcao: { fontSize: 15, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: "#fafafa" },
  textoGrande: { height: 80, textAlignVertical: "top" },
  botao: { backgroundColor: "#2E86AB", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 5 },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  vazio: { textAlign: "center", color: "#999", fontStyle: "italic", paddingVertical: 20 },
  itemPagamento: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  pgtoAluno: { fontSize: 15, fontWeight: "600", color: "#333" },
  pgtoData: { fontSize: 13, color: "#666", marginTop: 2 },
  pgtoMeio: { fontSize: 13, color: "#666" },
  pgtoObs: { fontSize: 12, color: "#888", fontStyle: "italic", marginTop: 3 },
  pgtoValorContainer: { alignItems: "flex-end" },
  pgtoValor: { fontSize: 16, fontWeight: "bold", color: "#2E86AB" },
  botaoExcluir: { padding: 5, marginTop: 5 },
  botaoExcluirTexto: { fontSize: 18 },
});
