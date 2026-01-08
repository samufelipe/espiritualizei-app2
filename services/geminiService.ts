
import { GoogleGenAI } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

// Validação rigorosa da chave
const safeGet = (val: any) => {
  const s = String(val).trim();
  return (s === 'undefined' || s === 'null' || !s) ? '' : s;
};

const API_KEY = safeGet(process.env.API_KEY);
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

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
  if (!ai) return "Estou em momento de silêncio agora. Como posso te ajudar de forma simples?";
  
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

    return cleanAIOutput(response.text || "Deus te abençoe.");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Um momento de oração silenciosa. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  if (!ai) return "Caminhando na luz de Cristo.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este Evangelho em uma frase curta e poética (max 10 palavras) em Português: ${gospelText}`,
    });
    return cleanAIOutput(response.text || "Caminhando na luz de Cristo.");
  } catch (error) {
    return "Buscai as coisas do alto.";
  }
};

export const sendMessageToSpiritualDirector = async (message: string): Promise<string> => {
  if (!ai) return JSON.stringify({ reflection: "Deus olha para o seu coração com amor.", verse: "Salmo 23" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: "Irmão na fé. Responda em JSON com { 'reflection': '...', 'verse': '...' }."
      },
    });
    return response.text || "{}";
  } catch (error) {
    return JSON.stringify({ reflection: "Deus olha para o seu coração com amor.", verse: "Salmo 23" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  if (!ai) return "O Senhor é o meu pastor.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica inspirada em ${todaySaint}. Max 20 palavras.`,
    });
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

  if (!ai) return fallback;

  const prompt = `
    Crie um caminho de fé simples para ${data.name}.
    - Estado: ${data.stateOfLife}
    - Luta principal: ${data.primaryStruggle}
    - Guia: ${data.patronSaint}

    RETORNE APENAS JSON:
    {
      "profileDescription": "String",
      "profileReasoning": "String",
      "routine": [
        { "title": "String", "description": "String", "xpReward": Number, "icon": "rosary|book|cross|sun|heart|church", "timeOfDay": "morning|afternoon|night", "dayOfWeek": [0,1,2,3,4,5,6], "actionLink": "READ_LITURGY|OPEN_MAP|NONE" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

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
