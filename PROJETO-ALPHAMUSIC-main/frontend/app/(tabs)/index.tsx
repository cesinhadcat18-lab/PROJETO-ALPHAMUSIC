import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useStore } from "./store";

const DIAS = [
  { chave: "SEG", nome: "SEG" },
  { chave: "TER", nome: "TER" },
  { chave: "QUA", nome: "QUA" },
  { chave: "QUI", nome: "QUI" },
  { chave: "SEX", nome: "SEXT" },
  { chave: "SAB", nome: "SAB" },
];

const HORARIOS = [
  "10h", "11h", "12h", "13h", "14h", "15h",
  "16h", "17h", "18h", "19h", "20h", "21h",
];

const HORARIOS_SABADO = ["10h", "11h", "12h"];

const TIPOS_AULA_ICONE: { [key: string]: string } = {
  canto: "🎤",
  teclado: "🎹",
  piano: "🎹",
  violao: "🎸",
  guitarra: "🎸",
};

const DIAS_ORDEM = ["SEG", "TER", "QUA", "QUI", "SEXT", "SAB"];

const normalizarHora = (horario: string) => {
  if (!horario) return "";
  const horaApenas = horario.replace(/[^0-9]/g, "").slice(0, 2);
  return `${horaApenas}h`;
};

export default function InicioScreen() {
  const { alunos } = useStore();

  const getAlunoNaCelula = (dia: string, horaQuadro: string) => {
    return alunos.filter((a) => {
      const horaAluno = normalizarHora(a.horarioAula);
      return a.diaSemana === dia && horaAluno === horaQuadro;
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 👋 Mensagem de Boas-Vindas */}
      <View style={styles.mensagemBemVindo}>
        <Text style={styles.textoBemVindo}>👋 Bem-vindo(a) à Alpha Music!</Text>
        <Text style={styles.subtextoBemVindo}>Organize seus alunos e horários com facilidade 🎵</Text>
      </View>

      {/* 📌 Como usar o sistema */}
      <View style={styles.comoUsar}>
        <Text style={styles.comoUsarTitulo}>📌 Como usar o sistema:</Text>
        <View style={styles.linhaItem}>
          <Text style={styles.icone}>👥</Text>
          <Text style={styles.texto}>
            Vá em <Text style={styles.destaque}>Alunos</Text> para cadastrar seus alunos
          </Text>
        </View>
        <View style={styles.linhaItem}>
          <Text style={styles.icone}>📅</Text>
          <Text style={styles.texto}>
            Vá em <Text style={styles.destaque}>Agenda</Text> para ver o calendário
          </Text>
        </View>
        <View style={styles.linhaItem}>
          <Text style={styles.icone}>💰</Text>
          <Text style={styles.texto}>
            Vá em <Text style={styles.destaque}>Financeiro</Text> para controlar pagamentos
          </Text>
        </View>
      </View>

      {/* 📅 Quadro de Horários */}
      <View style={styles.quadroSecao}>
        <Text style={styles.quadroTitulo}>📅 Quadro de Horários</Text>
        <View style={styles.quadroContainer}>
          <View style={styles.cabecalhoLinha}>
            <Text style={styles.colunaHora}>Hora</Text>
            {DIAS.map((dia) => (
              <Text key={dia.chave} style={styles.colunaDia}>
                {dia.nome}
              </Text>
            ))}
          </View>
          {HORARIOS.map((hora) => (
            <View key={hora} style={styles.linha}>
              <Text style={styles.horaTexto}>{hora}</Text>
              {DIAS.map((dia) => {
                if (dia.chave === "SAB" && !HORARIOS_SABADO.includes(hora)) {
                  return <View key={dia.chave} style={styles.celula} />;
                }
                const alunosNaCelula = getAlunoNaCelula(dia.chave, hora);
                return (
                  <View key={dia.chave} style={styles.celula}>
                    {alunosNaCelula.length > 0 ? (
                      alunosNaCelula.map((aluno) => (
                        <View key={aluno.id} style={styles.cardAluno}>
                          <Text style={styles.nomeAluno} numberOfLines={1}>
                            {TIPOS_AULA_ICONE[aluno.tipoAula] || "📚"} {aluno.nome}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.traco}>—</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* 📋 Lista Completa de Aulas */}
      <View style={styles.listaSecao}>
        <Text style={styles.listaTitulo}>📋 Lista Completa de Aulas</Text>
        {alunos.length === 0 ? (
          <Text style={styles.semAulas}>Nenhuma aula cadastrada.</Text>
        ) : (
          alunos
            .slice()
            .sort((a, b) => {
              const ordemDia = DIAS_ORDEM.indexOf(a.diaSemana) - DIAS_ORDEM.indexOf(b.diaSemana);
              if (ordemDia !== 0) return ordemDia;
              return (a.horarioAula || "").localeCompare(b.horarioAula || "");
            })
            .map((aluno) => (
              <View key={aluno.id} style={styles.itemLista}>
                <Text style={styles.itemDia}>{aluno.diaSemana}</Text>
                <Text style={styles.itemHora}>{aluno.horarioAula}</Text>
                <Text style={styles.itemNome}>{aluno.nome}</Text>
                <Text style={styles.itemTipo}>
                  {TIPOS_AULA_ICONE[aluno.tipoAula] || "📚"}{" "}
                  {aluno.tipoAula ? aluno.tipoAula.charAt(0).toUpperCase() + aluno.tipoAula.slice(1) : ""}
                </Text>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  mensagemBemVindo: {
    backgroundColor: "#F0F9FF",
    padding: 20,
    borderRadius: 16,
    marginTop: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2E86AB",
    alignItems: "center",
  },
  textoBemVindo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E86AB",
  },
  subtextoBemVindo: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },
  comoUsar: {
    backgroundColor: "#F9F9F9",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  comoUsarTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 12,
  },
  linhaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icone: {
    fontSize: 18,
    marginRight: 10,
  },
  texto: {
    fontSize: 15,
    color: "#555",
  },
  destaque: {
    fontWeight: "bold",
    color: "#2E86AB",
  },
  quadroSecao: {
    marginBottom: 20,
  },
  quadroTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  quadroContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  cabecalhoLinha: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#2E86AB",
    paddingVertical: 8,
  },
  colunaHora: {
    width: 50,
    fontWeight: "bold",
    fontSize: 14,
    color: "#2E86AB",
    textAlign: "center",
  },
  colunaDia: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 14,
    color: "#2E86AB",
    textAlign: "center",
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    paddingVertical: 6,
    minHeight: 36,
  },
  horaTexto: {
    width: 50,
    fontSize: 14,
    color: "#444",
    textAlign: "center",
  },
  celula: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  traco: {
    fontSize: 13,
    color: "#CCC",
  },
  cardAluno: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    width: "95%",
    alignItems: "center",
  },
  nomeAluno: {
    fontSize: 10,
    color: "#1565C0",
  },
  listaSecao: {
    marginBottom: 40,
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  semAulas: {
    textAlign: "center",
    color: "#AAA",
    fontStyle: "italic",
    paddingVertical: 30,
    fontSize: 15,
  },
  itemLista: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemDia: {
    width: 55,
    fontWeight: "bold",
    fontSize: 15,
    color: "#2E86AB",
  },
  itemHora: {
    width: 70,
    fontSize: 15,
  color: "#555",
  },
  itemNome: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  itemTipo: {
    fontSize: 14,
    color: "#777",
  },
});