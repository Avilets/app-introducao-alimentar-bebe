# Regras de Segurança do Firestore - Compartilhamento Familiar

Para suportar a nova arquitetura de Compartilhamento Familiar no **Baby Grow**, as Regras de Segurança do Firestore devem ser atualizadas. As regras abaixo garantem o isolamento dos dados de cada família e impõem controle de acesso baseado nos papéis (`admin`, `cuidador`, `leitura`).

## Regras Completas para Produção

Copie e substitua as regras na aba **Rules** no Firebase Console pelo código abaixo:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Verifica se o usuário está logado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Verifica se o usuário é membro ativo da família
    function isMember(familyId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
    }

    // Helper: Retorna o papel (role) do usuário logado na família
    function getRole(familyId) {
      return get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role;
    }

    // Helper: Verifica se o usuário possui um papel específico
    function hasRole(familyId, role) {
      return isMember(familyId) && getRole(familyId) == role;
    }

    // 1. Bloqueio padrão para qualquer outra coleção na raiz
    match /{document=**} {
      allow read, write: if false;
    }

    // 2. Perfil dos Usuários (Isolado e privado por usuário)
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      
      // Permite migração de subcoleções de legado
      match /{allSubcollections=**} {
        allow read, write: if isAuthenticated() && request.auth.uid == userId;
      }
    }

    // 3. Busca Global de Convites (Verificação do código BG-XXXXXX)
    match /familyInvites/{inviteCode} {
      // Qualquer usuário autenticado pode ler ou atualizar o status do convite ao aceitá-lo
      allow read, create, update: if isAuthenticated();
      allow delete: if false; // Convites nunca devem ser excluídos diretamente do cliente
    }

    // 4. Estrutura de Famílias
    match /families/{familyId} {
      // Leitura da família permitida a qualquer membro
      allow read: if isMember(familyId);
      
      // Criação permitida a qualquer usuário autenticado (se definindo como owner)
      allow create: if isAuthenticated() && request.resource.data.ownerUserId == request.auth.uid;
      
      // Edição e exclusão da família restrita ao Admin
      allow update, delete: if hasRole(familyId, 'admin');

      // 4a. Membros da Família (Resolvido problema de bootstrap na criação e convites)
      match /members/{memberId} {
        // Qualquer membro ativo pode listar os outros membros
        allow read: if isMember(familyId);
        
        // Permite que o próprio usuário se crie na família (essencial para criação de família e aceitar convites)
        // ou que um administrador adicione/modifique membros.
        allow create: if isAuthenticated() && (request.auth.uid == memberId || hasRole(familyId, 'admin'));
        allow update: if hasRole(familyId, 'admin');
        
        // Admins podem remover membros, ou o próprio membro pode sair voluntariamente
        allow delete: if hasRole(familyId, 'admin') || (isAuthenticated() && request.auth.uid == memberId);
      }

      // 4b. Convites internos da Família
      match /invites/{inviteId} {
        // Apenas admins gerenciam a lista de convites internos
        allow read, write: if hasRole(familyId, 'admin');
      }

      // 4c. Registro do Bebê
      match /babies/{babyId} {
        allow read: if isMember(familyId);
        // Apenas admins e cuidadores podem alterar dados cadastrais do bebê
        allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador');
      }

      // 4d. Tokens de Notificação Push
      match /notificationTokens/{tokenId} {
        allow read: if isMember(familyId);
        // Cada usuário gerencia seu próprio token push associado ao dispositivo
        allow write: if isMember(familyId) && request.resource.data.userId == request.auth.uid;
      }

      // 4e. Registros de Rotina e Histórico (Mamadas, Sono, Fraldas, Medicamentos, Vacinas, Crescimento)
      match /feedings/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /fruits/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /meals/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /reminders/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /growthRecords/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /vaccineRecords/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /customVaccines/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /sleepRecords/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /diaperRecords/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /medications/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      match /medicationLogs/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
      
      // Anotações do Pediatra
      match /pediatrician/{id} { allow read: if isMember(familyId); allow write: if hasRole(familyId, 'admin') || hasRole(familyId, 'cuidador'); }
    }
  }
}
```

## Como Testar as Regras no Firestore Rules Playground

1. No Firebase Console, acesse **Firestore Database** -> aba **Rules**.
2. Clique no botão **Rules Playground** (canto superior direito).
3. Teste os seguintes cenários de acesso:
   - **Visualizar Bebê como Membro**: Faça uma requisição de leitura (`get`) para `/families/familia-teste/babies/bebe1` marcando a opção de usuário autenticado e passe um UID que exista na subcoleção `members`. Deve retornar **Success**.
   - **Modificar Registro como Leitor**: Faça um teste de escrita (`update`) para `/families/familia-teste/feedings/feed1` autenticado com UID cujo papel seja `leitura`. Deve retornar **Denied**.
   - **Excluir Família como Cuidador**: Faça um teste de exclusão (`delete`) na rota `/families/familia-teste` com papel `cuidador`. Deve retornar **Denied**.
