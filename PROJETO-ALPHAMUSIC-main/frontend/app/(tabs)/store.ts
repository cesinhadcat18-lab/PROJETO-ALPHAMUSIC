import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "https://alphamusic-api.onrender.com";

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

const obterHeadersAutenticados = async () => {
  let token = null;
  try {
    token = await AsyncStorage.getItem("token");
    if (!token && typeof window !== "undefined" && window.localStorage) {
      token = window.localStorage.getItem("token");
    }
  } catch (e) {
    console.log("Erro ao recuperar token:", e);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const salvarNoStorage = async (chave: string, dados: any) => {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(dados));
  } catch (erro) {
    console.log("Erro ao salvar local:", erro);
  }
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
  usuarioLogado: null,
  carregando: false,

  adicionarAluno: async (aluno) => {
    try {
      const headers = await obterHeadersAutenticados();
      const resp = await fetch(`${API_URL}/api/students`, {
        method: "POST",
        headers,
        body: JSON.stringify(aluno),
      });
      const data = await resp.json();
      const novoAluno = { ...aluno, id: data.id || data._id || Date.now().toString() };
      const novaLista = [...get().alunos, novoAluno];
      set({ alunos: novaLista });
      await salvarNoStorage("alunos", novaLista);
    } catch {
      const novoAluno = { ...aluno, id: Date.now().toString() };
      const novaLista = [...get().alunos, novoAluno];
      set({ alunos: novaLista });
      await salvarNoStorage("alunos", novaLista);
    }
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
    const novaLista = get().alunos.map((a) => (a.id === id ? { ...a, ...dados } : a));
    set({ alunos: novaLista });
    await salvarNoStorage("alunos", novaLista);
  },

  excluirAluno: async (id) => {
    try {
      const headers = await obterHeadersAutenticados();
      const resp = await fetch(`${API_URL}/api/students/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!resp.ok) {
        console.warn("Falha na exclusão remota, status:", resp.status);
      }
    } catch (e) {
      console.log("Erro ao excluir no servidor:", e);
    }
    const novaLista = get().alunos.filter((a) => a.id !== id);
    set({ alunos: novaLista });
    await salvarNoStorage("alunos", novaLista);
  },

  registrarPagamento: async (pagamento) => {
    const novoPagamento = { ...pagamento, id: Date.now().toString() };
    const novaLista = [...get().pagamentos, novoPagamento];
    set({ pagamentos: novaLista });
    await salvarNoStorage("pagamentos", novaLista);
  },

  excluirPagamento: async (id) => {
    const novaLista = get().pagamentos.filter((p) => p.id !== id);
    set({ pagamentos: novaLista });
    await salvarNoStorage("pagamentos", novaLista);
  },

  setConfiguracoes: async (dados) => {
    const novasConfigs = { ...get().configuracoes, ...dados };
    set({ configuracoes: novasConfigs });
    await salvarNoStorage("configuracoes", novasConfigs);
  },

  definirUsuarioLogado: async (usuario) => {
    set({ usuarioLogado: usuario });
    await salvarNoStorage("usuarioLogado", usuario);
  },

  limparUsuarioLogado: async () => {
    set({ usuarioLogado: null });
    await AsyncStorage.removeItem("usuarioLogado");
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("token");
    }
  },

  carregarDados: async () => {
    set({ carregando: true });
    try {
      const headers = await obterHeadersAutenticados();
      const resp = await fetch(`${API_URL}/api/students`, {
        method: "GET",
        headers,
      });
      if (resp.ok) {
        const dadosRemotos = await resp.json();
        if (Array.isArray(dadosRemotos) && dadosRemotos.length > 0) {
          const alunosFormatados = dadosRemotos.map((s: any) => ({
            ...s,
            id: s.id || s._id,
          }));
          set({ alunos: alunosFormatados });
          await salvarNoStorage("alunos", alunosFormatados);
        } else {
          const localAlunos = await AsyncStorage.getItem("alunos");
          if (localAlunos) {
            const parsed = JSON.parse(localAlunos);
            set({ alunos: parsed });
          }
        }
      }
    } catch (e) {
      const localAlunos = await AsyncStorage.getItem("alunos");
      if (localAlunos) set({ alunos: JSON.parse(localAlunos) });
    }

    try {
      const pagamentosSalvos = await AsyncStorage.getItem("pagamentos");
      const configuracoesSalvas = await AsyncStorage.getItem("configuracoes");
      const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");

      set({
        pagamentos: pagamentosSalvos ? JSON.parse(pagamentosSalvos) : [],
        configuracoes: configuracoesSalvas ? JSON.parse(configuracoesSalvas) : get().configuracoes,
        usuarioLogado: usuarioSalvo ? JSON.parse(usuarioSalvo) : null,
      });
    } catch (erro) {
      console.log("Erro ao carregar dados locais:", erro);
    } finally {
      set({ carregando: false });
    }
  },

  salvarTudo: async () => {
    const state = get();
    await salvarNoStorage("alunos", state.alunos);
    await salvarNoStorage("pagamentos", state.pagamentos);
    await salvarNoStorage("configuracoes", state.configuracoes);
    await salvarNoStorage("usuarioLogado", state.usuarioLogado);
  },
}));
