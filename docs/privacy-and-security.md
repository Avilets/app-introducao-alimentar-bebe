# Arquitetura de Privacidade e Segurança - Baby Grow

Este documento descreve a infraestrutura de conformidade de dados implementada no aplicativo **Baby Grow** para garantir a integridade das informações e cumprir as exigências da Google Play Store (Segurança de Dados) e leis como a LGPD.

## 1. Isolamento de Dados por Usuário
Todas as coleções e subcoleções que envolvem dados sensíveis do bebê e de rotina estão aninhadas estritamente sob o caminho do usuário autenticado no Firestore:

`/users/{userId}/...`

Isso inclui as seguintes subcoleções:
- `babies` (perfil)
- `feedings` (mamadas e água)
- `fruits` (frutinhas)
- `meals` (papinhas/refeições)
- `reminders` (lembretes diários e temporizados)
- `growthRecords` (peso, comprimento, perímetro cefálico)
- `vaccineRecords` (vacinas do calendário nacional aplicadas)
- `customVaccines` (vacinas adicionadas manualmente)
- `sleepRecords` (sono em andamento e histórico de sonecas)
- `diaperRecords` (trocas de xixi/cocô/seca)
- `medications` (remédios ativos cadastrados)
- `medicationLogs` (registros de doses aplicadas)
- `notificationTokens` (tokens de notificação push FCM vinculados ao aparelho)
- `pediatrician` (anotações de consulta do pediatra)

**Auditoria Concluída**: Não existem dados salvos em coleções de raiz global ou fora de `users/{userId}/`.

## 2. Controle Total do Usuário (Direitos LGPD / Play Store)
Nas Configurações, sob a área **Privacidade e dados**, o usuário dispõe de duas ferramentas cruciais de controle:

### A. Exportação de Dados
Permite que o usuário baixe um arquivo `.json` estruturado chamado `baby-grow-dados-YYYY-MM-DD.json` contendo todas as tabelas salvas.
- **Mascaramento de Segurança**: Chaves de API, senhas e tokens de notificação sensíveis são ocultados ou mascarados como `***MASKED_FOR_PRIVACY***` para evitar vazamentos acidentais no download.

### B. Exclusão Definitiva de Conta e Dados
Uma rotina que realiza a exclusão completa e irreversível:
1. Varre e apaga cada documento em todas as subcoleções sob `users/{userId}/`.
2. Apaga o registro administrativo do usuário no **Firebase Auth**.
3. Se a sessão for antiga e o Firebase exigir um login recente (por segurança), o aplicativo captura a exceção de forma amigável e orienta o usuário a fazer logout e login novamente para autorizar a operação.

## 3. Ausência de Analytics e Rastreamento de Terceiros
- O aplicativo **não importa** e **não utiliza** o SDK do Firebase Analytics (`getAnalytics`), Google Analytics, Pixel do Facebook ou ferramentas de tracking comportamental.
- Respeitamos a privacidade familiar: a rotina do bebê não deve ser rastreada para fins de publicidade.

## 4. Cuidados para Publicação na Google Play Store
Ao preencher a **Declaração de Segurança de Dados** no Google Play Console, declare:
1. **Coleta de Dados**: O aplicativo coleta dados de *Nome do bebê* (Informações Pessoais), *Data de nascimento* (Informações Pessoais), *E-mail* (Informações Pessoais) e *Registros de saúde* (peso, vacinas, alimentação).
2. **Finalidade**: Todos os dados coletados são usados exclusivamente para a funcionalidade básica do aplicativo (diário de rotina e lembretes).
3. **Compartilhamento**: Nenhum dado é compartilhado com terceiros.
4. **Exclusão de dados**: Os usuários podem solicitar a exclusão de seus dados diretamente dentro do próprio aplicativo na seção de Configurações, removendo tudo instantaneamente do Firestore e Auth.
5. **Criptografia em Trânsito**: Todos os dados são transmitidos por conexões seguras HTTPS/TLS.
