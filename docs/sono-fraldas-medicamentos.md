# Documentação: Sono, Fraldas e Medicamentos (Baby Grow)

Este documento descreve o funcionamento técnico e de interface dos módulos de **Sono**, **Fraldas** e **Medicamentos** integrados ao aplicativo **Baby Grow**.

---

## 1. Módulo de Sono (Sleep)

O módulo de sono permite registrar o tempo de descanso do bebê de duas formas:
1. **Cronômetro ativo (tempo real)**: O usuário toca em "Iniciar Soneca" ou "Iniciar Sono Noturno", iniciando um cronômetro associado a um registro sem horário de término. Um banner interativo "Maya está dormindo..." é exibido na tela principal (Hoje) e na própria tela de Sono com um contador progressivo. Ao clicar em "Acordou!", o término é registrado e a duração é calculada em minutos.
2. **Registro manual**: O usuário insere a data, hora de início, hora de término (opcional), local e notas em um formulário modal.

### Dados Armazenados (Firestore)
* **Coleção**: `users/{userId}/sleepRecords/{id}`
* **Estrutura**:
  ```typescript
  interface SleepRecord {
    id?: string;
    babyId: string;
    sleepType: 'soneca' | 'sono noturno';
    startDateTime: string; // YYYY-MM-DDTHH:MM local
    endDateTime?: string; // YYYY-MM-DDTHH:MM local
    durationMinutes?: number;
    location: 'berço' | 'colo' | 'carrinho' | 'cama compartilhada' | 'outro';
    notes?: string;
    createdAt: number;
    updatedAt: number;
  }
  ```

### Gráfico SVG
* A tela de sono exibe um gráfico de barras nativo desenhado via SVG para os últimos 7 dias. O gráfico calcula a soma de minutos de sono por dia, normaliza os valores com base no dia de maior duração e exibe etiquetas dinâmicas.

---

## 2. Módulo de Fraldas (Diapers)

O módulo de fraldas permite registrar a higiene do bebê, gerando estatísticas diárias e monitoramento de saúde básica.

### Dados Armazenados (Firestore)
* **Coleção**: `users/{userId}/diaperRecords/{id}`
* **Estrutura**:
  ```typescript
  interface DiaperRecord {
    id?: string;
    babyId: string;
    diaperType: 'xixi' | 'cocô' | 'xixi e cocô' | 'seca';
    datetime: string; // YYYY-MM-DDTHH:MM local
    stoolColor?: string; // Cor das fezes (se cocô/misto)
    stoolConsistency?: 'líquida' | 'pastosa' | 'normal' | 'dura' | 'outro';
    notes?: string;
    createdAt: number;
    updatedAt: number;
  }
  ```

### Funcionalidades Especiais
* **Formulário Dinâmico**: Os campos "Cor do Cocô" e "Consistência" só são exibidos quando o tipo de fralda selecionado contiver cocô (ou seja, `cocô` ou `xixi e cocô`).
* **Alerta de Dehidratação**: Se o bebê passar mais de **6 horas** sem um registro de fralda que contenha xixi (`xixi` ou `xixi e cocô`), um banner de alerta vermelho pisca no topo da tela de fraldas:
  > *Alerta de Hidratação: O bebê não tem registro de xixi nas últimas 6 horas. Verifique se ele está se alimentando/hidratado adequadamente. Se o sintoma persistir, consulte um pediatra.*
* **Aviso Médico**: Um aviso estático é exibido no rodapé da tela:
  > *Este registro ajuda na organização da rotina e não substitui avaliação do pediatra.*

---

## 3. Módulo de Medicamentos (Medications)

O módulo de medicamentos monitora doses receitadas e registra sua aplicação.

### Dados Armazenados (Firestore)
* **Coleção**: `users/{userId}/medications/{id}`
* **Coleção**: `users/{userId}/medicationLogs/{id}` (Histórico de doses administradas)

### Regras de Frequência e Lembretes Automáticos
Ao cadastrar ou atualizar um medicamento ativo, o `medicationService.ts` calcula os horários de aplicação recomendados com base nas regras:
* **Dose única**: Gera um lembrete fixo diário às 08:00 (não-repetitivo).
* **Horários fixos**: Permite listar horários exatos separados por vírgula (ex: `08:00, 14:00, 20:00`).
* **A cada X horas**: Divide as 24 horas pelo intervalo (ex: a cada 6 horas gera 4 lembretes por dia: 08:00, 14:00, 20:00, 02:00).
* **X vezes ao dia**: Distribui as doses ao longo do dia comercial (ex: 3 vezes ao dia distribui às 08:00, 14:00, 20:00).

O serviço então **apaga lembretes antigos** vinculados a este remédio (`medicationId`) e cria **novos registros de lembrete diário** na coleção de `users/{userId}/reminders` com o tipo `'medicamento'`. Desativar ou excluir o medicamento limpa os lembretes do banco automaticamente.

### Controles de Registro
* Cada remédio exibe um indicador da **Próxima Dose** sincronizado com os alarmes agendados.
* Um botão rápido de "Registrar Dose" abre um modal confirmando o status da administração:
  - **Administrado**: Remédio dado no horário.
  - **Atrasado**: Remédio dado após o horário.
  - **Pulado**: A dose foi pulada/esquecida.
* **Aviso Médico Importante**:
  > *Use medicamentos somente conforme orientação médica. Este aplicativo apenas ajuda a lembrar e registrar as doses, e não deve ser utilizado como guia de automedicação.*

---

## 4. Integração na Tela Hoje, Histórico e Navegação

* **Hoje**: Centraliza os contadores rápidos das fraldas trocadas, as horas de sono do dia atual, o banner dinâmico de sono ativo e o card de lembrete com a hora do próximo remédio. O timeline lista mamadas, frutas, refeições, trocas de fralda, sono e medicações de forma combinada cronologicamente.
* **Histórico**: Adiciona abas de filtro interativo dedicadas para "Sono", "Fraldas" e "Remédios".
* **Navegação**: Reorganizada em 5 guias centrais: Hoje, Alimentar, Sono, Fraldas, e Mais. A guia "Mais" expande para uma lista detalhada de ferramentas secundárias (Medicamentos, Vacinas, Crescimento, Histórico, Lembretes e Ajustes).
