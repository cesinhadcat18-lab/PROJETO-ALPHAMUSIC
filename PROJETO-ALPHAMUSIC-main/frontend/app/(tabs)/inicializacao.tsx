import { useEffect } from "react";
import { useStore } from "./store";

export default function Inicializacao() {

  const carregarDados = useStore(state => state.carregarDados);

  useEffect(() => {
    // ✅ Carrega todos os dados salvos quando o app abre
    carregarDados();
  }, []);

  // Não mostra nada na tela, só executa a função
  return null;
}