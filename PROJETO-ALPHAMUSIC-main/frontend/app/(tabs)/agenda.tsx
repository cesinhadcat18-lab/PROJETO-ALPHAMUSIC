import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useState } from "react";

// ==========================================================
// 📅 FERIADOS — MESMA LISTA DO FINANCEIRO
// ==========================================================

const feriadosNacionais = [
  // 2026
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
  // 2027
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

// ==========================================================
// 📅 TELA DA AGENDA
// ==========================================================

export default function AgendaScreen() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [infoFeriado, setInfoFeriado] = useState(null);

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const verificarFeriado = (dia, mes, ano) => {
    const dataFormatada = `${dia.toString().padStart(2, "0")}/${(mes + 1).toString().padStart(2, "0")}/${ano}`;
    return todosFeriados.find(f => f.data === dataFormatada);
  };

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  
  const dias = [];
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
  for (let d = 1; d <= diasNoMes; d++) dias.push(d);
  while (dias.length < 35) dias.push(null);

  const contarSemanasAula = () => {
    const semanas = [];
    for (let s = 0; s < 5; s++) {
      const inicioSemana = s * 7;
      let temAula = false;
      for (let d = inicioSemana + 1; d <= inicioSemana + 5; d++) {
        const dia = dias[d];
        if (dia) {
          const feriado = verificarFeriado(dia, mesAtual, anoAtual);
          if (!feriado || feriado.tipo === "facultativo") temAula = true;
        }
      }
      semanas.push(temAula);
    }
    return semanas;
  };

  const semanasComAula = contarSemanasAula();
  const totalSemanasAula = semanasComAula.filter(Boolean).length;

  const selecionarDia = (dia) => {
    setDiaSelecionado(dia);
    const feriado = verificarFeriado(dia, mesAtual, anoAtual);
    setInfoFeriado(feriado ? `${feriado.nome}` : null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📅 Agenda</Text>

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

        <View style={styles.resumoMes}>
          <Text style={styles.textoResumoMes}>📅 {totalSemanasAula} semanas com aula neste mês</Text>
          <View style={styles.legendaSemana}>
            {semanasComAula.map((temAula, i) => (
              <View key={i} style={[styles.indicadorSemana, temAula ? styles.semanaComAula : styles.semanaSemAula]}>
                <Text style={styles.textoSemana}>{i + 1}ª</Text>
              </View>
            ))}
          </View>
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

        <View style={styles.legendaCalendario}>
          <View style={styles.itemLegenda}>
            <View style={[styles.quadradinho, { backgroundColor: "#E74C3C" }]} />
            <Text style={styles.textoLegenda}>Feriado</Text>
          </View>
          <View style={styles.itemLegenda}>
            <View style={[styles.quadradinho, { backgroundColor: "#F39C12" }]} />
            <Text style={styles.textoLegenda}>Ponto Facultativo</Text>
          </View>
          <View style={styles.itemLegenda}>
            <View style={[styles.quadradinho, { backgroundColor: "#BBDEFB" }]} />
            <Text style={styles.textoLegenda}>Fim de Semana</Text>
          </View>
          <View style={styles.itemLegenda}>
            <View style={[styles.quadradinho, { backgroundColor: "#2E86AB" }]} />
            <Text style={styles.textoLegenda}>Hoje</Text>
          </View>
        </View>
      </View>

      <View style={styles.listaFeriadosCard}>
        <Text style={styles.subtitulo}>📋 Feriados — {anoAtual}</Text>
        <ScrollView style={styles.listaFeriados} showsVerticalScrollIndicator={false}>
          {todosFeriados
            .filter(f => f.data.endsWith(`/${anoAtual}`))
            .sort((a, b) => {
              const [diaA, mesA] = a.data.split("/");
              const [diaB, mesB] = b.data.split("/");
              if (mesA !== mesB) return parseInt(mesA) - parseInt(mesB);
              return parseInt(diaA) - parseInt(diaB);
            })
            .map((feriado, i) => (
              <View key={i} style={styles.itemFeriado}>
                <Text style={styles.dataFeriado}>{feriado.data.slice(0, -5)}</Text>
                <Text style={styles.nomeFeriado}>{feriado.nome}</Text>
                <View style={[
                  styles.bolinhaTipo,
                  feriado.tipo === "feriado" ? styles.bolinhaFeriado : styles.bolinhaFacultativo
                ]} />
              </View>
            ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  calendario: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  calendarioCabecalho: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  mesBotao: { fontSize: 22, color: "#2E86AB", paddingHorizontal: 15, fontWeight: "600" },
  mesNome: { fontSize: 20, fontWeight: "bold", color: "#333" },
  resumoMes: { backgroundColor: "#E8F5E9", borderRadius: 8, padding: 12, marginBottom: 15 },
  textoResumoMes: { fontSize: 15, fontWeight: "600", color: "#2E7D32", marginBottom: 8 },
  legendaSemana: { flexDirection: "row", justifyContent: "space-between" },
  indicadorSemana: { width: "18%", paddingVertical: 6, borderRadius: 4, alignItems: "center" },
  semanaComAula: { backgroundColor: "#4CAF50" },
  semanaSemAula: { backgroundColor: "#E0E0E0" },
  textoSemana: { fontSize: 11, color: "#fff", fontWeight: "600" },
  diasSemana: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  diaSemana: { fontSize: 13, fontWeight: "600", color: "#666", width: "14.28%", textAlign: "center" },
  diaSemanaDom: { color: "#C0392B" },
  diaSemanaSab: { color: "#E67E22" },
  gridDias: { flexDirection: "row", flexWrap: "wrap" },
  diaBotao: { width: "14.28%", paddingVertical: 12, alignItems: "center", borderRadius: 6 },
  diaTexto: { fontSize: 16, color: "#333" },
  diaVazio: { width: "14.28%", paddingVertical: 12 },
  diaHoje: { backgroundColor: "#2E86AB" },
  diaHojeTexto: { color: "#fff", fontWeight: "bold" },
  diaSelecionado: { backgroundColor: "#1A5276" },
  diaSelecionadoTexto: { color: "#fff", fontWeight: "bold" },
  diaFeriado: { backgroundColor: "#FDEDEC" },
  diaFeriadoTexto: { color: "#C0392B", fontWeight: "600" },
  diaFacultativo: { backgroundColor: "#FEF5E7" },
  diaFimDeSemana: { backgroundColor: "#F0F7FF" },
  diaFimDeSemanaTexto: { color: "#5499C7" },
  caixaInfoFeriado: { marginTop: 12, padding: 10, backgroundColor: "#FFF3CD", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#F39C12" },
  textoInfoFeriado: { fontSize: 14, color: "#856404", fontStyle: "italic" },
  legendaCalendario: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 15 },
  itemLegenda: { flexDirection: "row", alignItems: "center", gap: 6 },
  quadradinho: { width: 16, height: 16, borderRadius: 3 },
  textoLegenda: { fontSize: 12, color: "#666" },
  listaFeriadosCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, marginBottom: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  subtitulo: { fontSize: 18, fontWeight: "600", marginBottom: 15, color: "#444" },
  listaFeriados: { maxHeight: 300 },
  itemFeriado: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  dataFeriado: { fontSize: 14, fontWeight: "600", color: "#2E86AB", width: 90 },
  nomeFeriado: { flex: 1, fontSize: 14, color: "#333" },
  bolinhaTipo: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  bolinhaFeriado: { backgroundColor: "#E74C3C" },
  bolinhaFacultativo: { backgroundColor: "#F39C12" },
});