# Geração do Aplicativo Android (APK) via Capacitor

Este documento descreve como preparar o ambiente, abrir o projeto no **Android Studio**, compilar o arquivo **APK** de teste/debug e instalá-lo diretamente no seu **Galaxy S25**.

---

## 🛠️ Pré-requisitos
Para compilar o aplicativo nativamente, você precisará instalar as ferramentas de desenvolvimento do Google no seu computador:

1. **Instalar o Android Studio:**
   * Baixe e instale a versão mais recente do [Android Studio](https://developer.android.com/studio).
   * Durante a instalação, mantenha marcadas as opções padrão para instalar o **Android SDK**, **Android SDK Platform** e o **Android Virtual Device** (emulador).
2. **Instalar o Java Development Kit (JDK):**
   * O Android Studio geralmente já vem com o JDK embutido, então não é necessário instalar separadamente.

---

## 📂 Abrindo o Projeto no Android Studio
Após a instalação do Android Studio:
1. Abra o **Android Studio**.
2. Clique em **Open** (Abrir projeto existente).
3. Navegue até a pasta do seu projeto e selecione a subpasta **`android`** (que foi gerada pelo Capacitor) e clique em **OK**.
4. O Android Studio começará a baixar os componentes de compilação (Gradle) necessários para o projeto. *Isso pode demorar alguns minutos na primeira vez.*

---

## 📱 Gerando o Arquivo APK de Teste (Debug)
Para criar o arquivo instalável no seu celular:
1. No menu superior do Android Studio, vá em **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
2. O Android Studio começará a compilar o projeto.
3. Quando a compilação terminar, uma notificação aparecerá no canto inferior direito. Clique no link azul **locate** que aparece na notificação.
4. O gerenciador de arquivos do seu computador abrirá diretamente na pasta onde o APK foi salvo.
   * O caminho padrão do arquivo é: 
     `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Transferindo e Instalando no Galaxy S25
Como não estamos publicando na Google Play Store, você precisará instalar o arquivo de forma manual:

1. **Transferir o arquivo:**
   * Envie o arquivo `app-debug.apk` para o seu celular. Você pode fazer isso conectando o cabo USB, enviando pelo Google Drive, enviando para si mesmo no WhatsApp, ou via Quick Share.
2. **Permitir Fontes Desconhecidas:**
   * No seu Galaxy S25, abra o aplicativo de arquivos (ou o WhatsApp/Drive onde salvou o arquivo) e clique sobre o arquivo `app-debug.apk`.
   * O sistema do Android exibirá um aviso de segurança informando que a instalação de fontes desconhecidas está bloqueada.
   * Clique em **Configurações** na própria janela de aviso e ative o botão para permitir a instalação a partir do aplicativo de onde você abriu o arquivo (ex: "Permitir desta fonte" para o WhatsApp ou Meus Arquivos).
3. **Instalar:**
   * Volte e clique em **Instalar**. Em poucos segundos, o ícone do aplicativo estará na sua gaveta de aplicativos.

---

## ⚠️ Limitações Importantes do App Empacotado (Capacitor)

### 1. Notificações Push (FCM)
* **O que funciona:** Alertas locais disparados em tempo real enquanto o aplicativo está aberto.
* **O que NÃO funciona:** O **FCM Web SDK** (Service Workers) não é suportado na WebView interna do Capacitor no Android. Notificações push vindas de servidores externos (com o app totalmente fechado) **não serão recebidas no APK atual**.
* **Como resolver em produção:** Para receber notificações push nativas com o app fechado no Android, será necessário futuramente substituir as chamadas web de FCM pelo plugin nativo do Capacitor, como o `@capacitor-firebase/messaging`, e configurar o arquivo `google-services.json` dentro da pasta nativa do Android.

### 2. Autenticação (Firebase Auth)
* **O que funciona:** O login por E-mail e Senha funciona perfeitamente, pois roda localmente via requisições REST seguras.
* **O que requer atenção:** Métodos de login por redirecionamento de terceiros (como Google Sign-In via pop-up) não funcionam diretamente em WebViews sem plugins nativos de autenticação.
* **Domínios Autorizados:** Garanta que `localhost` esteja na lista de domínios autorizados no painel do Firebase Authentication (geralmente já vem por padrão).

---

## 🔄 Fluxo de Desenvolvimento (Atualizando o App)
Sempre que você alterar o código no React/Vite e quiser atualizar o aplicativo Android:
1. Rode o comando no terminal do projeto:
   ```bash
   npm run android:build
   ```
   *(Este comando gera a pasta `dist` atualizada e copia os arquivos automaticamente para dentro do projeto Android).*
2. No Android Studio, basta gerar o APK novamente clicando em **Build -> Build APK(s)**.

---

## 📦 Diferença entre APK Debug e Release
* **APK Debug (`app-debug.apk`):** É assinado com uma chave de teste padrão do Google. É ideal para desenvolvimento e testes rápidos no celular, mas não pode ser enviado para a Play Store.
* **APK Release:** É otimizado para desempenho, menor em tamanho e assinado com uma chave privada de produção que você mesmo gera (Keystore). É a versão oficial para publicação.
