
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

// Fixed: Initialization must use process.env.API_KEY directly per guidelines
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

export const sendMessageToAssistant = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Padroeiro: ${user.patronSaint}.` 
      : "Um irmão em busca de orientação.";

    const systemInstruction = `
      Você é um assistente católico humilde, sábio e acolhedor.
      RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.
      Seu tom é de um irmão que caminha junto, nunca autoritário ou frio.
      Não use negritos, hashtags ou aspas desnecessárias.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Deus te abençoe, meu irmão.");
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Um momento de oração silenciosa. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este Evangelho em uma frase curta e poética (máximo 10 palavras) em Português: ${gospelText}`,
    });
    return cleanAIOutput(response.text || "Caminhando na luz de Cristo.");
  } catch (error) {
    return "Buscai as coisas do alto.";
  }
};

export const sendMessageToSpiritualDirector = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: { type: Type.STRING, description: 'Breve reflexão espiritual baseada no relato' },
            verse: { type: Type.STRING, description: 'Versículo bíblico que ilumina este momento' }
          },
          required: ['reflection', 'verse']
        },
        systemInstruction: "Você é um diretor espiritual experiente. Responda apenas em JSON estruturado."
      },
    });
    return response.text || "{}";
  } catch (error) {
    return JSON.stringify({ reflection: "Deus olha para o seu coração com amor infinito.", verse: "Salmo 23, 1" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica curta e profunda inspirada na vida de ${todaySaint}. Máximo 20 palavras.`,
    });
    return cleanAIOutput(response.text || "O Senhor é o meu pastor e nada me faltará.");
  } catch (error) {
    return "A paz de Cristo esteja sempre convosco.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  const fallback = {
    profileDescription: "Peregrino da Fé",
    profileReasoning: "Um caminho de constância e paz para sua jornada diária.",
    routine: [
      { id: 'f1', title: 'Oração da Manhã', description: 'Consagrar o dia ao Senhor', xpReward: 20, completed: false, icon: 'sun' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' as const },
      { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a Palavra Viva', xpReward: 30, completed: false, icon: 'book' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' as const },
      { id: 'f3', title: 'Exame de Consciência', description: 'Revisar o dia com gratidão', xpReward: 20, completed: false, icon: 'moon' as const, timeOfDay: 'night' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' as const }
    ]
  };

  const prompt = `Crie uma regra de vida espiritual para ${data.name}. Estado: ${data.stateOfLife}. Luta: ${data.primaryStruggle}. Padroeiro: ${data.patronSaint}. Retorne APENAS JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileDescription: { type: Type.STRING },
            profileReasoning: { type: Type.STRING },
            routine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  xpReward: { type: Type.NUMBER },
                  icon: { type: Type.STRING, description: 'rosary, book, cross, sun, heart, church' },
                  timeOfDay: { type: Type.STRING, description: 'morning, afternoon, night' },
                  dayOfWeek: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  actionLink: { type: Type.STRING, description: 'READ_LITURGY, OPEN_MAP, NONE' }
                },
                required: ["title", "description", "xpReward", "icon", "timeOfDay", "dayOfWeek"]
              }
            }
          },
          required: ["profileDescription", "profileReasoning", "routine"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return { 
      routine: (json.routine || fallback.routine).map((i: any) => ({ ...i, id: crypto.randomUUID(), completed: false })), 
      profileDescription: cleanAIOutput(json.profileDescription || fallback.profileDescription),
      profileReasoning: cleanAIOutput(json.profileReasoning || fallback.profileReasoning)
    };
  } catch (e) {
    console.error("AI Routine Generation Error:", e);
    return fallback;
  }
};
