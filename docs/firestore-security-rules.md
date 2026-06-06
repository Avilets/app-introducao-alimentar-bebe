# Regras de Segurança do Firestore - Baby Grow

Para garantir a privacidade e a segurança das informações dos bebês, o banco de dados Firestore do **Baby Grow** deve utilizar regras de acesso rígidas. Essas regras impedem que usuários não autorizados leiam ou escrevam dados de terceiros.

## Regras Recomendadas para Produção

Copie e cole as seguintes regras na aba **Rules** do módulo **Firestore Database** no seu Firebase Console:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Bloqueia qualquer leitura/escrita na raiz global
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Regra específica para os dados privados e isolados por usuário
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Explicação Simples das Regras

1. `rules_version = '2';`: Habilita a versão mais recente e segura do interpretador de regras do Firestore.
2. `match /databases/{database}/documents`: Aplica as regras a todos os documentos dentro da base ativa.
3. `match /{document=**} { allow read, write: if false; }`: Define uma política de "bloqueio padrão". Qualquer coleção na raiz do banco que não seja explicitamente permitida será bloqueada.
4. `match /users/{userId}/{document=**}`: Mapeia todos os caminhos e subcoleções abaixo de `/users/{userId}/` (como `babies`, `feedings`, `sleepRecords`, `medications`, etc.).
5. `allow read, write: if request.auth != null && request.auth.uid == userId;`: Permite leitura (`read`) e escrita/alteração (`write`) **somente** se:
   - O usuário estiver autenticado no Firebase Auth (`request.auth != null`).
   - O identificador único do usuário logado corresponder exatamente à chave da pasta do banco de dados correspondente (`request.auth.uid == userId`).

---

## Passo a Passo para Configurar no Firebase Console

1. Abra o **[Firebase Console](https://console.firebase.google.com/)** e acesse seu projeto.
2. No menu lateral esquerdo, clique em **Build** ➔ **Firestore Database**.
3. No topo da tela do Firestore, selecione a aba **Rules** (Regras).
4. Substitua o editor de texto completo com as regras recomendadas acima.
5. Clique no botão azul **Publish** (Publicar) no canto superior direito.

---

## ⚠️ AVISO CRÍTICO: Nunca use regras abertas em Produção!

> [!CAUTION]
> * **Regras de Teste Expiram ou Vazam**: Configurações geradas no assistente inicial como `allow read, write: if true;` ou `allow read, write: if request.time < timestamp.date(2026, X, X);` deixam os dados do seu aplicativo abertos publicamente na internet. 
> * **Risco de Invasão e Cobranças**: Robôs varrem a internet em busca de chaves Firebase com regras abertas para roubar informações, apagar dados ou consumir recursos de forma maliciosa, gerando cobranças exorbitantes na sua conta Google Cloud.
> * **Rejeição na Play Store**: A Google Play Store audita a segurança do backend de aplicativos de maternidade e parentalidade e rejeita aplicações com regras abertas por risco à segurança de dados de menores.
