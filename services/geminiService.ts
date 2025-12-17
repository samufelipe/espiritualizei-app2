
import { GoogleGenAI } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- QUOTA MANAGEMENT (CIRCUIT BREAKER) ---
const QUOTA_KEY = 'gemini_quota_lock_until';

const isQuotaLocked = (): boolean => {
  const lockUntil = localStorage.getItem(QUOTA_KEY);
  if (!lockUntil) return false;
  
  if (new Date().getTime() > parseInt(lockUntil)) {
    localStorage.removeItem(QUOTA_KEY); // Expired
    return false;
  }
  return true;
};

const lockQuota = () => {
  const cooldown = new Date().getTime() + (60 * 60 * 1000); 
  localStorage.setItem(QUOTA_KEY, cooldown.toString());
  console.warn("⚠️ Gemini Quota Exceeded. Switching to Offline Mode for 1h.");
};

const isQuotaError = (error: any) => {
    const msg = error?.message || '';
    return error?.status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
};

// --- CACHE HELPER (STRICT DATE) ---
const getTodayKey = () => new Date().toDateString();

const getFromCache = <T>(baseKey: string): T | null => {
    const today = getTodayKey();
    const storageKey = `gemini_cache_v3_${baseKey}`; // Versioned key
    const cached = localStorage.getItem(storageKey);
    
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (parsed.date === today) {
                return parsed.data;
            }
        } catch (e) {
            console.warn("Cache parse error", e);
        }
    }
    return null;
};

const saveToCache = (baseKey: string, data: any) => {
    const today = getTodayKey();
    const storageKey = `gemini_cache_v3_${baseKey}`;
    localStorage.setItem(storageKey, safeJsonStringify({ date: today, data }));
};

const safeJsonStringify = (obj: any) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) return;
            cache.add(value);
        }
        return value;
    });
};

// --- SPIRITUAL DIRECTOR CHAT ---
export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  if (isQuotaLocked()) {
     return "No momento, estou em silêncio orante (Modo Offline devido a alto tráfego). Por favor, tente novamente mais tarde.";
  }

  if (!process.env.API_KEY) {
     return "Estou offline no momento. Por favor, verifique sua conexão ou configuração.";
  }

  try {
    const userContext = user 
      ? `O usuário se chama ${user.name}. Estado de vida: ${user.stateOfLife}. Foco espiritual (Luta): ${user.spiritualFocus}.` 
      : "Usuário visitante.";

    const systemInstruction = `
      Você é um diretor espiritual católico sábio, compassivo e fiel ao Magistério da Igreja (Tom de Bento XVI misturado com Papa Francisco).
      Seu objetivo é acolher e elevar. Use citações bíblicas ou de santos (especialmente Carlo Acutis, Teresinha, Agostinho) quando apropriado.
      Contexto do usuário: ${userContext}
      Responda de forma concisa (máximo 150 palavras) mas profunda.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Desculpe, não consegui formular uma resposta agora.";
  } catch (error: any) {
    if (isQuotaError(error)) {
        lockQuota();
        return "Minha conexão espiritual está muito intensa agora (cota de uso excedida). Retornarei em breve.";
    }
    console.error("Gemini Error:", error);
    return "Tive um momento de silêncio (erro técnico). Tente novamente mais tarde.";
  }
};

// --- ROUTINE GENERATOR (THE ARCHITECT) ---
export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  if (isQuotaLocked() || !process.env.API_KEY) {
      return getFallbackRoutine();
  }

  // Definição rica do perfil para o Prompt
  const promptContext = `
    VOCÊ É UM DIRETOR ESPIRITUAL CATÓLICO EXPERIENTE CRIANDO UMA REGRA DE VIDA.
    
    PERFIL DO USUÁRIO:
    - Nome: ${data.name}
    - Estado de Vida: ${data.stateOfLife} (Isso define o tempo disponível. Pais/Casados têm pouco tempo. Estudantes precisam de foco. Aposentados têm mais tempo).
    - Rotina Atual: ${data.routineType} (Se for caótico, crie âncoras fixas. Se for rígido, sugira flexibilidade).
    - Luta Principal: ${data.primaryStruggle} (O "Vício Dominante" que precisamos combater com a virtude oposta).
    - Melhor Horário: ${data.bestMoment} (Coloque a oração principal aqui).
    - Patrono: ${data.patronSaint} (Inclua uma devoção ligada a ele se possível).
    ${reviewData ? `- FEEDBACK MENSAL: O usuário achou a rotina anterior ${reviewData.intensity}.` : ''}

    OBJETIVO: Criar uma rotina semanal (Segunda a Domingo) REALISTA, PRÁTICA e INTEGRADA ao App.
    NÃO crie uma lista genérica igual para todos os dias. Varie conforme a tradição da Igreja.

    REGRAS OBRIGATÓRIAS DE ESTRUTURA:
    1. DOMINGO ([0]): Foco total na Missa (Action: OPEN_MAP), descanso e família.
    2. SEXTA ([5]): Dia Penitencial. Incluir jejum ou obra de caridade (Action: NONE ou OPEN_COMMUNITY).
    3. SÁBADO ([6]): Dia Mariano. Incluir Terço ou Ofício (Action: OPEN_PLAYER).
    4. DIÁRIO ([0,1,2,3,4,5,6]): Apenas 1 ou 2 hábitos essenciais (ex: Oração da Manhã, Exame de Consciência).
    5. INTERCESSÃO: Pelo menos 2x na semana, mande o usuário orar pelos outros no app (Action: OPEN_COMMUNITY).
    6. ESTUDO: Pelo menos 1x na semana, sugira leitura espiritual (Action: READ_KNOWLEDGE).

    INTEGRAÇÃO COM O APP (Use estes actionLinks EXATAMENTE):
    - Ir à Missa/Confissão -> 'OPEN_MAP'
    - Rezar o Terço/Música -> 'OPEN_PLAYER'
    - Ler Evangelho/Liturgia -> 'READ_LITURGY'
    - Estudar Doutrina -> 'READ_KNOWLEDGE'
    - Pedir/Rezar por alguém -> 'OPEN_COMMUNITY'
    - Falar com Diretor IA -> 'OPEN_CHAT'
    - Ação prática offline (Jejum, Esmola, Ligar p/ Mãe) -> 'NONE'

    Gere um JSON com:
    - "profileDescription": Um título curto, HUMILDE e ACOLHEDOR para este perfil (ex: "Caminho de Paz", "Busca Diária", "Alma em Oração"). EVITE títulos grandiosos como "Guerreiro", "Guardião", "Mestre" ou "Profeta". Seja simples e sereno.
    - "routine": Array de itens.
  `;

  const promptSchema = `
    SCHEMA JSON:
    {
      "profileDescription": "string",
      "routine": [
        {
          "title": "Título Curto (Ex: Missa Dominical)",
          "description": "Motivação curta (Ex: O encontro real com Cristo)",
          "detailedContent": "Instrução prática (Ex: Chegue 10min antes para se preparar. Ofereça a missa por...)",
          "icon": "rosary" | "book" | "cross" | "candle" | "sun" | "heart" | "shield" | "moon" | "church" | "music",
          "timeOfDay": "morning" | "afternoon" | "night" | "any",
          "dayOfWeek": [inteiros 0-6], 
          "actionLink": "OPEN_MAP" | "OPEN_PLAYER" | "READ_LITURGY" | "READ_KNOWLEDGE" | "OPEN_COMMUNITY" | "OPEN_CHAT" | "NONE",
          "xpReward": integer (10-100)
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext + promptSchema,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const json = JSON.parse(response.text || '{}');
    
    const routine: RoutineItem[] = (json.routine || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
        // Garantia de fallback se a IA falhar nos dias
        dayOfWeek: item.dayOfWeek && item.dayOfWeek.length > 0 ? item.dayOfWeek : [0,1,2,3,4,5,6],
        timeOfDay: (item.timeOfDay || 'morning') as RoutineItem['timeOfDay'],
        actionLink: (item.actionLink || 'NONE') as RoutineItem['actionLink'],
        icon: (item.icon || 'heart') as RoutineItem['icon']
    }));

    return {
        routine,
        profileDescription: json.profileDescription || 'Peregrino da Fé'
    };
  } catch (e: any) {
    if (isQuotaError(e)) {
        lockQuota();
    }
    console.error("Gemini Routine Error", e);
    return getFallbackRoutine();
  }
};

function getFallbackRoutine(): { routine: RoutineItem[], profileDescription: string } {
    return {
        routine: [
             { id: 'f1', title: 'Oração da Manhã', description: 'Oferecimento do dia', detailedContent: "Ao acordar, diga: 'Serviam! (Eu servirei)'. Ofereça suas alegrias e dores.", xpReward: 15, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
             { id: 'f2', title: 'Evangelho do Dia', description: 'Luz para os passos', detailedContent: "Leia o Evangelho da liturgia de hoje e medite por 5 minutos.", xpReward: 20, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
             { id: 'f3', title: 'Santa Missa', description: 'O cume da fé', detailedContent: "Participe da Santa Missa. É o encontro real com Jesus.", xpReward: 100, completed: false, icon: 'church', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_MAP' },
             { id: 'f4', title: 'Intercessão', description: 'Rezar pelos irmãos', detailedContent: "Visite a comunidade e reze por 3 pessoas.", xpReward: 30, completed: false, icon: 'heart', timeOfDay: 'any', dayOfWeek: [2, 4], actionLink: 'OPEN_COMMUNITY' },
             { id: 'f5', title: 'Exame de Consciência', description: 'Revisão do dia', detailedContent: "Antes de dormir, agradeça e peça perdão pelo que falhou.", xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
        ] as RoutineItem[],
        profileDescription: 'Alma em Busca'
    };
  }

// --- DAILY REFLECTION (CACHED BY DATE) ---
export const generateDailyReflection = async (saintOrFeast: string): Promise<string> => {
  const CACHE_KEY = 'daily_reflection_content';
  const cached = getFromCache<string>(CACHE_KEY);
  
  if (cached) return cached;

  if (isQuotaLocked() || !process.env.API_KEY) return "Que a paz de Cristo esteja convosco.";

  try {
    const prompt = `
      Gere uma única frase curta, poética e inspiradora (máximo 20 palavras) baseada na vida de ${saintOrFeast} ou na fé católica para o dia de hoje.
      Retorne APENAS um JSON no formato: { "quote": "Texto da frase aqui" }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const json = JSON.parse(response.text || '{}');
    const result = json.quote?.trim() || "Santos e anjos, rogai por nós.";
    
    saveToCache(CACHE_KEY, result);
    return result;
  } catch (e: any) {
    if (isQuotaError(e)) {
        lockQuota();
    }
    return "Caminhe com fé e esperança.";
  }
};

// --- LITURGICAL TOPIC GENERATOR (CACHED BY DATE AND DAY INDEX) ---
export const generateLiturgicalDailyTopic = async (day: number, seasonContext: string = "Tempo Comum"): Promise<DailyTopic> => {
    const CACHE_KEY = `liturgical_topic_${seasonContext}_day_${day}`; // Unique per season and day
    const cached = getFromCache<DailyTopic>(CACHE_KEY);
    
    if (cached) return cached;

    const fallbackTopic: DailyTopic = {
        day,
        title: "Pequena Caridade",
        description: "Envie uma mensagem de afeto para alguém que você não vê há tempos.",
        isCompleted: false,
        isLocked: false,
        actionType: 'RELATIONSHIP',
        action: "Ligar para um amigo",
        actionContent: "Reserve 5 minutos para ligar ou mandar áudio para alguém distante."
    };

    if (isQuotaLocked() || !process.env.API_KEY) return fallbackTopic;

    const prompt = `
      CONTEXTO: Estamos vivendo o tempo litúrgico: "${seasonContext}". Hoje é o Dia ${day} desta jornada.
      OBJETIVO: Criar uma DESAFIO DIÁRIO (Micro-missão) para uma comunidade católica jovem e engajada.
      
      REGRAS DE OURO:
      1. NÃO repita desafios genéricos como "Reze um Pai Nosso".
      2. O desafio deve ser progressivo e conectado com o dia ${day} do tempo de ${seasonContext}.
      3. Seja criativo! Misture oração, caridade real e pequenos sacrifícios.
      
      Gere um JSON com:
      - title: Título curto e impactante (Ex: "O Silêncio de Maria", "Esmola Digital").
      - description: Motivação teológica curta (1 frase).
      - scripture: Uma citação bíblica curta que fundamente o desafio.
      - actionType: Escolha UM entre 'PRAYER' (oração), 'RELATIONSHIP' (falar com alguém/perdoar), 'SACRIFICE' (jejum/mortificação).
      - actionContent: Instrução passo a passo de como realizar (Max 3 passos).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const data = JSON.parse(response.text || '{}');
        const result: DailyTopic = {
            day,
            title: data.title || `Missão do Dia ${day}`,
            description: data.description || "Realize um ato de amor hoje.",
            action: data.title, // Use title as generic action label
            scripture: data.scripture,
            actionType: data.actionType || 'GENERIC',
            actionContent: data.actionContent || "Realize este ato com amor e intenção.",
            isCompleted: false,
            isLocked: false
        };

        saveToCache(CACHE_KEY, result);
        return result;
    } catch (e: any) {
        if (isQuotaError(e)) lockQuota();
        return fallbackTopic;
    }
}

// --- DAILY THEME ---
export const generateDailyTheme = async (gospelText?: string): Promise<string> => {
  const CACHE_KEY = 'daily_theme_dashboard';
  const cached = getFromCache<string>(CACHE_KEY);
  if (cached) return cached; 

  const context = gospelText || "Tempo Comum - Santidade no Cotidiano"; 

  if (isQuotaLocked() || !process.env.API_KEY) {
     return "Santidade no Cotidiano"; 
  }

  try {
    const prompt = `
      Você é um teólogo católico.
      Leia este contexto: "${context.substring(0, 500)}..."
      Crie uma "Frase de Impacto" curta (máx 5 palavras) resumindo o ensinamento.
      Saída: Apenas a frase.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const result = response.text?.replace(/"/g, '').trim() || "Caminhe com Fé";
    if (result) saveToCache(CACHE_KEY, result);
    return result;

  } catch (e: any) {
    if (isQuotaError(e)) lockQuota();
    return "Luz para o Dia";
  }
};
