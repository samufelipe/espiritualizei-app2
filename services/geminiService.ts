
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

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
      NUNCA use o termo "Diretor Espiritual" ou "Mestre".
      Use termos simples como "pequenos passos", "amizade com Jesus", "caminhada".
      Não use negritos ou asteriscos na resposta.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Deus te abençoe. Como posso ajudar hoje?");
  } catch (error) {
    return "Um momento de recolhimento. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma a essência espiritual deste Evangelho em uma frase curta e poética (max 10 palavras) em Português: ${gospelText}`,
    });
    return cleanAIOutput(response.text || "Buscai as coisas do alto.");
  } catch {
    return "Caminhando na luz de Cristo.";
  }
};

export const sendMessageToSpiritualDirector = async (message: string): Promise<string> => {
  // Mantemos o nome da função para compatibilidade de import, mas o tom interno é humilde
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: "Você é um irmão na fé que dá conselhos curtos. Responda em JSON com { 'reflection': '...', 'verse': '...' }."
      },
    });
    return response.text || "{}";
  } catch {
    return JSON.stringify({ reflection: "Deus olha para o seu coração com amor.", verse: "Salmo 23" });
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase de sabedoria católica inspirada em ${todaySaint} ou no dia de hoje. Max 20 palavras.`,
    });
    return cleanAIOutput(response.text || "O Senhor é o meu pastor.");
  } catch {
    return "A paz de Cristo esteja convosco.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string, profileReasoning: string }> => {
  const prompt = `
    Crie um caminho de fé simples para ${data.name}.
    
    REALIDADE DO USUÁRIO:
    - Estado: ${data.stateOfLife}
    - Ritmo: ${data.routineType}
    - Luta principal: ${data.primaryStruggle}
    - O que busca: ${data.spiritualGoal}
    - Confissão: ${data.confessionFrequency}
    - Guia: ${data.patronSaint}

    REGRAS:
    1. Gerar tarefas para TODOS OS 7 DIAS da semana. O Domingo (0) deve focar na Missa e família.
    2. Integrar temas da Biblioteca ('READ_KNOWLEDGE') vinculados à luta dele (${data.primaryStruggle}).
    3. Use linguagem humilde. "profileDescription" deve ser um título poético simples.
    4. "profileReasoning" deve explicar que o plano foi feito para se encaixar na vida dele.

    RETORNE APENAS JSON:
    {
      "profileDescription": "Ex: Peregrino da Paz",
      "profileReasoning": "Uma frase humilde explicando a escolha do plano.",
      "routine": [
        { "title": "String", "description": "String", "detailedContent": "String", "xpReward": Number, "icon": "rosary|book|cross|candle|sun|heart|shield|moon|church|music", "timeOfDay": "morning|afternoon|night", "dayOfWeek": [Number], "actionLink": "READ_LITURGY|READ_KNOWLEDGE|OPEN_MAP|NONE" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          systemInstruction: "Você gera rotinas católicas em JSON com tom de humildade e serviço."
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
      profileDescription: cleanAIOutput(json.profileDescription || 'Peregrino da Fé'),
      profileReasoning: cleanAIOutput(json.profileReasoning || 'Preparamos este plano para ser um pequeno auxílio no seu dia a dia.')
    };
  } catch (e) {
    return {
        profileDescription: "Buscador de Deus",
        profileReasoning: "Um caminho simples para começar sua jornada com paz.",
        routine: [
            { id: 'f1', title: 'Oração da Manhã', description: 'Entregar o dia', xpReward: 20, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
            { id: 'f2', title: 'Evangelho', description: 'Escutar Jesus', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
            { id: 'f3', title: 'Missa Dominical', description: 'O dia do Senhor', xpReward: 100, completed: false, icon: 'church', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_MAP' }
        ]
    };
  }
};
