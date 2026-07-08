# 🩺 Painel de Gestão Clínica — Projeto Prompts Poderosos

[![GitHub](https://img.shields.io/badge/GitHub-chapermann-blue?style=flat-square&logo=github)](https://github.com/chapermann)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![NVIDIA](https://img.shields.io/badge/NVIDIA-AI_Inference-green?style=flat-square&logo=nvidia)](https://build.nvidia.com/)

Ferramenta web especializada na estruturação de prontuários médicos, auditoria clínica automatizada e otimização da comunicação médica interna para unidades de emergência e terapia intensiva. 

O sistema foi desenhado especificamente sob o escopo do **Projeto Prompts Poderosos** para mitigar de forma automatizada e metódica os tradicionais entraves do ambiente hospitalar: prontuários mal escritos, perda de informações na transição de turnos e falta de padronização.

---

## 🚀 Funcionalidades Principais

* **Painel Visual de Ocupação**: Monitoramento em tempo real de **11 leitos de Sala Vermelha (SV)** e **6 leitos de Retaguarda do Trauma (RT)**. Botões com luzes indicadoras sinalizam visualmente se a evolução médica diária daquele leito já foi processada (Verde) ou está pendente (Vermelho).
* **Evolução Estruturada para Round Médico**: Lê anotações médicas desorganizadas e gera o `MODELO_ROUND_MEDICO.txt` seguindo rigorosamente uma sequência linear de 11 tópicos formais (Identificação, Tempo de Internação, Situação Cirúrgica, Comorbidades, Situação Clínica Atual, Gasometria, Imagem, Laboratório, Antibioticoterapia com tempo de uso, Impressão e Condutas).
* **Passagem de Plantão Ultra Objetiva**: Cria o `MODELO_PASSAGEM_PLANTAO.txt`, um texto fluido focado na comunicação ágil de médico para médico, limitado rigidamente entre **100 e 120 palavras**[cite: 2]. Inicia obrigatoriamente padronizado com: `Iniciais do Nome, XX anos, Localização (SV/RT Leito X).`[cite: 2].
* **Tradução de Abreviações e Termos Técnicos**: Possui uma inteligência clínica capaz de ler, interpretar e expandir automaticamente dezenas de abreviações médicas comuns (ex: CNO2, PC/PS, VIG, RNC, TOT, IH) para garantir clareza documental[cite: 1, 2].
* **Conversão Ética para CID-10**: Atendendo rigidamente ao Código de Ética Médica e à proteção de dados, diagnósticos sensíveis ou estigmatizantes (como HIV, AIDS, Câncer, Tuberculose ou tentativas de auto-extermínio) são automaticamente convertidos para seus respectivos códigos de CID-10 no texto final[cite: 2].
* **Calculadora Automática de Alta para Enfermaria**: Avalia em tempo real 10 critérios clínicos de elegibilidade para transferência do paciente para a enfermaria de clínica médica, aplicando scores positivos ou penalidades matemáticas de forma transparente.
* **Gerenciador Dinâmico de Modelos (.md)**: Aba de configurações em tela que permite à chefia ou equipe médica editar, incluir ou remover perguntas do Checklist Diário e dos Critérios de Alta sem precisar alterar uma única linha de código fonte.
* **Privacidade Absoluta (Stateless - Regra 1)**: O sistema não armazena dados em servidores externos ou banco de dados em nuvem. As informações ficam salvas apenas na memória temporária do navegador (`localStorage`) e expiram/são destruídas automaticamente a cada 12 horas.
* **Saída Exclusiva em Texto Corrido (TXT - Regra 4)**: Resultados exibidos e baixados puramente em formato `.txt` linear simples. Sem tabelas, sem colunas e sem caracteres especiais ASCII, garantindo 100% de compatibilidade com qualquer editor rudimentar de prontuário eletrônico hospitalar.

---

## 🧮 Tabela de Pontuação para Alta (Cli. Médica)

O sistema calcula automaticamente o score com base nas respostas marcadas no formulário (`[ ] sim` / `[ ] não`):

| ID | Pergunta Clínica | Se Sim | Se Não |
|---|---|---|---|
| **1** | Paciente encontra-se de ALTA pelas especialidades cirúrgicas? | `+1 ponto` | `-1 ponto` |
| **2** | Paciente não apresenta nenhuma condição cirúrgica ou potencialmente cirúrgica no momento? | `+1 ponto` | `-1 ponto` |
| **3** | Paciente encontra-se em ar ambiente? | `+1 ponto` | `-1 ponto` |
| **4** | Paciente que precisa de oxigênio, necessita de pouco fluxo (até 5L/min) ou de pouca suplementação? | `+1 ponto` | `-1 ponto` |
| **5** | Paciente encontra-se lúcido? | `+1 ponto` | `-1 ponto` |
| **6** | Paciente que não encontra-se lúcido, encontra-se hemodinamicamente estável? | `+1 ponto` | `-1 ponto` |
| **7** | Paciente encontra-se nesse momento sem queixas álgicas? | `+1 ponto` | `-1 ponto` |
| **8** | Paciente recebeu alta recentemente ou esteve internado na clínica médica? | `-1 ponto` | `+1 ponto` |
| **9** | Paciente tem doença clínica descompensada? | `+1 ponto` | `-1 ponto` |
| **10** | Paciente tem doença clínica de especialidade que tenha no Hospital? | `+1 ponto` | `-1 ponto` |

### Análise Preliminar do Resultado:
* **Pontuação < 5**: Provavelmente não está de alta para enfermaria de clínica médica.
* **Pontuação de 5 a 8**: Provavelmente está de alta para a enfermaria de clínica médica, reavaliar cuidadosamente.
* **Pontuação > 8**: Provavelmente está de alta para a enfermaria de clínica médica.

---

## 🛠️ Arquitetura e Tecnologias

Buscando máxima velocidade de carregamento, simplicidade de uso e facilidade de implantação em infraestruturas hospitalares limitadas, o projeto foi construído em arquitetura de **Arquivo Único (Serverless & Client-Side)**:

1. **Interface e Lógica (Front-end)**: Um único arquivo autônomo `index.html` contendo estrutura HTML5, estilização via CSS nativo e reatividade em JavaScript Vanila puro. Sem dependências de compilação ou frameworks pesados.
2. **Processamento de IA (Back-end)**: Integração via chamadas de API assíncronas para a API de Inferência da NVIDIA, utilizando o modelo de linguagem de larga escala `openai/gpt-oss-120b` (Llama/DeepSeek de alta performance).
3. **Roteamento de Segurança**: Tráfego intermediado através de regras de proxy via Cloudflare Workers corporativo (`https://nvidia-api-proxy.chapermann.workers.dev/`) para contornar problemas de restrição e CORS em navegadores de estações clínicas.

---

## ⚙️ Como Executar e Implantar

Por ser uma aplicação baseada inteiramente no lado do cliente (Client-Side), **não existe processo de instalação ou pré-requisitos de servidor (como Node.js, Docker ou Python)**.

### Execução Local Imediata
1. Baixe o arquivo `index.html` deste repositório.
2. Dê duplo clique no arquivo em qualquer computador. Ele abrirá instantaneamente em qualquer navegador moderno (Chrome, Edge, Safari) pronto para uso.

### Configuração Inicial (Primeiro Uso)
1. Abra o aplicativo.
2. No canto superior direito, clique no botão **⚙ Configurações do Sistema**.
3. Insira sua chave de acesso pessoal da NVIDIA (`NVIDIA API KEY`) no campo correspondente.
4. Clique em **Salvar Configurações**. A chave ficará armazenada com segurança na sessão do seu navegador e o processamento clínico estará liberado.

---

## 🩺 Licença e Créditos

Este projeto é desenvolvido e distribuído sob a Licença Apache-2.0.

Desenvolvido para organizar o cotidiano do centro médico, otimizar a comunicação linear e salvar vidas no ecossistema hospitalar por [chapermann](https://github.com/chapermann) dentro do escopo do **Projeto Prompts Poderosos**.
