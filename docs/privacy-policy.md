# Política de Privacidade - Baby Grow

Sua privacidade é muito importante para nós. Esta Política de Privacidade explica de forma simples, transparente e direta como o aplicativo **Baby Grow** coleta, utiliza, armazena e protege os dados do seu bebê.

## 1. Quais dados o aplicativo coleta?
O **Baby Grow** é um diário para auxiliar pais e cuidadores na rotina dos bebês. Coletamos apenas as informações necessárias fornecidas voluntariamente por você:
- **Dados cadastrais**: Seu endereço de e-mail (usado para autenticação de conta).
- **Perfil do bebê**: Nome, data de nascimento, gênero e foto de perfil opcional.
- **Registros de alimentação**: Amamentação (duração/lado), consumo de fórmulas, frutinhas e refeições (ingredientes, quantidade, consistência, aceitação e reações alérgicas ou físicas).
- **Registros de rotina**: Horários de início e fim de sono, trocas de fralda (tipo de sujeira, cor e consistência das fezes) e dosagens de medicamentos.
- **Registros de saúde e evolução**: Medições de crescimento (peso, comprimento, perímetro cefálico), calendário de vacinas aplicadas e anotações para consulta pediátrica.
- **Dados técnicos**: Tokens de notificação push (para que possamos enviar alertas de lembretes que você mesmo programar).

## 2. Por que os dados são salvos?
Salvamos seus registros para que você possa:
- Visualizar históricos e relatórios de alimentação, sono e saúde de forma organizada.
- Compartilhar relatórios estruturados com o pediatra do seu bebê.
- Acompanhar gráficos de curvas de crescimento (peso, comprimento, perímetro) cruzados com a tabela de percentil da OMS.
- Receber alertas automatizados sobre os horários de mamadas, medicamentos e vacinas pendentes.

## 3. Onde os dados são armazenados?
- **Modo Nuvem (Firebase)**: Seus dados são salvos nos servidores seguros do Google Firebase (Firestore Database) e protegidos por regras de segurança que garantem que apenas a sua conta autenticada tenha acesso a eles.
- **Modo Convidado (Local)**: Se optar por utilizar o modo de demonstração/convidado, os dados serão salvos exclusivamente no armazenamento local do seu próprio celular (LocalStorage) e nenhuma informação será transmitida para a nuvem.

## 4. Segurança e Isolamento dos Dados
- **Isolamento Total**: Todos os dados privados são estruturados sob o caminho `users/{userId}/...`. Criptografamos o tráfego de dados e aplicamos regras de segurança para que um usuário nunca consiga acessar ou modificar dados de outro usuário.
- **Não salvamos senhas**: A autenticação é gerenciada pelo serviço Firebase Auth. Não temos acesso à sua senha em texto claro.

## 5. Ferramentas de Analytics e Rastreamento de Terceiros
- **Ausência de Analytics**: O **Baby Grow** não utiliza Google Analytics, Firebase Analytics ou qualquer outra ferramenta terceirizada de rastreamento de comportamento, publicidade ou remarketing. Respeitamos o seu direito de usar um aplicativo livre de rastreadores.

## 6. Controle dos seus Dados (Exportação e Exclusão)
Acreditamos que os dados são inteiramente seus. Você tem controle total e pode acessar a qualquer momento a seção "Privacidade e dados" nas Configurações para:
- **Exportar todos os dados**: Baixar um arquivo estruturado no formato JSON contendo todos os dados do seu bebê cadastrados no app.
- **Excluir conta e dados definitivamente**: Excluir permanentemente todos os registros do banco de dados na nuvem e deletar a sua conta de autenticação de forma irreversível.

## 7. Isenção de Responsabilidade Médica e Limitações do Aplicativo
- **Importante**: O **Baby Grow** é um aplicativo de apoio à rotina e organização familiar. As informações de crescimento, alimentação e vacinação têm caráter estritamente educativo. O aplicativo **não substitui** o acompanhamento médico de um pediatra ou outro profissional de saúde.
- **Limitações do Aplicativo**: O aplicativo serve estritamente para o registro e organização da rotina e diário do bebê. O Baby Grow não realiza qualquer análise clínica, diagnósticos de saúde, prescrição de medicamentos ou indicação de dosagens.

## 8. Contato e Suporte
Se tiver alguma dúvida sobre a privacidade de seus dados ou desejar obter suporte, entre em contato através do e-mail:
[INSERIR E-MAIL DE SUPORTE]

