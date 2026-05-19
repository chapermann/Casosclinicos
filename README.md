# 🩺 Organizador de Round e Casos Clínicos — Projeto Prompts Poderosos

[![GitHub](https://img.shields.io/badge/GitHub-chapermann-emerald?style=flat-square&logo=github)](https://github.com/chapermann)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-purple?style=flat-square&logo=vite)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.5_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)

Este repositório contém a ferramenta profissional para estruturação e organização de prontuários médicos desenvolvida para a conta de GitHub [chapermann](https://github.com/chapermann). 

O sistema foi desenhado especificamente sob o escopo do **Projeto Prompts Poderosos** para mitigar de forma automatizada e metódica os tradicionais entraves do ambiente hospitalar:
1. Passagem de caso clínico no round de médicos e médicos residentes.
2. Troca de informações clínicas no plantão de entrada e saída.
3. Padronização e organização de notas desestruturadas no prontuário eletrônico.
4. Triagem e entrega de dados sumarizados de alta relevância para a diretoria do hospital.

---

## 🚀 Funcionalidades Principais

* **Evolução de Caso para Round Diário (11 Tópicos)**: Transcreve rascunhos verbais desordenados em uma estrutura clínica extremamente formal contendo identificação, motivo de internação, condições cirúrgicas, comorbidades, situação atual (sedativos, bombas, ventilação mecânica, exame físico), gasometria arterial, exames laboratoriais/imagem, antibiótico em uso (com cálculo de tempo de uso), sumário de diagnóstico e condutas médicas.
* **Calculadora de Score de Internação em Enfermaria**: Automatiza o cálculo das 10 questões de transferência do paciente para a enfermaria clínica, aplicando acréscimo estatístico ou penalidades rígidas de pontos. O sistema permite ao médico alternar livremente as respostas em tempo real, recalculando a situação instantaneamente.
* **Detecção de Associações Clínicas Saborosas (Regra 10)**: Aponta correlações de sinais e sintomas não explicitamente elencados pela conduta da equipe médica, sem intervir diretamente em receituário ativo de acordo com as normas médicas.
* **Design Fiel e Confiabilidade Sem Cache (Estritamente Stateless - Regra 1)**: Não armazena nem registra dados sensíveis de pacientes ou profissionais na memória, garantindo total conformidade com a LGPD e privacidade do paciente do hospital.
* **Uso Universal TXT (Regra 4)**: De acordo com este regulamento protocolar do Centro Médico, o sumário estruturado é exibido estritamente em bloco de texto puro corrida TXT. Sem colunas ricas, sem tabelas e sem arquivos de download ricos (como PDF, DOCX/DOC), garantindo 100% de aceitação em qualquer editor simplificado de prontuários médicos estaduais.

---

## 🧮 Tabela de Pontuação para Alta (Cli. Médica)

O robô sugere preliminarmente e calcula em tempo real os seguintes critérios:

| ID | Pergunta Clínica | Se Sim | Se Não |
|---|---|---|---|
| **1** | Alta pelas especialidades cirúrgicas? | `+1 ponto` | `-1 ponto` |
| **2** | Ausência de condições potencialmente cirúrgicas? | `+1 ponto` | `-1 ponto` |
| **3** | Encontra-se respirando em ar ambiente? | `+1 ponto` | `-1 ponto` |
| **4** | Suplementação de oxigênio em baixíssimo fluxo? | `+1 ponto` | `-2 pontos` |
| **5** | Encontra-se completamente lúcido? | `+1 ponto` | `-1 ponto` |
| **6** | Se não lúcido, encontra-se estável hemodinamicamente? | `+1 ponto` | `-2 pontos` |
| **7** | Encontra-se totalmente sem queixas álgicas hoje? | `+1 ponto` | `-1 ponto` |
| **8** | Alta recente ou já esteve na clínica médica? | `+2 pontos` | `-1 ponto` |
| **9** | Doença clínica crônica atual compensada? | `+1 ponto` | `-1 ponto` |
| **10** | Doença requer atenção de alguma especialidade? | `+1 ponto` | `-2 pontos` |

### Análise Preliminar do Resultado:
* **Pontuação < 5**: Não está em condições de alta hospitalar enfermaria.
* **Pontuação de 5 a 8**: Provavelmente ainda não elegível para alta de enfermaria.
* **Pontuação de 9 a 10**: Provável indicação de alta médica.
* **Pontuação > 10**: Alta médica segura e imediata para Enfermaria de Clínica Médica!

---

## 🛠️ Tecnologias Utilizadas

O projeto conta com uma arquitetura robusta Full-Stack:
1. **Front-end**: React 19 executado via Vite 6, estilizado com Tailwind CSS v4, animado com micro-interações via Framer Motion, e iconografia por Lucide React.
2. **Back-end Server**: Servidor Express.js rodando em Node.js com TypeScript, gerenciado na fase de desenvolvimento por `tsx`.
3. **Mecanismo de Inteligência Artificial**: Chamadas tratadas no servidor com o SDK oficial `@google/genai` utilizando o modelo `gemini-3.5-flash` para analisar as anotações médicas cruas e predeterminar os formulários de forma rápida e segura.

---

## ⚙️ Como Executar Localmente

### Pré-requisitos
* Node.js v18 ou superior instalado.
* Uma chave de API do Gemini configurada.

### Instalação de dependências e configuração
1. Clone o repositório para sua máquina local:
   ```bash
   git clone https://github.com/chapermann/organizador-round-medico.git
   cd organizador-round-medico
   ```
2. Instale as dependências padrão:
   ```bash
   npm install
   ```
3. Renomeie o arquivo `.env.example` para `.env` e coloque sua chave de API do Google Gemini:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere..."
   ```

### Rodando o Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor Express rodará integrado com o middleware do Vite para servir hot reloading dinâmico de assets do React em `http://localhost:3000`.

### Compilando para Produção
O comando de build compila os arquivos do client React e gera um bundle condensado otimizado em CommonJS para o servidor Express em `dist/server.cjs`:
```bash
npm run build
```

Para inicializar a versão compilada em seu contêiner de Cloud Run ou Docker:
```bash
npm run start
```

---

## 🩺 Licença

Este projeto é desenvolvido e distribuído sob a Licença Apache-2.0. Consulte o arquivo de licença ou metadados para obter mais informações. 

Desenvolvido para organizar o cotidiano do centro médico e otimizar vidas no hospital por [chapermann](https://github.com/chapermann). No Projeto Prompts Poderosos.
