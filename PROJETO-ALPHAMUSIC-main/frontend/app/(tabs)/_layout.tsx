import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ✅ TEMA — Cores profissionais para Escola de Música
const CORES = {
  fundoEscuro: "#1A1A2E",
  fundoCard: "#FFFFFF",
  fundoTela: "#F8F9FA",
  destaque: "#E8D5B7",
  primaria: "#7B4B94",
  primariaClara: "#9B6BB4",
  textoEscuro: "#2C2C2C",
  textoClaro: "#FFFFFF",
  textoCinza: "#6B7280",
  borda: "#E5E7EB",
  sucesso: "#10B981",
  alerta: "#F59E0B",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: estilos.barra,
        tabBarActiveTintColor: CORES.primaria,
        tabBarInactiveTintColor: CORES.textoCinza,
        tabBarLabelStyle: estilos.textoBarra,
        headerStyle: estilos.cabecalho,
        headerTitleStyle: estilos.textoCabecalho,
        headerBackground: () => <View style={estilos.fundoCabecalho} />,
        headerShadowVisible: false,
        contentStyle: estilos.conteudoTela,
      }}
    >
      {/* ✅ Tela Início — visível na barra */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Alunos */}
      <Tabs.Screen
        name="students"
        options={{
          title: "Alunos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Agenda */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Financeiro */}
      <Tabs.Screen
        name="finance"
        options={{
          title: "Pagamentos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Mais */}
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ❌ ESCONDIDOS — continuam nos arquivos, mas NÃO aparecem na barra */}
      <Tabs.Screen name="store" options={{ href: null }} />
      <Tabs.Screen name="inicializacao" options={{ href: null }} />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  barra: {
    backgroundColor: CORES.fundoCard,
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 12,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  textoBarra: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  cabecalho: {
    backgroundColor: CORES.fundoEscuro,
    height: 100,
  },
  fundoCabecalho: {
    flex: 1,
    backgroundColor: CORES.fundoEscuro,
  },
  textoCabecalho: {
    color: CORES.textoClaro,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  conteudoTela: {
    backgroundColor: CORES.fundoTela,
  },
});

export { CORES };