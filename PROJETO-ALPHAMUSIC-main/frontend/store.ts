import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Aluno {
  id: string;
  nome: string;
  valorMensalidade: number;
}

export interface Pagamento {
  id: string;
  aluno: string;
  valor: number;
  dataPagamento: string;
  meioPagamento: string;
  observacao: string;
}

let alunos: Aluno[] = [];
let pagamentos: Pagamento[] = [];
let listeners: Function[] = [];

export const carregarDados = async () => {
  try {
    const alunosSalvos = await AsyncStorage.getItem("@meus_alunos");
    const pagamentosSalvos = await AsyncStorage.getItem("@meus_pagamentos");
    if (alunosSalvos) alunos = JSON.parse(alunosSalvos);
    if (pagamentosSalvos) pagamentos = JSON.parse(pagamentosSalvos);
    notificarTodos();
  } catch (e) {
    console.log("Erro ao carregar dados", e);
  }
};

const salvarDados = async () => {
  try {
    await AsyncStorage.setItem("@meus_alunos", JSON.stringify(alunos));
    await AsyncStorage.setItem("@meus_pagamentos", JSON.stringify(pagamentos));
  } catch (e) {
    console.log("Erro ao salvar", e);
  }
};

export const getAlunos = () => [...alunos];
export const adicionarAluno = (novo: Aluno) => {
  alunos = [novo, ...alunos];
  salvarDados();
  notificarTodos();
};
export const removerAluno = (id: string) => {
  alunos = alunos.filter(a => a.id !== id);
  salvarDados();
  notificarTodos();
};

export const getPagamentos = () => [...pagamentos];
export const adicionarPagamento = (novo: Pagamento) => {
  pagamentos = [novo, ...pagamentos];
  salvarDados();
  notificarTodos();
};
export const removerPagamento = (id: string) => {
  pagamentos = pagamentos.filter(p => p.id !== id);
  salvarDados();
  notificarTodos();
};

const notificarTodos = () => listeners.forEach(fn => fn());

export const useStore = () => {
  const [, setContador] = useState(0);
  useEffect(() => {
    const atualizar = () => setContador(c => c + 1);
    listeners.push(atualizar);
    return () => { listeners = listeners.filter(l => l !== atualizar); };
  }, []);
  return { alunos: getAlunos(), pagamentos: getPagamentos() };
};