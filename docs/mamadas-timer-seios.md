# Lembretes, Cronômetro e Registro de Amamentação por Seio

Esta documentação descreve o funcionamento, a modelagem de dados e a interface do sistema de **Cronômetro e Registro de Mamada por Seio** no **Baby Grow**.

---

## 1. Funcionamento do Cronômetro por Seio

Na tela de mamada (para os tipos **Leite Materno** e **Misto**), o aplicativo exibe o card **Cronômetro de Mamada** com dois contadores independentes para cada seio (Esquerdo e Direito).

### Controles Disponíveis:
- **Iniciar/Pausar**: Permite iniciar a contagem do tempo para o seio correspondente.
- **Trocar Lado**: Pausa imediatamente o cronômetro do seio ativo e inicia a contagem no seio oposto de forma instantânea, facilitando a transição com apenas um toque.
- **Finalizar**: Pausa a contagem daquele seio.
- **Zerar (Ícone Reset)**: Limpa os contadores de ambos os seios após confirmação.

### ⚠️ Regras de Negócio e Validação:
1. **Exclusão Mútua**: Os dois cronômetros nunca rodam simultaneamente. Ao iniciar um lado, o outro é pausado caso esteja ativo.
2. **Preenchimento Automático do Lado (`breastSide`)**:
   - Apenas seio esquerdo ativo/com tempo > 0: `left`
   - Apenas seio direito ativo/com tempo > 0: `right`
   - Ambos os seios com tempo > 0: `both`
   - Nenhum seio com tempo: `null`
3. **Duração Total (`durationMinutes`)**: Salva o tempo total das mamadas (soma dos segundos de ambos os lados) convertido em minutos e formatado com uma casa decimal (ex: `16.5 min`).
4. **Validação ao Salvar**: O app impede salvar uma mamada sem tempo e sem observações, a menos que o usuário confirme explicitamente.

---

## 2. Ajuste Manual de Duração (Edição e Alternativa)

Tanto na criação de um registro quanto ao editar uma mamada existente, o usuário pode selecionar a aba **Manual**:
- Permite que o usuário digite os minutos e segundos de amamentação de cada seio diretamente nos campos de texto.
- O tempo total e o lado (`breastSide`) são recalculados automaticamente em tempo real à medida que os números mudam.
- Útil para quando os pais esquecem de iniciar o cronômetro e querem registrar os tempos estimados da mamada.

---

## 3. Estrutura e Modelagem de Dados no Firestore

Os registros de mamada são armazenados na subcoleção `feedings` da família ativa:
`families/{familyId}/feedings/{feedingId}`

Campos adicionais gravados para mamadas no peito:
```typescript
{
  type: "breast" | "mixed",
  datetime: "2026-06-06T08:00", // Data e hora local
  breastSide: "left" | "right" | "both" | null,
  leftBreastDurationSeconds: number, // Duração em segundos no seio esquerdo
  rightBreastDurationSeconds: number, // Duração em segundos no seio direito
  totalBreastDurationSeconds: number, // Soma das durações em segundos
  durationMinutes: number, // totalBreastDurationSeconds / 60
  startedAt?: number, // Timestamp Unix (ms) de início do timer
  endedAt?: number, // Timestamp Unix (ms) de encerramento do timer
  amountMl?: number, // Presente no tipo "mixed" (fórmula)
  notes?: string
}
```

---

## 4. Persistência de Sessão do Timer

O cronômetro possui persistência inteligente local (`localStorage`):
- Se o usuário navegar para outras telas (como olhar a Vacina ou Sono) ou o navegador recarregar temporariamente, o estado do cronômetro é mantido ativo.
- Caso o aplicativo seja fechado completamente em segundo plano, o cronômetro detectará na reinicialização o tempo decorrido usando o timestamp do último disparo, retomando a contagem de onde parou.

---

## 5. Como Testar a Funcionalidade

1. **Acessar a Tela de Mamada**:
   - Vá em **Hoje** ➔ clique em **Mamada** (ícone da mamadeira).
2. **Registro Rápido (Começar Agora)**:
   - Clique em **"Começar mamada agora ⏱️"** no topo da tela. O horário se definirá como o atual e o cronômetro do seio esquerdo iniciará automaticamente.
3. **Alternar Lados**:
   - Com o seio esquerdo rodando, clique em **"Trocar Lado"**. Verifique se o esquerdo é pausado e o direito começa a contar instantaneamente.
4. **Modo Manual**:
   - Alterne para a aba **Manual**. Digite `10` minutos e `30` segundos para o esquerdo, e `5` minutos para o direito. Confirme que a duração total indica `15m 30s`.
5. **Visualizar nas Telas**:
   - Salve a mamada. Na tela **Hoje**, veja que o card de Mamadas indica o resumo correto (ex: `Última: leite materno, 15 min, esquerdo e direito`).
   - Na linha do tempo e no histórico, verifique se a descrição exibe a divisão: `Leite materno — 15.5 min total: esquerdo 10 min, direito 5 min`.
6. **Editar Registro**:
   - Clique no ícone de lápis (Editar) no histórico ou linha do tempo. Mude os valores na aba Manual, clique em **Atualizar** e verifique se a timeline se atualiza em tempo real.

---

## 6. Como Gerar Novo APK

Para testar o cronômetro no seu celular físico Android (como o Galaxy S25):
1. Compile a versão web de produção:
   ```bash
   npm run build
   ```
2. Sincronize os assets web com o projeto Android nativo:
   ```bash
   npx cap sync android
   ```
3. Abra o Android Studio e compile o novo APK:
   - Menu: **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
   - Instale o arquivo `app-debug.apk` gerado no celular.
