
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

const getApiKey = () => {
  return process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

const getFromCache = <T>(baseKey: string): T | null => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`gemini_cache_v7_${baseKey}`);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) return parsed.data;
    }
    return null;
};

const saveToCache = (baseKey: string, data: any) => {
    const today = new Date().toDateString();
    localStorage.setItem(`gemini_cache_v7_${baseKey}`, JSON.stringify({ date: today, data }));
};

const SAINT_CONTEXTS: Record<string, string> = {
  acutis: "Espiritualidade de Carlo Acutis: Foco na Eucaristia como rodovia para o céu e na santificação do mundo digital e tecnológico.",
  michael: "Espiritualidade de São Miguel Arcanjo: Foco no combate espiritual, na vigilância contra as tentações e na proteção da Igreja.",
  therese: "Espiritualidade de Santa Teresinha: A 'Pequena Via'. Foco em fazer pequenas coisas com amor extraordinário e confiança cega na misericórdia.",
  joseph: "Espiritualidade de São José: Foco no silêncio, na santificação do trabalho ordinário, na castidade e no cuidado com a família.",
  mary: "Espiritualidade Mariana: Foco na entrega total (Totus Tuus), no Rosário diário e na imitação das virtudes de humildade e obediência da Virgem Maria."
};

export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Estado: ${user.stateOfLife}. Luta: ${user.spiritualFocus}. Padroeiro: ${user.patronSaint}.` 
      : "Usuário visitante.";

    const systemInstruction = `
      Você é um diretor espiritual católico sábio, humilde e fiel ao Magistério da Igreja.
      Responda SEMPRE em Português do Brasil.
      Sua linguagem deve ser acolhedora mas firme na doutrina.
      Integre conselhos baseados na vida do santo padroeiro do usuário quando relevante.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Paz e Bem. Como posso ajudar?");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Tive um momento de silêncio técnico. Retornarei em breve.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  const saintSpirituality = SAINT_CONTEXTS[data.patronSaint || 'michael'] || "";
  
  const prompt = `
    Aja como um Diretor Espiritual Católico. Crie uma REGRA DE VIDA personalizada para ${data.name}.
    
    DADOS DO FIEL:
    - Estado de Vida: ${data.stateOfLife}
    - Luta Principal: ${data.primaryStruggle}
    - Objetivo: ${data.spiritualGoal}
    - Santo de Devoção: ${data.patronSaint}
    - CONTEXTO DO SANTO: ${saintSpirituality}

    ESTRUTURA TEMÁTICA DA SEMANA:
    - Domingo: Ressurreição | Segunda: Almas | Terça: Santos Anjos | Quarta: São José | Quinta: Eucaristia | Sexta: Paixão | Sábado: Maria

    REQUISITOS OBRIGATÓRIOS:
    1. Integre pelo menos 1 prática ESPECÍFICA da espiritualidade de ${data.patronSaint} em cada dia da semana.
    2. Ajuste a dificuldade para o ritmo: ${data.routineType}.
    3. Responda APENAS em Português do Brasil.
    4. O "profileDescription" deve ser um título místico (ex: "Sentinela de Miguel", "Pequena Flor de Lis").

    RETORNE APENAS O JSON:
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
          systemInstruction: "Você gera regras de vida católica em JSON. Use os temas dos santos de forma criativa e prática."
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
      profileDescription: cleanAIOutput(json.profileDescription || 'Alma em Caminhada') 
    };
  } catch (e) {
    console.error("Routine Generation Failed:", e);
    return getFallbackRoutine();
  }
};

function getFallbackRoutine() {
    return {
        routine: [
             { id: 'f1', title: 'Oferecimento do Dia', description: 'Entregar o dia ao Senhor', xpReward: 15, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
             { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a voz do Mestre', xpReward: 20, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
             { id: 'f3', title: 'Exame de Consciência', description: 'Revisar o dia no amor', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
        ] as RoutineItem[],
        profileDescription: 'Peregrino da Fé'
    };
}

export const generateDailyReflection = async (saint: string): Promise<string> => {
  const cached = getFromCache<string>('daily_quote');
  if (cached) return cached;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta e inspiradora em PORTUGUÊS sobre a fé católica ou o santo ${saint}.`,
    });
    const res = cleanAIOutput(response.text || "Deus te abençoe.");
    saveToCache('daily_quote', res);
    return res;
  } catch { return "Caminhe na paz de Cristo."; }
};

export const generateDailyTheme = async (gospel?: string): Promise<string> => {
  const cached = getFromCache<string>('daily_theme');
  if (cached) return cached;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma o Evangelho em 5 palavras em PORTUGUÊS: ${gospel || 'Amor de Deus'}`,
    });
    const res = cleanAIOutput(response.text || "Santidade Diária");
    saveToCache('daily_theme', res);
    return res;
  } catch { return "Santidade Diária"; }
};

export const generateLiturgicalDailyTopic = async (day: number, season: string): Promise<DailyTopic> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Crie um desafio prático católico em PORTUGUÊS para o dia ${day} do tempo de ${season}. Retorne JSON com title, description, scripture, actionType, actionContent. Sem Markdown.`,
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
        return { day, title: "Pequeno Ato de Amor", description: "Faça uma caridade hoje.", isCompleted: false, isLocked: false };
    }
};
