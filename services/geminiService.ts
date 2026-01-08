
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

// Fixed: Correctly initializing GoogleGenAI according to guidelines, using process.env.API_KEY directly
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
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Santo: ${user.patronSaint}.` 
      : "Irmão em busca de luz.";

    const systemInstruction = `
      Você é um assistente católico humilde e acolhedor.
      RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.
      Seu tom deve ser de um irmão que caminha junto, nunca autoritário.
      Não use negritos ou asteriscos na resposta.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    // Fixed: Accessed .text property directly as per guidelines
    return cleanAIOutput(response.text || "Deus te abençoe.");
  } catch (error) {
    console.error("AI Error:", error);
    return "Um momento de oração silenciosa. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este Evangelho em uma frase curta e poética (max 10 palavras) em Português: ${gospelText}`,
    });
    // Fixed: Accessed .text property directly as per guidelines
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
        // Fixed: Added responseSchema for robust JSON output as recommended in guidelines
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: { type: Type.STRING, description: 'Breve reflexão espiritual' },
            verse: { type: Type.STRING, description: 'Versículo bíblico relacionado' }
          },
          required: ['reflection', 'verse']
        },
        systemInstruction: "Irmão na fé. Responda em JSON com { 'reflection': '...', 'verse': '...' }."
      },
    });
    // Fixed: Accessed .text property directly as per guidelines
    return response.text || "{}";
  } catch (error) {
    return JSON.stringify({ reflection: "Deus olha para o seu coração com amor.", verse: "Salmo 23" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica inspirada em ${todaySaint}. Max 20 palavras.`,
    });
    // Fixed: Accessed .text property directly as per guidelines
    return cleanAIOutput(response.text || "O Senhor é o meu pastor.");
  } catch (error) {
    return "A paz de Cristo esteja convosco.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  const fallback: { routine: RoutineItem[], profileDescription: string, profileReasoning: string } = {
        profileDescription: "Buscador de Deus",
        profileReasoning: "Um caminho de paz e constância para sua jornada.",
        routine: [
            { id: 'f1', title: 'Oração da Manhã', description: 'Entregar o dia ao Senhor', xpReward: 20, completed: false, icon: 'sun' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' as const },
            { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a voz de Jesus', xpReward: 30, completed: false, icon: 'book' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' as const },
            { id: 'f3', title: 'Exame de Consciência', description: 'Revisar o dia com gratidão', xpReward: 20, completed: false, icon: 'moon' as const, timeOfDay: 'night' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' as const }
        ]
  };

  const prompt = `
    Crie um caminho de fé simples para ${data.name}.
    - Estado: ${data.stateOfLife}
    - Luta principal: ${data.primaryStruggle}
    - Guia: ${data.patronSaint}

    RETORNE APENAS JSON.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          // Fixed: Added responseSchema for better reliability in generating complex routine objects
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

    // Fixed: Accessed .text property directly as per guidelines
    const json = JSON.parse(response.text || '{}');
    return { 
      routine: (json.routine || fallback.routine).map((i: any) => ({ 
        ...i, 
        id: crypto.randomUUID(), 
        completed: false 
      })) as RoutineItem[], 
      profileDescription: cleanAIOutput(json.profileDescription || fallback.profileDescription),
      profileReasoning: cleanAIOutput(json.profileReasoning || fallback.profileReasoning)
    };
  } catch (e) {
    console.error("AI Routine Generation Error:", e);
    return fallback;
  }
};
