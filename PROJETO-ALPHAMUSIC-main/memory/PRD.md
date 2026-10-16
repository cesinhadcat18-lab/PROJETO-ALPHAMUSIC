# Gestão Musical — Product Requirements Document

## Overview
Aplicativo mobile completo para gestão de uma escola de música com um único professor/administrador (César). Centraliza alunos, aulas, financeiro, mensalidades PIX, calendário inteligente (5ª semana), feriados brasileiros (Sergipe/Itabaiana), e relatórios.

## Stack
- Expo React Native + Expo Router (file-based)
- FastAPI + MongoDB (motor)
- JWT auth (email/password, admin seed)
- Emergent managed push notifications
- Theme: Teal/Turquoise minimalista (light + dark)

## Auth
- Único usuário admin criado no seed via env vars
- Credenciais: cesar@escolamusica.com / Musica@2026

## Rotas
- `/login` — login
- `/(tabs)/index` — Dashboard
- `/(tabs)/students` — Lista/busca de alunos
- `/(tabs)/agenda` — Calendário mensal com aulas + feriados
- `/(tabs)/finance` — Cobranças por mês, filtros por status, cobrança PIX manual, registrar pagamento
- `/(tabs)/more` — hub
- `/student/[id]` — cadastro/edição de aluno (id="new" para novo)
- `/settings`, `/defaulters`, `/reports`, `/calendar-year`

## Regras de negócio
- Ao criar aluno: gera 3 meses de mensalidades e aulas do mês corrente automaticamente
- 5ª ocorrência do dia da semana identificada; regra por aluno (Recesso/Reposição/AulaAvulsa/AulaNormal/Outro)
- Feriados nacionais fixos + Carnaval/Páscoa/Sexta Santa/Corpus Christi calculados + Sergipe (08/07) + Itabaiana (24/10)
- Pagamento pendente vira "Atrasado" automaticamente após vencimento
- PIX: cobrança manual com dados salvos em Configurações + botão de compartilhamento WhatsApp (mensagem pré-formatada)
- Estrutura preparada para futuro webhook de confirmação automática

## Integrações
- **PIX**: Manual nesta primeira versão (compartilhamento WhatsApp + registrar pagamento). Estrutura preparada para Mercado Pago/Asaas/Efi via `/payments/{id}/register` (webhook).
- **Push**: Emergent managed relay (`/api/register-push` + `send_push`) — notifica pagamento recebido, prep para lembretes.

## Estado atual
- MVP funcional completo com todos os módulos principais.
- Push key placeholder — funcionalidade real ativa após deploy/publish.
