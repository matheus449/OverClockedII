# Plano de Implementação: Falência da Empresa (Game Over) e Reset Geral de Progresso

Implementação do fluxo de **Falência da Empresa / Demissão do TI (Game Over)** quando o jogador ficar endividado (`pontos < 0` ou sem saldo para o café mais barato) e sem energia suficiente para continuar trabalhando (`energia <= 0`), além do botão de **Reset Geral** que zera pontuação, medalhas, chamados e reverte todas as roupas/acessórios comprados para os itens iniciais padrão, reiniciando o primeiro turno com 100% de energia e 0 pontos.

---

## 1. Regras de Negócio e Condições de Gatilho

1. **Condição de Falência (Game Over Automático)**:
   - Acontece quando a **energia chega a 0%** E o saldo de pontos é menor que o menor café disponível (30 pts para Café Coado) ou está negativo (`pontos < 30`).
   - Nesse estado, o jogador está matematicamente impossibilitado de recuperar energia pela cafeteria e não tem energia para resolver chamados no escritório.
   - A empresa entra em colapso / vai à falência e o funcionário é dispensado.

2. **Apresentação e Narrativa na Tela de Game Over**:
   - Apresentação visual limpa, imersiva e corporativa em modo paisagem.
   - Mensagem clara comunicando o encerramento das atividades da empresa e desejando boa sorte no próximo emprego:
     > *"A Overclocked Solutions faliu! O setor de TI acumulou prejuízos insustentáveis, o café acabou e não restou energia para manter os servidores no ar. Agradecemos seus serviços e desejamos muito sucesso em seu próximo emprego!"*
   - Exibição das estatísticas da carreira encerrada (chamados atendidos, pontuação final negativa e medalhas que foram conquistadas).
   - Botão de ação primário destacado: **"Iniciar Nova Carreira (Reset Geral)"**.

3. **Efeito do Reset Geral de Progresso**:
   - Reseta `points` para `0`.
   - Reseta `energy` para `100`.
   - Reseta `resolvedCount` para `0`.
   - Reseta `unlockedMedals` para `[]`.
   - Reseta `purchasedOutfitIds` para apenas o uniforme inicial padrão (`['uniforme_ti']`).
   - Reseta `purchasedAccessoryIds` para os acessórios padrão (`['nenhum_acessorio']`).
   - Reseta a customização para o uniforme padrão.
   - Limpa chamados ativos e histórico de problemas recentes.
   - Grava o estado limpo no `localStorage` via `resetSaveData()`.
   - Direciona o jogador imediatamente para o início do turno de trabalho com 100% de energia e 0 pontos prontinho para atender novos chamados.

---

## 2. Modificações Propostas

### A. Persistência & Funções de Limpeza
- **Arquivo**: `src/persistence/storage.ts`
  - Criar e exportar a função `resetSaveData()` que restaura o `localStorage` estritamente para o estado virgem (`DEFAULT_SAVE`).

- **Arquivo**: `src/progression/progressionSystem.ts`
  - Adicionar helper puro `isCompanyBankrupt(energy: number, points: number, minCoffeeCost: number): boolean`.
  - Exportar helper para reiniciar compras de vestuário e customização aos valores iniciais.

### B. Interface de Usuário da Falência (GameOver Modal)
- **Arquivo**: `src/ui/GameOverBankruptcyModal.tsx` (novo componente)
  - Modal imersivo com tema corporativo (alerta sutil, paleta escura elegante com detalhes âmbar/vermelho corporativo sem poluição visual).
  - Texto oficial de falência e votos de sucesso no próximo emprego.
  - Resumo de métricas (Dívida acumulada / Pontos, Chamados concluídos, Causa: "Esgotamento técnico & Inadimplência na Cafeteria").
  - Botão principal: **"Recomeçar em Nova Empresa (Reset Geral)"**.

### C. Integração no `App.tsx`
- **Arquivo**: `src/App.tsx`
  - Monitorar esgotamento de energia: se `energy <= 0` e `points < 30`, pausar áudio ambiente, disparar o efeito de fade e transicionar o estado para `gameState = 'gameover'`.
  - Integrar `GameOverBankruptcyModal` no renderizador.
  - Implementar callback `handleBankruptcyReset()`:
    1. Chama `resetSaveData()`.
    2. Reseta todos os estados do React (`points = 0`, `energy = 100`, `resolvedCount = 0`, `unlockedMedals = []`, `purchasedOutfitIds = ['uniforme_ti']`, `purchasedAccessoryIds = ['nenhum_acessorio']`, etc.).
    3. Reinicia a fila de chamados técnicos.
    4. Muda `gameState` direto para `'playing'`, iniciando o turno imediatamente.
    5. Reinicia a trilha sonora ambiente (`background.mp3`).

---

## 3. Plano de Testes e Validação

1. **Testes Unitários Automatizados (`src/problems/validator.test.ts`)**:
   - Testar a função `isCompanyBankrupt`:
     - Deve retornar `true` quando `energy === 0` e `points < 30`.
     - Deve retornar `true` quando `energy === 0` e `points < 0` (endividado).
     - Deve retornar `false` quando `energy === 0` mas `points >= 30` (jogador ainda pode tomar café).
     - Deve retornar `false` quando `energy > 0` mesmo que com pontos negativos.
   - Testar o reset de vestuário e dados salvos:
     - Assegurar que após o reset, apenas `'uniforme_ti'` e `'nenhum_acessorio'` permaneçam como comprados.
   - Rodar `npx --yes tsx --test src/problems/validator.test.ts src/player/touchControls.test.ts`.

2. **Compilação e Verificação do Applet**:
   - Executar `compile_applet` para garantir TypeScript sem erros e bundle limpo.
