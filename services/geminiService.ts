
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

export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Santo: ${user.patronSaint}.` 
      : "Visitante em busca de luz.";

    const systemInstruction = `
      Você é um assistente católico sábio e acolhedor.
      RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.
      Seu tom deve ser empático, humilde e fiel à Igreja.
      Não use termos como "Diretor Espiritual" para se referir a si mesmo.
      Integre conselhos baseados na vida do santo padroeiro do usuário.
      Não use negritos ou asteriscos na resposta.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Paz e Bem. Como posso ajudar hoje?");
  } catch (error) {
    return "Um momento de recolhimento técnico. Em breve retornarei com seu auxílio.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  const prompt = `
    Crie uma regra de vida católica personalizada para ${data.name}.
    
    DADOS DO USUÁRIO:
    - Estado civil/vida: ${data.stateOfLife}
    - Rotina: ${data.routineType}
    - Dificuldade principal: ${data.primaryStruggle}
    - Objetivo: ${data.spiritualGoal}
    - Relação com Confissão: ${data.confessionFrequency}
    - Santo Padroeiro: ${data.patronSaint}

    DIRETRIZES OBRIGATÓRIAS:
    1. Gere tarefas para TODOS OS 7 DIAS da semana (0 a 6). Domingo (0) deve ser focado na Missa e descanso.
    2. Pelo menos 1 tarefa a cada 2 dias deve ser de ESTUDO ('READ_KNOWLEDGE') vinculada a temas da biblioteca (Ex: Doutrina, Missa, Vidas de Santos).
    3. Distribua tarefas entre 'morning', 'afternoon' e 'night'.
    4. "profileDescription" deve ser um título inspirador curto (Ex: "Combatente de Maria", "Sentinela da Eucaristia").
    5. Nunca use o termo "Diretor Espiritual".

    RETORNE APENAS JSON:
    {
      "profileDescription": "String",
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
          systemInstruction: "Você gera caminhos de vida católica em formato JSON em Português para 7 dias da semana."
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
    // Fallback garantindo todos os dias
    return {
        profileDescription: "Peregrino da Fé",
        routine: [
            { id: 'f1', title: 'Oferecimento do Dia', description: 'Entregar o dia ao Senhor', xpReward: 20, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
            { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a voz de Cristo', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
            { id: 'f3', title: 'Santa Missa', description: 'O cume da vida cristã', xpReward: 100, completed: false, icon: 'church', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_MAP' },
            { id: 'f4', title: 'Estudo da Fé', description: 'Conhecer para amar', xpReward: 40, completed: false, icon: 'book', timeOfDay: 'afternoon', dayOfWeek: [1,3,5], actionLink: 'READ_KNOWLEDGE' }
        ]
    };
  }
};

export const generateDailyReflection = async (saint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta de sabedoria católica em PORTUGUÊS. Sem negritos.`,
    });
    return cleanAIOutput(response.text || "Deus te abençoe.");
  } catch { return "Caminhe na paz de Cristo."; }
};

export const generateDailyTheme = async (gospel?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma o Evangelho em 5 palavras em PORTUGUÊS: ${gospel || 'Amor de Deus'}`,
    });
    return cleanAIOutput(response.text || "Vida de Fé");
  } catch { return "Vida de Fé"; }
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
