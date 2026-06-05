# Envio Automático de Notificações com GitHub Actions

Este documento descreve como configurar a execução em segundo plano para o disparo automático de notificações push no app **Rotina Alimentar Bebê** usando o **GitHub Actions** e o **Firebase Cloud Messaging (FCM)** sem custos (100% gratuito).

---

## 🚀 Como Funciona
Como o nosso aplicativo é um PWA (Progressive Web App), o navegador restringe a execução de códigos complexos em segundo plano quando o aplicativo é fechado para economizar bateria. 

Para contornar essa limitação de forma gratuita:
1. Um workflow do **GitHub Actions** roda silenciosamente em segundo plano a cada 15 minutos.
2. Ele executa o script `scripts/sendDueReminders.cjs`.
3. O script lê a lista de usuários e remetentes no **Cloud Firestore**.
4. Se houver algum lembrete ativo com o horário vencido (`nextDueAt <= agora`), ele envia um alerta push via **FCM** para todos os celulares cadastrados por aquele usuário.
5. Em seguida, o script atualiza o lembrete (avançando o agendamento em timers ou lembretes diários e desativando lembretes únicos) para evitar envios duplicados.

---

## ⚙️ Configuração Passo a Passo

### 1. Gerar a Conta de Serviço (Service Account) no Firebase
O script precisa de credenciais administrativas para gerenciar o envio de push e ler o Firestore com segurança.
1. Acesse o **[Firebase Console](https://console.firebase.google.com/)**.
2. Abra o seu projeto do bebê (`rotina-alimentar-bebe-ba885`).
3. No menu lateral esquerdo, clique na **Engrenagem** (Configurações do Projeto) ao lado de "Visão geral do projeto".
4. Vá na aba **Contas de Serviço** (Service Accounts).
5. Certifique-se de que a opção **Node.js** está selecionada e clique no botão **Gerar nova chave privada** (Generate new private key).
6. Confirme clicando em **Gerar chave**. Um arquivo `.json` contendo as chaves privadas será baixado no seu computador.
   * ⚠️ **ATENÇÃO: Mantenha este arquivo em segredo absoluto. Nunca salve este arquivo dentro da pasta do projeto e nunca faça commit dele no GitHub!**

---

### 2. Configurar os Segredos (Secrets) no GitHub
Agora você precisa salvar essas credenciais nas variáveis secretas do repositório no GitHub para que o Actions possa acessá-las sem expô-las publicamente.
1. Acesse o seu repositório no GitHub: `https://github.com/Avilets/app-introducao-alimentar-bebe`.
2. Clique na aba **Settings** (Configurações) no topo direito do repositório.
3. No menu lateral esquerdo, sob a seção "Security", clique em **Secrets and variables** -> **Actions**.
4. Na aba **Repository secrets**, clique no botão **New repository secret** (Novo segredo de repositório).
5. Crie dois segredos com os seguintes nomes e valores:

| Nome do Segredo | Valor do Segredo |
| :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT` | Abra o arquivo `.json` que você baixou no passo anterior, copie **todo** o conteúdo de texto (incluindo as chaves `{}`) e cole neste campo. |
| `FIREBASE_PROJECT_ID` | Cole o ID do seu projeto do Firebase (ex: `rotina-alimentar-bebe-ba885`). |

---

### 3. Como Executar o Workflow Manualmente (Para Teste)
Você não precisa esperar 15 minutos para testar se as notificações estão saindo.
1. No seu repositório no GitHub, clique na aba **Actions** no topo.
2. No menu esquerdo, clique em **Envio Automático de Lembretes** (ou no nome do workflow correspondente).
3. À direita, você verá uma barra com o botão **Run workflow** (Executar workflow).
4. Clique no botão, selecione a branch `main` e clique no botão verde **Run workflow**.
5. Recarregue a página e clique no job em execução para acompanhar os logs detalhados linha a linha.

---

### 4. Como Conferir os Logs e Verificar Erros
Nos logs do GitHub Actions, o script imprime detalhadamente o fluxo de execução para auditoria:
* O número de usuários processados.
* Quantos lembretes vencidos foram disparados.
* Quantos tokens FCM receberam a notificação e se houve alguma falha.
* Se algum token inválido/expirado foi desativado automaticamente no banco de dados.

---

## ⚠️ Limitações Importantes

1. **Atraso de Execução do GitHub Actions (Delay):**
   * O GitHub Actions executa tarefas em máquinas virtuais compartilhadas gratuitamente. O agendamento cron do Actions (configurado para rodar a cada 15 minutos) **não tem garantia de precisão exata ao minuto**.
   * O job pode demorar de 2 a 10 minutos a mais para iniciar dependendo da fila de processamento global do GitHub. Portanto, um lembrete configurado para as 12:00 pode ser disparado por volta de 12:05 a 12:12.

2. **Não Substitui um Aplicativo Nativo:**
   * Esta solução gratuita baseada em web PWA e servidor de background externo é excelente para contornar bloqueios de bateria, mas **não substitui um aplicativo Android/iOS nativo**.
   * Aplicativos nativos utilizam componentes do sistema como o `AlarmManager` ou `WorkManager` para agendar e disparar bipes sonoros locais no segundo exato configurado, mesmo sem conexão à internet.
