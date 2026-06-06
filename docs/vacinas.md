# Acompanhamento de Vacinas (Vacinas do Bebê)

Esta seção descreve a funcionalidade de acompanhamento vacinal integrada ao **Baby Grow**. A ferramenta foi desenvolvida para ajudar os pais no monitoramento de vacinas recomendadas e personalizadas, com lembretes locais inteligentes.

## Funcionalidades Principais

1. **Calendário Recomendado Integrado**:
   - Baseado no **Calendário Nacional de Vacinação do SUS (atualizado para 2026)** e complementações da **SBP (Sociedade Brasileira de Pediatria)** e **SBIm (Sociedade Brasileira de Imunizações)**.
   - Cobre marcos de idade essenciais: Ao nascer, 2 meses, 3 meses, 4 meses, 5 meses, 6 meses, 9 meses, 12 meses, 15 meses e 4 anos.
   - Classificação das vacinas por rede (SUS, Particular ou Ambas).

2. **Registro de Doses Aplicadas**:
   - Formulário para registrar: Data da aplicação, Local/Clínica/Posto, Lote da vacina, Reações adversas observadas (como febre, inchaço local, irritabilidade) e Observações livres.
   - Histórico permanente com a possibilidade de desfazer (excluir) um registro incorreto.

3. **Lembretes e Alertas (Notificações)**:
   - Permite agendar alertas em datas e horários específicos para doses futuras pendentes ou atrasadas.
   - Os alertas são integrados com o sistema nativo de notificações locais (Capacitor Local Notifications) e identificados com o emoji de seringa `💉` no título do lembrete.
   - Ao marcar uma vacina como aplicada, qualquer lembrete de alerta ativo correspondente é desativado de forma automática.

4. **Vacinas Personalizadas (Manuais)**:
   - Permite adicionar vacinas extras que não constam no calendário padrão.
   - Suporta a configuração de **doses recorrentes** (ex: vacina de Influenza anual ou Meningocócica B em múltiplas etapas), gerando automaticamente as doses subsequentes nos intervalos estipulados de dias ou meses.

## Estrutura de Dados e Firestore

Os dados de vacinação são armazenados nas subcoleções do usuário no Firestore (ou localmente no `localStorage` quando no modo de demonstração offline):

### Registros de Vacinação Aplicada (`vaccineRecords`)
Caminho: `users/{userId}/vaccineRecords/{recordId}`
```typescript
interface VaccineRecord {
  id?: string;
  babyId: string;
  vaccineId: string;           // ID da vacina padrão ou ID da personalizada
  vaccineName: string;         // Nome amigável
  dose: string;                // Ex: "1ª Dose", "Dose Única"
  recommendedAgeMonths: number;
  recommendedDate: string;     // Formato YYYY-MM-DD
  applied: boolean;
  appliedDate: string;         // Formato YYYY-MM-DD
  location?: string;
  batchNumber?: string;        // Número do lote
  clinic?: string;             // Clínica ou Posto de saúde
  reaction?: string;           // Reações adversas registradas
  notes?: string;              // Observações gerais
  source: string;              // Ex: "SUS" ou "Particular"
  createdAt: number;
  updatedAt: number;
}
```

### Vacinas Customizadas / Calendários Personalizados (`customVaccines`)
Caminho: `users/{userId}/customVaccines/{customId}`
```typescript
interface CustomVaccine {
  id?: string;
  babyId: string;
  vaccineName: string;
  dose: string;
  recommendedAgeMonths: number;
  recommendedDate: string;
  type: 'sus' | 'particular' | 'custom';
  diseasesPrevented?: string;
  notes?: string;
  repeatDose: boolean;
  intervalValue?: number;
  intervalUnit?: 'days' | 'months';
  dosesCount?: number;
  createdAt: number;
  updatedAt: number;
}
```

## Aviso Médico Legal (Disclaimer)

⚠️ **Importante**: O aplicativo serve como uma ferramenta de auxílio e organização para os pais. A base de dados recomendada tem caráter estritamente educativo e informativo. O **cartão oficial de vacinação (físico ou no ConecteSUS)** e as orientações fornecidas pelo pediatra e pelo posto de saúde devem sempre prevalecer sobre quaisquer dados contidos no aplicativo.
