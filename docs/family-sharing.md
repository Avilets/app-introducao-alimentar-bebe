# Compartilhamento Familiar (Family Sharing)

Esta documentação descreve o funcionamento, configuração e testes da funcionalidade de **Compartilhamento Familiar** no aplicativo **Baby Grow**. A funcionalidade permite que pais, mães e cuidadores compartilhem o acompanhamento da rotina e histórico do bebê em tempo real.

---

## 1. Arquitetura de Coleções

Para permitir o acesso multiusuário, a estrutura do banco de dados Firestore foi modificada do modelo antigo (`users/{userId}/...`) para um modelo centralizado por família (`families/{familyId}/...`).

```mermaid
graph TD
    users[users/{userId}] -->|perfil e activeFamilyId| familyId(families/{familyId})
    familyId --> members[members/{userId}]
    familyId --> invites[invites/{inviteId}]
    familyId --> babies[babies/{babyId}]
    familyId --> logs[rotina / subcoleções: feedings, sleep, diapers, etc.]
```

### Coleção Global de Busca de Convites
* `familyInvites/{inviteCode}`: Contém a associação entre o código do convite (ex: `BG-A1B2C3`) e a ID da família, e-mail de destino e expiração. Usado para validação instantânea sem expor IDs internas do Firestore.

---

## 2. Divisão de Papéis e Permissões

| Permissão / Recurso | Admin | Cuidador | Leitura |
| :--- | :---: | :---: | :---: |
| Visualizar rotina, sono, fraldas, etc. | ✅ Sim | ✅ Sim | ✅ Sim |
| Criar ou editar registros de rotina | ✅ Sim | ✅ Sim | ❌ Não |
| Excluir registros de rotina | ✅ Sim | ✅ Sim | ❌ Não |
| Editar o perfil/cadastro do bebê | ✅ Sim | ✅ Sim | ❌ Não |
| Gerar e enviar convites de compartilhamento | ✅ Sim | ❌ Não | ❌ Não |
| Alterar papel de outro membro ou revogar convite | ✅ Sim | ❌ Não | ❌ Não |
| Remover membros da família | ✅ Sim | ❌ Não | ❌ Não |
| Migrar dados legados | ✅ Sim | ❌ Não | ❌ Não |
| Excluir a família e todos os dados | ✅ Sim | ❌ Não | ❌ Não |

---

## 3. Fluxo de Convites

### 1. Criando um Convite
1. Um usuário com papel **Admin** acessa **Configurações** ➔ **Família e Compartilhamento**.
2. Na seção **Convidar Novo Membro**, insere o e-mail do convidado, escolhe o papel desejado (`cuidador` ou `leitura`) e define se o código de convite é de uso restrito ao e-mail informado.
3. O app gera um código alfanumérico seguro com formato `BG-XXXXXX` (ex: `BG-RF2E7A`).
4. O Admin pode copiar e compartilhar o código com o convidado por WhatsApp, e-mail, etc.

### 2. Aceitando o Convite
1. O convidado faz login no Baby Grow com seu próprio e-mail e senha.
2. Acessa **Configurações** ➔ **Família e Compartilhamento**.
3. Na seção **Aceitar Convite**, insere o código `BG-XXXXXX` recebido e clica em **Validar Código**.
4. O app verifica o código, valida se não expirou (validade de 7 dias) e se o e-mail corresponde à restrição, se houver.
5. Em caso de sucesso, o e-mail do convidado é vinculado à nova família com a permissão atribuída e seu perfil atualiza em tempo real para visualizar as informações do bebê compartilhado.

---

## 4. Migração de Contas Legadas

Para usuários antigos que já utilizavam o aplicativo antes da implementação do compartilhamento familiar, os dados ficam armazenados sob seu ID de usuário anterior (`users/{userId}`). 

### Como Migrar:
1. Ao fazer login e acessar **Configurações**, o app detectará se o usuário é um administrador que ainda não migrou seus registros.
2. Será exibido o botão laranja **"Migrar meus dados para família"**.
3. Ao clicar, o aplicativo executará uma cópia em lotes (batch operations) de todas as subcoleções (mamadas, sono, vacinas, fraldas, etc.) para as subcoleções correspondentes dentro do documento da família ativa, preservando os mesmos IDs dos documentos para evitar duplicados.
4. Após o sucesso da cópia, o perfil do usuário recebe a flag `migrationToFamilyCompleted: true` para que o botão não seja mais exibido.

---

## 5. Como Testar Localmente (Modo Convidado)

Para fins de testes rápidos sem necessidade de conexão com o Firebase, o **Modo Convidado** (`pais.demo@rotinabebe.com.br`) simula as principais funções:
- O usuário simulado é definido como **Admin**.
- É carregada uma base mock com registros de mamadas, sono e crescimento.
- A tela de gerenciamento de membros exibe uma lista fictícia de familiares (Pai, Mãe, Babá) com seus respectivos papéis.
- Permite simular a criação de novos convites e a validação fictícia na interface.
