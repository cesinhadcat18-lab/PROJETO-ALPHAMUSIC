import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "https://alphamusic-api.onrender.com";

const TOKEN_PADRAO =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWExMjY2YS1jMzg5LTQ1NmEtYTNkMi0xZjMzZjg1OGE2OGYiLCJlbWFpbCI6ImNlc2luaGFkY2F0MThAZ21haWwuY29tIiwiaW1qZXRjZXRkYnZkZzQtQW0wPtcv-nHPKPRtSzGvZqybem2oB4qpr4j1PRiCj-Ckc";

interface Aluno {
  id: string;
  nome: string;
  valorMensalidade: number;
  diaSemana: string;
  horarioAula: string;
  tipoAula: string;
  dataVencimento: string;
  telefoneAluno: string;
  telefoneResponsavel: string;
  observacoes: string;
  ativo: boolean;
}

interface Pagamento {
  id: string;
  aluno: string;
  valor: number;
  dataPagamento: string;
  meioPagamento: string;
  observacao: string;
}

interface Configuracoes {
  nomeEscola: string;
  responsavel: string;
  contato: string;
  pix: string;
  banco: string;
}

interface UsuarioLogado {
  email: string;
  logado: boolean;
}

interface StoreState {
  alunos: Aluno[];
  pagamentos: Pagamento[];
  configuracoes: Configuracoes;
  usuarioLogado: UsuarioLogado | null;
  carregando: boolean;

  adicionarAluno: (aluno: Omit<Aluno, "id">) => Promise<void>;
  editarAluno: (id: string, dados: Partial<Aluno>) => Promise<void>;
  excluirAluno: (id: string) => Promise<void>;

  registrarPagamento: (pagamento: Omit<Pagamento, "id">) => Promise<void>;
  excluirPagamento: (id: string) => Promise<void>;

  setConfiguracoes: (dados: Partial<Configuracoes>) => Promise<void>;
  definirUsuarioLogado: (usuario: UsuarioLogado) => Promise<void>;
  limparUsuarioLogado: () => Promise<void>;

  carregarDados: () => Promise<void>;
  salvarTudo: () => Promise<void>;
}

// Auxiliar para salvar no LocalStorage (Web) e AsyncStorage (Mobile)
const salvarLocal = async (chave: string, dados: any) => {
  try {
    const stringDados = JSON.stringify(dados);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(chave, stringDados);
    }
    await AsyncStorage.setItem(chave, stringDados);
  } catch (e) {
    console.error("Erro ao salvar localmente:", e);
  }
};

// Auxiliar para ler do LocalStorage (Web) ou AsyncStorage (Mobile)
const lerLocal = async (chave: string) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const item = window.localStorage.getItem(chave);
      if (item) return JSON.parse(item);
    }
    const itemAsync = await AsyncStorage.getItem(chave);
    if (itemAsync) return JSON.parse(itemAsync);
  } catch (e) {
    console.error("Erro ao ler localmente:", e);
  }
  return null;
};

const obterHeadersAutenticados = async () => {
  let token = null;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      token = window.localStorage.getItem("token");
    }
    if (!token) {
      token = await AsyncStorage.getItem("token");
    }
  } catch (e) {
    console.log("Erro ao recuperar token local:", e);
  }

  if (!token) {
    token = TOKEN_PADRAO;
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("token", TOKEN_PADRAO);
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const useStore = create<StoreState>((set, get) => ({
  alunos: [],
  pagamentos: [],
  configuracoes: {
    nomeEscola: "Alpha Music",
    responsavel: "",
    contato: "",
    pix: "",
    banco: "",
  },
  usuarioLogado: {
    email: "cesinhadcat18@gmail.com",
    logado: true,
  },
  carregando: false,

  adicionarAluno: async (aluno) => {
    let idGerado = Date.now().toString();
    try {
      const headers = await obterHeadersAutenticados();
      const resp = await fetch(`${API_URL}/api/students`, {
        method: "POST",
        headers,
        body: JSON.stringify(aluno),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.id || data._id) idGerado = data.id || data._id;
      }
    } catch (e) {
      console.log("API offline ou não autorizada, salvando local...");
    }

    const novoAluno = { ...aluno, id: idGerado };
    const novaLista = [...get().alunos, novoAluno];
    set({ alunos: novaLista });
    await salvarLocal("alunos", novaLista);
  },

  editarAluno: async (id, dados) => {
    try {
      const headers = await obterHeadersAutenticados();
      await fetch(`${API_URL}/api/students/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(dados),
      });
    } catch (e) {
      console.log("Erro ao editar no servidor:", e);
    }
    const novaLista = get().alunos.map((a) =>
      a.id === id ? { ...a, ...dados } : a
    );
    set({ alunos: novaLista });
    await salvarLocal("alunos", novaLista);
  },

  excluirAluno: async (id) => {
    const alunoAlvo = get().alunos.find((a) => a.id === id);
    const nomeAluno = alunoAlvo ? alunoAlvo.nome.trim().toLowerCase() : "";

    try {
      const headers = await obterHeadersAutenticados();
      await fetch(`${API_URL}/api/students/${id}`, {
        method: "DELETE",
        headers,
      });
    } catch (e) {
      console.log("Erro ao excluir no servidor:", e);
    }

    const novaListaAlunos = get().alunos.filter((a) => a.id !== id);
    const novaListaPagamentos = get().pagamentos.filter((p) => {
      if (p.aluno === id) return false;
      if (nomeAluno && p.aluno && p.aluno.trim().toLowerCase() === nomeAluno) return false;
      return true;
    });

    set({ alunos: novaListaAlunos, pagamentos: novaListaPagamentos });
    await salvarLocal("alunos", novaListaAlunos);
    await salvarLocal("pagamentos", novaListaPagamentos);
  },

  registrarPagamento: async (pagamento) => {
    const novoPagamento = { ...pagamento, id: Date.now().toString() };
    const novaLista = [...get().pagamentos, novoPagamento];
    set({ pagamentos: novaLista });
    await salvarLocal("pagamentos", novaLista);
  },

  excluirPagamento: async (id) => {
    const novaLista = get().pagamentos.filter((p) => p.id !== id);
    set({ pagamentos: novaLista });
    await salvarLocal("pagamentos", novaLista);
  },

  setConfiguracoes: async (dados) => {
    const novasConfigs = { ...get().configuracoes, ...dados };
    set({ configuracoes: novasConfigs });
    await salvarLocal("configuracoes", novasConfigs);
  },

  definirUsuarioLogado: async (usuario) => {
    set({ usuarioLogado: usuario });
    await salvarLocal("usuarioLogado", usuario);
  },

  limparUsuarioLogado: async () => {
    set({ usuarioLogado: null });
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("usuarioLogado");
    }
    await AsyncStorage.removeItem("usuarioLogado");
  },

  carregarDados: async () => {
    set({ carregando: true });

    // 1. Carrega IMEDIATAMENTE do armazenamento local (nunca deixa a tela em branco)
    const alunosLocais = await lerLocal("alunos");
    const pagamentosLocais = await lerLocal("pagamentos");
    const configLocais = await lerLocal("configuracoes");
    const usuarioLocal = await lerLocal("usuarioLogado");

    set({
      alunos: Array.isArray(alunosLocais) ? alunosLocais : get().alunos,
      pagamentos: Array.isArray(pagamentosLocais) ? pagamentosLocais : get().pagamentos,
      configuracoes: configLocais ? { ...get().configuracoes, ...configLocais } : get().configuracoes,
      usuarioLogado: usuarioLocal ? usuarioLocal : get().usuarioLogado,
    });

    // 2. Tenta sincronizar com o backend em segundo plano se a API responder
    try {
      const headers = await obterHeadersAutenticados();
      const resp = await fetch(`${API_URL}/api/students`, {
        method: "GET",
        headers,
      });
      if (resp.ok) {
        const dadosRemotos = await resp.json();
        if (Array.isArray(dadosRemotos) && dadosRemotos.length > 0) {
          const formatados = dadosRemotos.map((s: any) => ({
            ...s,
            id: s.id || s._id,
          }));
          set({ alunos: formatados });
          await salvarLocal("alunos", formatados);
        }
      }
    } catch (e) {
      console.log("Modo offline ativo.");
    } finally {
      set({ carregando: false });
    }
  },

  salvarTudo: async () => {
    const state = get();
    await salvarLocal("alunos", state.alunos);
    await salvarLocal("pagamentos", state.pagamentos);
    await salvarLocal("configuracoes", state.configuracoes);
    await salvarLocal("usuarioLogado", state.usuarioLogado);
  },
}));
