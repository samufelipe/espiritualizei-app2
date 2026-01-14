
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

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

/**
 * GERA NARRAÇÃO DE ÁUDIO PARA O PASSO CONCRETO
 */
export const generateActionSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia de forma inspiradora e calma: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Voz masculina serena
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar áudio");
    return base64Audio;
  } catch (error) {
    console.error("Erro TTS:", error);
    throw error;
  }
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
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Deus te abençoe, meu irmão.");
  } catch (error) {
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
            reflection: { type: Type.STRING },
            verse: { type: Type.STRING }
          },
          required: ['reflection', 'verse']
        },
        systemInstruction: "Você é um diretor espiritual experiente. Responda apenas em JSON."
      },
    });
    return response.text || "{}";
  } catch (error) {
    return JSON.stringify({ reflection: "Deus olha para o seu coração.", verse: "Salmo 23, 1" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica curta inspirada em ${todaySaint}. Máximo 20 palavras.`,
    });
    return cleanAIOutput(response.text || "O Senhor é o meu pastor.");
  } catch (error) {
    return "A paz de Cristo esteja convosco.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  const systemPrompt = `
    Você é um Diretor Espiritual Católico. Crie uma "Regra de Vida Semanal" personalizada.
    A rotina DEVE mudar conforme o dia da semana seguindo a tradição da Igreja:
    - Domingo (0): Santa Missa. Preparar o coração no sábado/domingo manhã. (OPEN_MAP)
    - Segunda (1): Almas/Fé Intelectual. Estudar conteúdo. (READ_KNOWLEDGE)
    - Terça (2): Santos Anjos/Combate. Diálogo espiritual. (OPEN_CHAT)
    - Quarta (3): São José/Família. Interceder por alguém. (OPEN_COMMUNITY)
    - Quinta (4): Eucaristia/Adoração. Buscar capela. (OPEN_MAP)
    - Sexta (5): Paixão/Penitência. Meditar o Evangelho. (READ_LITURGY)
    - Sábado (6): Maria. Oração comunitária ou Terço. (OPEN_COMMUNITY)

    LÓGICA DE PREPARAÇÃO:
    Cada dia deve ter 1 "Ação Principal" no horário mais fácil do usuário (${data.bestMoment}) e "Tarefas de Preparo" (manhã/noite) que deem suporte a essa ação.
    
    Ações (actionLink): READ_LITURGY, OPEN_MAP, OPEN_COMMUNITY, OPEN_CHAT, READ_KNOWLEDGE, NONE.
  `;

  const userContext = `
    Nome: ${data.name}. Luta: ${data.primaryStruggle}. Objetivo: ${data.spiritualGoal}. 
    Disponibilidade: ${data.routineType}. Melhor momento: ${data.bestMoment}.
    ${reviewData ? `Feedback: Intensidade ${reviewData.intensity}, Constância ${reviewData.consistency}.` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userContext,
      config: { 
        systemInstruction: systemPrompt,
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
                  detailedContent: { type: Type.STRING },
                  xpReward: { type: Type.NUMBER },
                  icon: { type: Type.STRING, description: 'rosary, book, cross, sun, heart, shield, church, moon' },
                  timeOfDay: { type: Type.STRING, description: 'morning, afternoon, night' },
                  dayOfWeek: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  actionLink: { type: Type.STRING }
                },
                required: ["title", "description", "xpReward", "icon", "timeOfDay", "dayOfWeek", "actionLink"]
              }
            }
          },
          required: ["profileDescription", "profileReasoning", "routine"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return { 
      routine: json.routine.map((i: any) => ({ ...i, id: crypto.randomUUID(), completed: false })), 
      profileDescription: cleanAIOutput(json.profileDescription),
      profileReasoning: cleanAIOutput(json.profileReasoning)
    };
  } catch (e) {
    console.error("AI Routine Error:", e);
    return {
      profileDescription: "Peregrino",
      profileReasoning: "Caminho de fé.",
      routine: [
        { id: 'f1', title: 'Oração da Manhã', description: 'Oferta do dia', xpReward: 20, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
        { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a Palavra', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
        { id: 'f3', title: 'Exame de Consciência', description: 'Revisão da noite', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
      ]
    };
  }
};
