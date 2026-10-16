import { Tabs } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useStore } from "./store";

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
  erro: "#EF4444",
};

export default function TabLayout() {
  const { usuarioLogado, realizarLogin, carregarDados } = useStore();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const handleEntrar = async () => {
    setErro("");
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o e-mail e a senha!");
      return;
    }

    setCarregando(true);
    const sucesso = await realizarLogin(email, senha);
    setCarregando(false);

    if (!sucesso) {
      setErro("E-mail ou senha incorretos!");
    }
  };

  // 🔒 TELA DE LOGIN: Exibida quando não autenticado
  if (!usuarioLogado || !usuarioLogado.logado) {
    return (
      <KeyboardAvoidingView
        style={estilosLogin.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={estilosLogin.card}>
          <View style={estilosLogin.iconeCirculo}>
            <Ionicons name="musical-notes" size={40} color={CORES.primaria} />
          </View>

          <Text style={estilosLogin.titulo}>Alpha Music</Text>
          <Text style={estilosLogin.subtitulo}>Acesso Restrito ao Sistema</Text>

          {erro ? <Text style={estilosLogin.textoErro}>⚠️ {erro}</Text> : null}

          <Text style={estilosLogin.label}>E-mail de Acesso</Text>
          <TextInput
            style={estilosLogin.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErro("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={estilosLogin.label}>Senha</Text>
          <TextInput
            style={estilosLogin.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#9CA3AF"
            value={senha}
            onChangeText={(txt) => {
              setSenha(txt);
              setErro("");
            }}
            secureTextEntry
          />

          <TouchableOpacity
            style={estilosLogin.botao}
            onPress={handleEntrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilosLogin.botaoTexto}>Entrar no Sistema</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // 🔓 NAVEGAÇÃO POR ABAS: Exibida após autenticação
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: estilos.barra,
        tabBarItemStyle: estilos.itemBarra,
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="students"
        options={{
          title: "Alunos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Pagamentos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cash-multiple" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={20} color={color} />
          ),
        }}
      />

      {/* Telas auxiliares ocultas da barra */}
      <Tabs.Screen name="store" options={{ href: null }} />
      <Tabs.Screen name="inicializacao" options={{ href: null }} />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  barra: {
    backgroundColor: CORES.fundoCard,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 84,
    paddingTop: 8,
    paddingBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  itemBarra: {
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBarra: {
    fontSize: 11,
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

const estilosLogin = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundoEscuro,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: CORES.fundoCard,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconeCirculo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3EAF9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: CORES.fundoEscuro,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: CORES.textoCinza,
    marginBottom: 20,
  },
  textoErro: {
    color: CORES.erro,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "600",
    color: CORES.textoEscuro,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: CORES.textoEscuro,
  },
  botao: {
    width: "100%",
    height: 50,
    backgroundColor: CORES.primaria,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: CORES.primaria,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoTexto: {
    color: CORES.textoClaro,
    fontSize: 16,
    fontWeight: "700",
  },
});

export { CORES };
