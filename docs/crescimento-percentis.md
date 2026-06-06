# Acompanhamento de Crescimento do Bebê - Documentação

Esta nova funcionalidade do aplicativo **Baby Grow** permite aos pais acompanharem de perto o ganho de peso, comprimento/altura e perímetro cefálico (opcional) do bebê, comparando as medições com a curva de referência da **Organização Mundial da Saúde (OMS / WHO)** para crianças de 0 a 24 meses.

---

## 📋 Como Registrar Medidas

1. **Acessar a Tela de Crescimento**:
   - Clique no ícone **"Crescimento"** (representado por um gráfico de linha ascendente `TrendingUp`) na barra de navegação inferior.
   - Alternativamente, na tela inicial ("Hoje"), clique em **"Registrar Primeira Medida"** (ou **"Ver Gráficos"** se já possuir dados).

2. **Inserir uma Medição**:
   - Clique em **"Registrar Medidas"** no canto superior direito da aba *Histórico*.
   - Preencha os seguintes campos:
     - **Data da Medição** (não permite datas futuras ou anteriores ao nascimento do bebê).
     - **Peso** (em kg, ex: `7.25`).
     - **Comprimento / Altura** (em cm, ex: `65.5`).
     - **Perímetro Cefálico** (em cm, opcional, ex: `42`).
     - **Observações** (opcional, para relatar consultas ou sintomas).
   - Clique em **"Salvar"**.

3. **Editar ou Excluir uma Medição**:
   - Na aba **Histórico**, localize o registro que deseja alterar.
   - Clique no ícone de lápis para editar ou no ícone de lixeira para excluir (será solicitada uma confirmação antes da remoção).

---

## 🧮 Como os Percentis são Calculados

Os percentis são calculados com base nas tabelas oficiais de crescimento infantil da **Organização Mundial da Saúde (OMS) de 0 a 24 meses**, separadas por sexo (menino e menina). 

### 1. Interpolação de Curvas de Referência
Como as tabelas oficiais fornecem valores para meses inteiros (0, 1, 2, 3... 24), o aplicativo calcula a idade exata do bebê em dias no momento da medição e interpola linearmente os limites de referência para os percentis **P3**, **P15**, **P50**, **P85** e **P97** correspondentes àquela idade em dias.

### 2. Cálculo do Percentil
A partir das curvas interpoladas, o aplicativo compara o valor inserido e calcula o percentil aproximado do bebê através do seguinte algoritmo de aproximação linear:
- **Abaixo de P3**: O bebê está abaixo do peso ou altura típicos para a idade e sexo.
- **Entre P3 e P97**: O bebê está na faixa esperada de desenvolvimento saudável. A mediana exata é representada por **P50**.
- **Acima de P97**: O bebê está acima da curva média para a idade e sexo.

---

## ⚠️ Limitações e Segurança Médica

> [!WARNING]
> **AVISO IMPORTANTE DE SEGURANÇA**
> Os percentis exibidos são estimativas educativas baseadas em curvas de referência estatística e **NÃO** substituem a avaliação clínica de um pediatra. O aplicativo não gera diagnósticos médicos, não classifica o bebê como "doente" ou "saudável" e não emite alertas de forma alarmista. Sempre converse com o pediatra sobre o crescimento e ganho de peso do seu bebê.

---

## 📂 Estrutura de Banco de Dados no Firestore

Cada registro de crescimento é salvo no banco de dados Firestore no seguinte caminho:
`users/{userId}/growthRecords/{growthRecordId}`

Estrutura JSON do documento:
```json
{
  "babyId": "baby-1",
  "date": "2026-06-06",
  "ageInDays": 206,
  "weightKg": 7.5,
  "lengthCm": 66.2,
  "headCircumferenceCm": 42.5,
  "notes": "Maya está ótima na consulta.",
  "createdAt": 1780708300000,
  "updatedAt": 1780708300000
}
```

### Como testar no Firebase Console:
1. Faça login na sua conta no app (modo nuvem).
2. Acesse a aba **Crescimento** e adicione uma medição.
3. Abra o **[Firebase Console](https://console.firebase.google.com/)**, selecione seu projeto e abra o **Firestore Database**.
4. Verifique se a coleção `growthRecords` apareceu dentro do documento do seu usuário em `users/{userId}`.

---

## 📲 Como Gerar o Novo APK e Testar

Sempre que fizermos alterações nas telas ou no código React, precisamos regerar o build web e sincronizá-lo com o projeto nativo do Android antes de abrir o Android Studio:

1. **Gere o Build e Sincronize com o Capacitor**:
   ```bash
   npm run android:build
   ```
   *Este comando compilará o React com o Vite em produção (`dist/`) e atualizará a pasta nativa `android/`*.

2. **Compilar o APK no Android Studio**:
   - Se o Android Studio estiver fechado, abra-o ou rode:
     ```bash
     npm run android:open
     ```
   - No menu superior, clique em: **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
   - Aguarde o término e clique em **"locate"** no aviso do canto inferior direito para pegar o arquivo `app-debug.apk` atualizado.
   - Instale-o no celular para testar!
