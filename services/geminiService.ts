
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

// O SDK exige process.env.API_KEY diretamente.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const cleanAIOutput = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/#/g, '')
    .replace(/`/g, '')
    .trim();
};

const SAINT_SPIRITUALITY: Record<string, string> = {
  acutis: "Carisma: Santidade no cotidiano digital e amor radical à Eucaristia. Títulos: 'Ciberapóstolo da Eucaristia', 'Original do Céu'.",
  michael: "Carisma: Vigilância, combate espiritual e proteção contra as ciladas do mal. Títulos: 'Sentinela do Arcanjo', 'Guerreiro da Luz'.",
  therese: "Carisma: A Pequena Via, confiança absoluta na misericórdia e atos de amor ocultos. Títulos: 'Pequena Flor da Misericórdia', 'Alma da Confiança'.",
  joseph: "Carisma: Silêncio operoso, fidelidade no trabalho ordinário e cuidado com a família. Títulos: 'Operário do Silêncio', 'Guardião do Lar'.",
  mary: "Carisma: Entrega total (Totus Tuus), pureza e imitação das virtudes marianas. Títulos: 'Escravo por Amor', 'Lírio de Maria'."
};

export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Santo: ${user.patronSaint}.` 
      : "Visitante buscando orientação.";

    const systemInstruction = `
      Você é um Diretor Espiritual Católico sábio, humilde e firme na sã doutrina.
      Sempre responda em Português do Brasil.
      Não use formatação Markdown (negrito, itálico com asteriscos).
      Seu tom é paternal e encorajador.
      Integre a espiritualidade do santo padroeiro do usuário em seus conselhos.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Paz e Bem. Como posso iluminar sua caminhada hoje?");
  } catch (error) {
    console.error("Erro no chat espiritual:", error);
    return "Um momento de recolhimento. Tente novamente em breve.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  const saintContext = SAINT_SPIRITUALITY[data.patronSaint || 'michael'] || "";
  
  const prompt = `
    Aja como um Diretor Espiritual. Crie uma REGRA DE VIDA personalizada para ${data.name}.
    
    PERFIL:
    - Estado: ${data.stateOfLife}
    - Ritmo: ${data.routineType}
    - Luta principal: ${data.primaryStruggle}
    - Almeja: ${data.spiritualGoal}
    - Santo Padroeiro: ${data.patronSaint} (${saintContext})

    ESTRUTURA TEMÁTICA:
    - Seg: Almas | Ter: Anjos | Qua: São José | Qui: Eucaristia | Sex: Paixão | Sáb: Maria | Dom: Ressurreição.

    REQUISITOS OBRIGATÓRIOS:
    1. Responda estritamente em PORTUGUÊS DO BRASIL.
    2. Cada dia da semana deve conter pelo menos UMA prática baseada diretamente no carisma de ${data.patronSaint}.
    3. Distribua 4 a 5 tarefas diárias (morning, afternoon, night).
    4. O campo "profileDescription" deve ser um título místico inspirado no santo do usuário (Ex: "Combatente de Miguel", "Pequena Flor de Lis").

    FORMATO JSON:
    {
      "profileDescription": "String",
      "routine": [
        { "title": "String", "description": "String", "detailedContent": "String", "xpReward": Number, "icon": "String", "timeOfDay": "String", "dayOfWeek": [Number], "actionLink": "String" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          systemInstruction: "Gere regras de vida católica em JSON. Use os carismas dos santos de forma criativa."
        }
    });

    const json = JSON.parse(response.text || '{}');
    const routine = (json.routine || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
        title: cleanAIOutput(item.title),
        description: cleanAIOutput(item.description)
    }));

    return { 
      routine, 
      profileDescription: cleanAIOutput(json.profileDescription || 'Peregrino da Fé') 
    };
  } catch (e) {
    console.error("Erro na geração da rotina:", e);
    return {
        profileDescription: "Peregrino de Cristo",
        routine: [
            { id: 'f1', title: 'Oração da Manhã', description: 'Consagrar o dia ao Senhor', xpReward: 15, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
            { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a voz do Mestre', xpReward: 25, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
            { id: 'f3', title: 'Exame de Consciência', description: 'Revisar o dia no amor', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
        ]
    };
  }
};

export const generateDailyReflection = async (saint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta e profunda de sabedoria católica em PORTUGUÊS. Sem Markdown.`,
    });
    return cleanAIOutput(response.text || "Deus é amor.");
  } catch { return "Caminhe na paz de Cristo."; }
};

export const generateDailyTheme = async (gospel?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este Evangelho em 5 palavras em PORTUGUÊS: ${gospel || 'Amor de Deus'}`,
    });
    return cleanAIOutput(response.text || "Santidade Diária");
  } catch { return "Santidade Diária"; }
};

export const generateLiturgicalDailyTopic = async (day: number, season: string): Promise<DailyTopic> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Crie um desafio prático católico em PORTUGUÊS para o dia ${day} do tempo de ${season}. Retorne JSON com title, description, scripture, actionType, actionContent.`,
            config: { responseMimeType: 'application/json' }
        });
        const data = JSON.parse(response.text || '{}');
        return {
            day,
            title: cleanAIOutput(data.title),
            description: cleanAIOutput(data.description),
            isCompleted: false,
            isLocked: false,
            actionType: data.actionType || 'GENERIC',
            actionContent: cleanAIOutput(data.actionContent),
            scripture: cleanAIOutput(data.scripture)
        };
    } catch {
        return { day, title: "Ato de Caridade", description: "Faça uma caridade hoje.", isCompleted: false, isLocked: false };
    }
};
