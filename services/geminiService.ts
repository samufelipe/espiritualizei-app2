
import { GoogleGenAI } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

// Função auxiliar para pegar a chave de qualquer lugar que ela esteja escondida
const getApiKey = () => {
  return process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
};

// Inicialização da IA com o modelo correto e atualizado
const ai = new GoogleGenAI({ apiKey: getApiKey() });

// --- GESTÃO DE COTA E CACHE ---
const QUOTA_KEY = 'gemini_quota_lock_until';
const isQuotaLocked = (): boolean => {
  const lockUntil = localStorage.getItem(QUOTA_KEY);
  if (!lockUntil) return false;
  return new Date().getTime() < parseInt(lockUntil);
};

const lockQuota = () => {
  const cooldown = new Date().getTime() + (60 * 60 * 1000); 
  localStorage.setItem(QUOTA_KEY, cooldown.toString());
};

const isQuotaError = (error: any) => {
    const msg = error?.message || '';
    return error?.status === 429 || msg.includes('429') || msg.includes('Quota exceeded');
};

const getFromCache = <T>(baseKey: string): T | null => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem(`gemini_cache_v4_${baseKey}`);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) return parsed.data;
    }
    return null;
};

const saveToCache = (baseKey: string, data: any) => {
    const today = new Date().toDateString();
    localStorage.setItem(`gemini_cache_v4_${baseKey}`, JSON.stringify({ date: today, data }));
};

// --- CHAT COM DIRETOR ESPIRITUAL ---
export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  if (isQuotaLocked()) return "Estou em silêncio orante no momento. Tente novamente mais tarde.";
  if (!getApiKey()) return "Aguardando conexão com o servidor de oração...";

  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Estado: ${user.stateOfLife}. Foco: ${user.spiritualFocus}.` 
      : "Usuário visitante.";

    const systemInstruction = `
      Você é um diretor espiritual católico sábio e fiel ao Magistério.
      Responda com profundidade e brevidade (max 150 palavras).
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return response.text || "Paz e Bem. Como posso ajudar?";
  } catch (error: any) {
    if (isQuotaError(error)) lockQuota();
    console.error("Gemini Error:", error);
    return "Tive um momento de silêncio técnico. Retornarei em breve.";
  }
};

// --- GERADOR DE ROTINA ADAPTÁVEL ---
export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  if (isQuotaLocked() || !getApiKey()) return getFallbackRoutine();

  const prompt = `
    Crie uma REGRA DE VIDA CATÓLICA para ${data.name}.
    Estado: ${data.stateOfLife}. Luta: ${data.primaryStruggle}.
    ${reviewData ? `Feedback: ${reviewData.intensity}` : ''}
    Retorne um JSON com "profileDescription" e um array "routine".
    Use actionLinks: 'OPEN_MAP', 'READ_LITURGY', 'OPEN_COMMUNITY', 'NONE'.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    const json = JSON.parse(response.text || '{}');
    const routine = (json.routine || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
        dayOfWeek: item.dayOfWeek || [0,1,2,3,4,5,6],
        timeOfDay: item.timeOfDay || 'morning',
        actionLink: item.actionLink || 'NONE'
    }));

    return { routine, profileDescription: json.profileDescription || 'Alma em Caminhada' };
  } catch (e) {
    return getFallbackRoutine();
  }
};

function getFallbackRoutine() {
    return {
        routine: [
             { id: 'f1', title: 'Oração da Manhã', description: 'Oferecimento do dia', xpReward: 15, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
             { id: 'f2', title: 'Evangelho do Dia', description: 'Leitura espiritual', xpReward: 20, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
             { id: 'f3', title: 'Missa Dominical', description: 'O cume da vida', xpReward: 100, completed: false, icon: 'church', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_MAP' }
        ] as RoutineItem[],
        profileDescription: 'Peregrino da Fé'
    };
}

export const generateDailyReflection = async (saint: string): Promise<string> => {
  const cached = getFromCache<string>('daily_quote');
  if (cached) return cached;
  if (!getApiKey()) return "Caminhe na paz de Cristo.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta inspiradora sobre a fé católica ou o santo: ${saint}. JSON: { "quote": "texto" }`,
      config: { responseMimeType: 'application/json' }
    });
    const json = JSON.parse(response.text || '{}');
    const res = json.quote || "Santos e anjos, rogai por nós.";
    saveToCache('daily_quote', res);
    return res;
  } catch { return "Deus te abençoe."; }
};

export const generateDailyTheme = async (gospel?: string): Promise<string> => {
  const cached = getFromCache<string>('daily_theme');
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma o ensinamento deste Evangelho em 5 palavras: ${gospel || 'Amor de Deus'}`,
    });
    const res = response.text?.replace(/"/g, '').trim() || "Fé e Oração";
    saveToCache('daily_theme', res);
    return res;
  } catch { return "Santidade Diária"; }
};

export const generateLiturgicalDailyTopic = async (day: number, season: string): Promise<DailyTopic> => {
    const cacheKey = `topic_${season}_${day}`;
    const cached = getFromCache<DailyTopic>(cacheKey);
    if (cached) return cached;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Gere um desafio prático católico para o dia ${day} do tempo de ${season}. JSON com title, description, scripture, actionType (PRAYER/RELATIONSHIP/SACRIFICE), actionContent.`,
            config: { responseMimeType: 'application/json' }
        });
        const data = JSON.parse(response.text || '{}');
        const res: DailyTopic = {
            day,
            title: data.title || "Ato de Amor",
            description: data.description || "Realize uma pequena caridade.",
            isCompleted: false,
            isLocked: false,
            actionType: data.actionType || 'GENERIC',
            actionContent: data.actionContent,
            scripture: data.scripture
        };
        saveToCache(cacheKey, res);
        return res;
    } catch {
        return { day, title: "Pequena Oração", description: "Reze por alguém hoje.", isCompleted: false, isLocked: false };
    }
};
