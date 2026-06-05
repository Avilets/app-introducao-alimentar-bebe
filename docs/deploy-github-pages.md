# Publicação no GitHub Pages (Deploy Automático)

Este documento descreve como ativar e gerenciar a publicação gratuita do aplicativo **Rotina Alimentar Bebê** no **GitHub Pages** com deploy automatizado via **GitHub Actions**.

---

## 🚀 Como Funciona
Sempre que você envia (`git push`) novas alterações para a branch `main` no GitHub, o workflow `.github/workflows/deploy-pages.yml` é disparado automaticamente. Ele:
1. Instala as dependências do projeto.
2. Compila a versão otimizada de produção (`npm run build`).
3. Envia os arquivos compilados (pasta `dist/`) para uma branch isolada chamada `gh-pages`.
4. O GitHub Pages serve esses arquivos sob o subdiretório `/app-introducao-alimentar-bebe/`.

---

## ⚙️ Ativação Manual no GitHub (Necessária na Primeira Vez)
Depois que o primeiro deploy rodar com sucesso, você precisará ativar o GitHub Pages nas configurações do seu repositório:
1. Acesse o seu repositório no GitHub: `https://github.com/Avilets/app-introducao-alimentar-bebe`.
2. Vá na aba **Settings** (Configurações) no menu superior.
3. No menu lateral esquerdo, sob a seção "Code and automation", clique em **Pages**.
4. Sob a seção **Build and deployment**:
   * Em **Source**, garanta que esteja selecionado **Deploy from a branch**.
   * Em **Branch**, selecione a branch **`gh-pages`** (gerada pelo workflow) e a pasta **`/ (root)`**.
   * Clique em **Save** (Salvar).
5. O link definitivo do seu app aparecerá no topo dessa página de configurações após alguns segundos! Ele terá o formato:
   `https://<seu-usuario>.github.io/app-introducao-alimentar-bebe/`
   *(No seu caso, como o repositório é da conta Avilets, o link será: `https://avilets.github.io/app-introducao-alimentar-bebe/`)*.

---

## 📲 Como Instalar o PWA no Celular (Ex: Galaxy S25)
Para rodar o aplicativo como se fosse um app nativo no seu Galaxy S25 com suporte total a notificações locais e de background:
1. Abra o navegador **Google Chrome** no celular.
2. Acesse o link publicado: `https://avilets.github.io/app-introducao-alimentar-bebe/`.
3. Faça o login na sua conta.
4. Clique nos **três pontinhos** (menu do Chrome) no topo direito.
5. Selecione a opção **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
6. Confirme a instalação. O ícone do aplicativo (com o rostinho do bebê e fundo suave) aparecerá na grade de aplicativos do seu celular.
7. Abra o app por esse ícone e ative as notificações na aba **Ajustes**.

---

## 🛠️ Solução de Problemas Comuns

### 1. Tela Branca após Publicação (Erro de Base Path)
* **Problema:** A página carrega, mas fica totalmente branca, e o console exibe erros do tipo `404` para os arquivos JavaScript/CSS.
* **Causa:** O Vite, por padrão, gera os caminhos dos arquivos assumindo a raiz do domínio (`/`). Como o GitHub Pages serve o app em uma subpasta (`/app-introducao-alimentar-bebe/`), os caminhos quebram.
* **Solução:** Nós já corrigimos isso configurando `base: '/app-introducao-alimentar-bebe/'` no `vite.config.ts`. Certifique-se de que essa propriedade nunca seja removida do arquivo de configurações.

### 2. O Aplicativo não Atualiza (Cache Agressivo do PWA)
* **Problema:** Você fez alterações no código, enviou para o GitHub, o deploy rodou, mas o celular continua mostrando a versão antiga.
* **Causa:** O Service Worker do PWA (`sw.js`) faz o cache dos arquivos localmente no celular para que o app funcione offline. Ele prioriza o cache e só atualiza quando detecta alterações no Service Worker.
* **Solução:**
  * No celular: feche totalmente o aplicativo, abra o navegador Chrome, acesse o link, deslize para baixo para atualizar, ou limpe o cache do site nas configurações do navegador.
  * No computador (para testes): abra a aba **Application** no DevTools (F12) -> **Service Workers** e marque **"Update on reload"** ou clique em **"Unregister"** para forçar o recarregamento dos novos arquivos.
