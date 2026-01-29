
import { GoogleGenAI, Type } from "@google/genai";
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
    .replace(/—/g, '-') // Substitui o travessão longo por um hífen simples
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
      NUNCA use negritos (**), hífens longos (—) ou listas numeradas robóticas.
      Escreva de forma fluida, como uma carta de um amigo.
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
      contents: `Resuma este Evangelho em uma frase curta, poética e humana (máximo 10 palavras) em Português. NÃO use negritos ou símbolos: ${gospelText}`,
    });
    return cleanAIOutput(response.text || "Caminhando na luz de Cristo.");
  } catch (error) {
    return "Buscai as coisas do alto.";
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase católica curta, inspiradora e humana inspirada em ${todaySaint}. Máximo 20 palavras. NÃO use negritos ou símbolos de IA.`,
    });
    return cleanAIOutput(response.text || "O Senhor é o meu pastor.");
  } catch (error) {
    return "A paz de Cristo esteja convosco.";
  }
};

// Fix: Added missing sendMessageToSpiritualDirector function used by JournalModal
export const sendMessageToSpiritualDirector = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
    });
    // Do not use cleanAIOutput here as JournalModal expects raw response text to handle potential JSON parsing
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  const systemPrompt = `
    Você é um Diretor Espiritual Católico. Crie uma "Jornada Diária" personalizada e ÚNICA para cada dia da semana.
    IMPORTANTE: Cada dia da semana DEVE ter itens específicos que NÃO se repetem nos outros dias, respeitando a tradição da Igreja:
    
    - Domingo (0): FOCO ABSOLUTO NA SANTA MISSA. Itens: Preparação para a Missa (manhã), Participar da Santa Missa (Ação Principal), Descanso do Senhor (tarde/noite). (Ação: OPEN_SOCIAL para ver a comunidade unida).
    - Segunda (1): Almas do Purgatório e Doutrina. Itens: Oração pelas almas, Estudo de um tema da fé. (Ação: READ_KNOWLEDGE).
    - Terça (2): Santos Anjos e Combate Espiritual. Itens: Oração ao Anjo da Guarda, Pequena mortificação dos sentidos. (Ação: READ_LITURGY).
    - Quarta (3): São José e Santidade no Trabalho/Família. Itens: Oração a São José, Gesto de caridade em casa. (Ação: OPEN_COMMUNITY).
    - Quinta (4): Santíssima Eucaristia e Sacerdócio. Itens: Visita ao Santíssimo (ou espiritual), Oração pelos sacerdotes. (Ação: OPEN_SOCIAL).
    - Sexta (5): Paixão de Nosso Senhor e Penitência. Itens: Via Sacra curta, Jejum ou abstinência de algo. (Ação: READ_LITURGY).
    - Sábado (6): Nossa Senhora. Itens: Santo Terço, Ofício de Nossa Senhora ou Consagração. (Ação: OPEN_COMMUNITY).

    REGRAS DE GERAÇÃO:
    1. Gere pelo menos 3 a 4 itens para CADA dia da semana.
    2. O campo 'dayOfWeek' deve conter APENAS o número do dia específico (ex: [0] para Domingo), a menos que seja algo essencial como 'Oração da Manhã' que pode ser [0,1,2,3,4,5,6].
    3. A "Ação Principal" de cada dia deve usar o 'actionLink' sugerido acima.
    4. Use tons humildes e naturais. NUNCA use negritos ou símbolos de IA.
    
    Ações (actionLink): READ_LITURGY, OPEN_COMMUNITY, OPEN_SOCIAL, READ_KNOWLEDGE, NONE.
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
        { id: 'f2', title: 'Santa Missa', description: 'Dia do Senhor', xpReward: 50, completed: false, icon: 'cross', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_SOCIAL' },
        { id: 'f3', title: 'Estudo da Fé', description: 'Doutrina Católica', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'afternoon', dayOfWeek: [1], actionLink: 'READ_KNOWLEDGE' },
        { id: 'f4', title: 'Anjo da Guarda', description: 'Combate Espiritual', xpReward: 30, completed: false, icon: 'shield', timeOfDay: 'morning', dayOfWeek: [2], actionLink: 'READ_LITURGY' },
        { id: 'f5', title: 'Gesto de Caridade', description: 'Exemplo de São José', xpReward: 30, completed: false, icon: 'heart', timeOfDay: 'afternoon', dayOfWeek: [3], actionLink: 'OPEN_COMMUNITY' },
        { id: 'f6', title: 'Adoração Espiritual', description: 'Presença Real', xpReward: 30, completed: false, icon: 'sun', timeOfDay: 'afternoon', dayOfWeek: [4], actionLink: 'OPEN_SOCIAL' },
        { id: 'f7', title: 'Via Sacra', description: 'Paixão de Cristo', xpReward: 30, completed: false, icon: 'cross', timeOfDay: 'afternoon', dayOfWeek: [5], actionLink: 'READ_LITURGY' },
        { id: 'f8', title: 'Santo Terço', description: 'Com Maria', xpReward: 30, completed: false, icon: 'rosary', timeOfDay: 'morning', dayOfWeek: [6], actionLink: 'OPEN_COMMUNITY' },
        { id: 'f9', title: 'Exame de Consciência', description: 'Revisão da noite', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
      ]
    };
  }
};
