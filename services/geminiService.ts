
import { GoogleGenAI } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

// GUIDELINE FIX: Use direct initialization from process.env.API_KEY and follow exact naming
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

    // GUIDELINE FIX: Access .text property directly (not as a method)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Deus te abençoe.");
  } catch (error) {
    console.error("AI Error:", error);
    return "Um momento de recolhimento. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma este Evangelho em uma frase curta e poética (max 10 palavras) em Português: ${gospelText}`,
    });
    return cleanAIOutput(response.text || "Caminhando na luz de Cristo.");
  } catch (error) {
    console.error("AI Error:", error);
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
        systemInstruction: "Irmão na fé. Responda em JSON com { 'reflection': '...', 'verse': '...' }."
      },
    });
    return response.text || "{}";
  } catch (error) {
    console.error("AI Error:", error);
    return JSON.stringify({ reflection: "Deus olha para o seu coração com amor.", verse: "Salmo 23" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica inspirada em ${todaySaint}. Max 20 palavras.`,
    });
    return cleanAIOutput(response.text || "O Senhor é o meu pastor.");
  } catch (error) {
    console.error("AI Error:", error);
    return "A paz de Cristo esteja convosco.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  // TYPE FIX: Explicitly typing fallback to ensure RoutineItem compatibility and resolving line 116 error
  const fallback: { routine: RoutineItem[], profileDescription: string, profileReasoning: string } = {
        profileDescription: "Buscador de Deus",
        profileReasoning: "Um caminho simples para começar sua jornada com paz.",
        routine: [
            { id: 'f1', title: 'Oração da Manhã', description: 'Entregar o dia', xpReward: 20, completed: false, icon: 'sun' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' as const },
            { id: 'f2', title: 'Evangelho', description: 'Escutar Jesus', xpReward: 30, completed: false, icon: 'book' as const, timeOfDay: 'morning' as const, dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' as const },
            { id: 'f3', title: 'Missa Dominical', description: 'O dia do Senhor', xpReward: 100, completed: false, icon: 'church' as const, timeOfDay: 'morning' as const, dayOfWeek: [0], actionLink: 'OPEN_MAP' as const }
        ]
  };

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
    // GUIDELINE FIX: Using gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    const json = JSON.parse(response.text || '{}');
    // TYPE FIX: Casting mapped routine items as RoutineItem[] to resolve type mismatch on line 148
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
    console.error("AI Error:", e);
    return fallback;
  }
};
