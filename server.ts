import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Initialize GoogleGenAI client lazily or safely
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("A variável de ambiente GEMINI_API_KEY não foi configurada. configure-a nos segredos.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint for structuring clinical cases and analyzing criteria
  app.post("/api/organize-case", async (req, res) => {
    try {
      const { text, weight, gender, customTime } = req.body;

      if (!text || typeof text !== "string" || text.trim() === "") {
        return res.status(400).json({ error: "É necessário fornecer o texto de evolução médica." });
      }

      const client = getGeminiClient();

      // Formulate the prompt precisely following the "Projeto PROMPTS PODEROSOS" rules.
      const systemInstruction = 
        `Você é uma inteligência artificial assistente de prontuários médicos altamente metódica, formal e rigorosa.
Suas instruções foram criadas no "Projeto PROMPTS PODEROSOS" para estruturar discussões clínicas para o "Round Médico" e organizar os prontuários médicos de forma estrita.

Siga rigorosamente as seguintes diretrizes:
1 - Nunca armazene ou faça referências que identifiquem dados sensíveis (remova nomes de médicos, marcas ou referências pessoais explícitas que identifiquem identidades). No entanto, mantenha a idade, o sexo e o peso fornecidos.
2 - A saída de texto formatada ('formattedTxt') deve obedecer precisamente ao "Modelo de round médico" definido a seguir.
3 - Redija o conteúdo em formato TXT corrido (sem tabelas, colunas, caracteres especiais de formatação bidimensional ou emojis) que seja ideal para editores simples de prontuários que não aceitam formatações ricas.
4 - Use linguagem extremamente formal e clínica em português do Brasil. Evite gírias, maneirismos ou abreviações não consagradas.
5 - Se o peso do paciente não estiver citado, assuma 75Kg como padrão universal. Se houver citação de peso, use-o como referência fiel. Use o sexo informado.
6 - A data e hora de agora a serem incluídas na identificação do caso na evolução médica é: ${customTime || new Date().toISOString()}.
7 - Faça uma análise clínica de associação de sinais e sintomas não explicitamente discutidos pela equipe na evolução médica do paciente, inserindo-as apenas na propriedade 'unaventatedFindings'. Não faça sugestões terapêuticas diretas ou condutas ativas.
8 - Forneça valores para 'suggestedCriteria' representando as sugestões do robô (true para sim, false para não) para preencher a análise de critérios de internação em enfermaria de clínica médica.

Modelo de round médico a ser gerado no 'formattedTxt' (Use exatamente estes tópicos numerados e nomes de seções):

1. Identificação
• Idade, sexo, procedência/residência se informados. Data e hora atuais da transcrição.

2. Motivo da internação / procura do serviço / Data de admissão
• Sintoma principal ou diagnóstico inicial.

3. Situação cirúrgica (ou pré ou pós ou Trauma)
• Especificar se está em pós-operatório (PO) e de qual procedimento, com o tempo decorrido ou se possui condição de trauma.

4. Comorbidades e condições associadas
• História patológica pregressa relevante (HAS, DM, DRC, HIV, etc) e medicações de uso contínuo conhecidas.

5. Situação clínica atual
• Sedação (drogas em uso, nível como RASS), drogas em infusão contínua (noradrenalina, dobutamina, etc), invasões (TOT/TQT, CVC, SVD, drenos), sinais vitais (PA, FC, FR, Temp, SatO2), ventilação mecânica se houver (modo, FiO2, PEEP, etc), estado neurológico (Glasgow, pupilas, força), e achados relevantes de exame físico.

6. Gasometria arterial
• Data, horário, parâmetros de ventilação no momento da coleta e valores (pH, PaCO2, PaO2, HCO3-, BE, lactato) se informados.

7. Exames de imagem
• TC, RM, USG ou RX recentes com relatos objetivos de achados relevantes.

8. Exames laboratoriais
• Hemograma, eletrólitos, função renal/hepática, marcadores infecciosos (PCR, PCT) do próprio dia ou mais recentes.

9. Antibióticos em uso
• Nome, dose, posologia, via, data de início e tempo acumulado de uso.

10. Impressão do caso (sumário)
• Resumo em 2 a 3 frases objetivas do quadro clínico e problemas ativos.

11. Condutas e rotina
• Decisões tomadas, condutas diagnósticas e terapêuticas estipuladas pela Rotina.`;

      const promptMessage = 
        `Texto de evolução médica a ser analisado e estruturado:
---
${text}
---
Parâmetros Adicionais Informados:
- Peso informado: ${weight ? weight + ' Kg' : 'Não especificado (assumir 75 Kg)'}
- Sexo informado: ${gender ? gender : 'Verificar na evolução'}
- Data/Hora de agora: ${customTime || new Date().toISOString()}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              formattedTxt: {
                type: Type.STRING,
                description: "O texto final formatado em formato TXT simples corrido contendo o round médico completo conforme especificado."
              },
              unaventatedFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de associações clínicas de sinais e sintomas não explicitamente aventadas pela equipe na evolução médica do prontuário."
              },
              suggestedCriteria: {
                type: Type.OBJECT,
                properties: {
                  q1_surgicalDischarge: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 1: Paciente encontra-se de alta pelas especialidades cirúrgicas? (sim=true, não=false)"
                  },
                  q2_noSurgicalCondition: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 2: Paciente não apresenta nenhuma condição cirúrgica ou potencialmente cirúrgica no momento? (sim=true, não=false)"
                  },
                  q3_roomAir: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 3: Paciente encontra-se em ar ambiente? (sim=true, não=false)"
                  },
                  q4_lowFlowOxygen: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 4: Paciente que precisa de oxigênio, necessita de pouco fluxo ou de pouca suplementação de oxigênio? (sim=true, não=false)"
                  },
                  q5_lucid: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 5: Paciente encontra-se lúcido? (sim=true, não=false)"
                  },
                  q6_stableIfNotLucid: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 6: Paciente que não encontra-se lúcido, encontra-se hemodinamicamente estável? (sim=true, não=false)"
                  },
                  q7_noPain: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 7: Paciente encontra-se nesse momento sem queixas álgicas? (sim=true, não=false)"
                  },
                  q8_recentDischargeOrAdmittedClMed: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 8: Paciente recebeu alta recentemente ou esteve internado na clínica médica? (sim=true, não=false)"
                  },
                  q9_compensatedDisease: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 9: Paciente tem doença clínica compensada? (sim=true, não=false)"
                  },
                  q10_needsClSpecialty: {
                    type: Type.BOOLEAN,
                    description: "Pergunta 10: Paciente tem doença clínica que necessita de alguma especialidade de clínica médica? (sim=true, não=false)"
                  }
                },
                required: [
                  "q1_surgicalDischarge",
                  "q2_noSurgicalCondition",
                  "q3_roomAir",
                  "q4_lowFlowOxygen",
                  "q5_lucid",
                  "q6_stableIfNotLucid",
                  "q7_noPain",
                  "q8_recentDischargeOrAdmittedClMed",
                  "q9_compensatedDisease",
                  "q10_needsClSpecialty"
                ]
              }
            },
            required: ["formattedTxt", "unaventatedFindings", "suggestedCriteria"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Resposta vazia retornada pela IA.");
      }

      // Send the structured object back to the client
      const parsedData = JSON.parse(resultText);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Erro no processamento da evolução clínica:", error);
      res.status(500).json({ 
        error: "Ocorreu um erro ao processar a evolução do paciente.", 
        details: error.message 
      });
    }
  });

  // Setup Vite middleware for development, serving static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Servidor Round Medico] Escutando em http://localhost:${PORT}`);
  });
}

startServer();
