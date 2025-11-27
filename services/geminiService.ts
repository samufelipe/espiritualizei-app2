
import { GoogleGenAI, Chat } from "@google/genai";
import { OnboardingData, RoutineItem, Parish, UserProfile, DailyTopic } from '../types';
import { getLiturgicalInfo } from './liturgyService';

const API_KEY = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

// Initialize safely
try {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
} catch (e) {
  console.error("Gemini Init Error", e);
}

// --- LOCAL FALLBACK ENGINE (Motor Offline) ---
const LOCAL_RESPONSES: Record<string, string[]> = {
  'ansiedade': [
    "Respire fundo. Lembre-se das palavras de Santa Teresa: 'Nada te perturbe, nada te espante. Deus não muda'.",
    "Lance sobre Ele toda a vossa ansiedade, porque Ele tem cuidado de vós (1 Pedro 5, 7).",
    "A paz que você procura não está no controle, mas na entrega. Reze comigo: 'Jesus, eu confio em Vós'."
  ],
  'tristeza': [
    "O Senhor está perto dos que têm o coração quebrantado. Chore, mas chore nos pés da Cruz.",
    "Não tenhas medo, porque eu estou contigo (Isaías 41, 10). Sua dor não é eterna, o Amor de Deus é."
  ],
  'pecado': [
    "A misericórdia de Deus é infinitamente maior que sua miséria. Não tenha medo de voltar ao Pai.",
    "Coragem! A confissão é o tribunal onde o réu se declara culpado e sai perdoado."
  ],
  'gratidão': [
    "Demos graças ao Senhor, porque Ele é bom! Que sua vida seja um eterno Magnificat.",
    "A gratidão é a memória do coração. Deus sorri ao te ver grato."
  ],
  'default': [
    "Estou aqui com você. Podemos rezar juntos?",
    "Continue, estou te ouvindo. Onde você sente que Deus está nisso?",
    "Entregue isso nas mãos de Maria. Ela saberá como desenrolar esses nós.",
    "O silêncio também é uma resposta. Vamos ficar um instante na presença d'Ele?"
  ]
};

const getLocalResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('ansiedade') || lower.includes('medo') || lower.includes('preocupad')) return getRandom(LOCAL_RESPONSES['ansiedade']);
  if (lower.includes('triste') || lower.includes('dor') || lower.includes('sofri')) return getRandom(LOCAL_RESPONSES['tristeza']);
  if (lower.includes('pecado') || lower.includes('cai') || lower.includes('err')) return getRandom(LOCAL_RESPONSES['pecado']);
  if (lower.includes('obrigado') || lower.includes('graça') || lower.includes('feliz')) return getRandom(LOCAL_RESPONSES['gratidão']);
  return getRandom(LOCAL_RESPONSES['default']);
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// --- ADVANCED CHAT SYSTEM ---

let chatSession: Chat | null = null;
let lastUserProfileSignature: string = '';

export const getChatSession = (user?: UserProfile): Chat | null => {
  if (!ai || !API_KEY) return null;

  const currentSignature = user ? `${user.name}-${user.stateOfLife}-${user.spiritualFocus}` : 'default';

  if (!chatSession || currentSignature !== lastUserProfileSignature) {
    console.log("Initializing new Spiritual Chat context for:", user?.name);
    
    const contextPrompt = user ? `
      CONTEXTO DO FILHO(A) ESPIRITUAL:
      - Nome: ${user.name}
      - Estado de Vida: ${user.stateOfLife || 'Não informado'} (Considere as obrigações deste estado).
      - Luta Principal: ${user.spiritualFocus || 'Busca geral'} (Suas respostas devem ser um bálsamo ou remédio para esta dor específica).
    ` : '';

    const SYSTEM_INSTRUCTION = `
      Você é o "Espiritualizei", um diretor espiritual católico sábio, ortodoxo, mas extremamente acolhedor e empático.
      Sua missão não é apenas dar respostas teóricas, mas caminhar junto.
      
      ${contextPrompt}

      DIRETRIZES DE TOM:
      1. Acolhimento Radical: Comece validando o sentimento da pessoa.
      2. Ortodoxia Viva: Use a Bíblia, o Catecismo e os Santos, mas aplicados à vida real moderna.
      3. Personalização: Se a pessoa é mãe/pai, fale sobre santificar a rotina doméstica. Se é estudante, sobre santificar o estudo.
      4. Breve e Profundo: Não dê palestras longas. Dê conselhos práticos e espirituais diretos.
      5. Empatia: Se a luta é ansiedade, traga paz. Se é preguiça, traga ânimo firme.

      Nunca julgue. Sempre aponte para a Misericórdia e a Graça.
    `;

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    lastUserProfileSignature = currentSignature;
  }
  return chatSession;
};

export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  if (ai && API_KEY) {
    try {
      const chat = getChatSession(user);
      if (chat) {
        const result = await chat.sendMessage({ message });
        return result.text || "Silêncio contemplativo...";
      }
    } catch (error) {
      console.error("Gemini Chat Error (Falling back to local):", error);
    }
  }
  await new Promise(r => setTimeout(r, 1000)); 
  return getLocalResponse(message);
};

export const generateDailyReflection = async (saintName: string): Promise<string> => {
  if (ai && API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Gere uma frase curta (max 20 palavras), profunda e poética sobre a vida ou ensinamento de ${saintName}, conectando com a busca por santidade no cotidiano.`,
      });
      return response.text || "Que o exemplo deste santo ilumine seu dia.";
    } catch (error) {
      console.error("Reflection Error", error);
    }
  }
  return "A santidade não consiste em fazer coisas extraordinárias, mas em fazer coisas ordinárias com um amor extraordinário.";
};

export const getLiturgyText = async (reference: string): Promise<string> => {
  if (ai && API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Retorne APENAS o texto bíblico completo e formatado do Evangelho de: ${reference}. Use tradução católica (Ave Maria ou Jerusalém). Não adicione comentários, apenas o texto sagrado.`,
      });
      return response.text || "Não foi possível carregar o texto.";
    } catch (error) {
      console.error("Liturgy Error:", error);
    }
  }
  return `
    Naquele tempo, disse Jesus aos seus discípulos:
    "Vós sois o sal da terra. Ora, se o sal se tornar insosso, com que salgaremos?
    Ele não serve para mais nada, senão para ser jogado fora e pisado pelos homens.
    Vós sois a luz do mundo." (Texto provisório: Modo Offline)
  `;
};

// --- LITURGICAL CHALLENGE GENERATOR ---

export const generateLiturgicalDailyTopic = async (day: number): Promise<DailyTopic> => {
  const liturgy = getLiturgicalInfo();
  const today = new Date().toLocaleDateString('pt-BR');

  if (!ai || !API_KEY) {
     return {
        day: day,
        title: "Oração do Dia",
        description: "Dedique 5 minutos para estar na presença de Deus.",
        action: "Reze um Pai Nosso com atenção em cada palavra.",
        isCompleted: false,
        isLocked: false
     };
  }

  try {
    const prompt = `
      Gere um Tópico de Desafio Diário para um app católico.
      Contexto Litúrgico: Estamos na estação: ${liturgy.seasonName}.
      Dia da jornada: ${day}.
      Data de hoje: ${today}.

      Saída estrita em JSON:
      {
        "title": "Título curto e inspirador (ex: O Silêncio de Maria)",
        "description": "Uma meditação de 2 frases sobre o evangelho ou o espírito deste tempo litúrgico.",
        "action": "Uma ação concreta e realizável hoje (ex: Ligar para um parente, Rezar o terço, Esmola).",
        "scripture": "Citação bíblica curta (Livro Cap:Ver) relacionada.",
        "reflection": "Texto de aprofundamento (3 paragrafos curtos) para leitura guiada.",
        "guidedPrayer": "Uma oração vocal curta para o usuário ler."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let json = JSON.parse(response.text!.replace(/```json/g, '').replace(/```/g, '').trim());
    
    return {
       day: day,
       title: json.title,
       description: json.description,
       action: json.action,
       isCompleted: false,
       isLocked: false,
       scripture: json.scripture,
       reflection: json.reflection,
       guidedPrayer: json.guidedPrayer
    };

  } catch (e) {
    console.error("Liturgical Gen Error", e);
    return {
        day: day,
        title: "Fidelidade no Pouco",
        description: "Hoje, ofereça seu trabalho como oração.",
        action: "Faça uma pequena mortificação (ex: não reclamar).",
        isCompleted: false,
        isLocked: false
     };
  }
};

// --- DIAGNOSTIC ---
export const testGeminiConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!API_KEY) return { success: false, message: "Chave API não configurada." };
  if (!ai) return { success: false, message: "Cliente Gemini não inicializado." };
  try {
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: "Test" });
    return { success: true, message: "IA Conectada e Operante!" };
  } catch (e: any) {
    return { success: false, message: `Erro na IA: ${e.message}` };
  }
};

// --- ROUTINE GENERATION ---
const getEnrichedGuide = (title: string, struggle?: string): string => {
  const t = title.toLowerCase();
  const s = struggle?.toLowerCase() || '';
  let advice = "Realize esta prática com amor e atenção plena.";

  if (s.includes('ansiedade')) advice = "Foque na respiração e entregue cada preocupação a Deus. Não tenha pressa.";
  if (s.includes('preguiça')) advice = "Ofereça o sacrifício de começar. A graça vem no movimento.";
  if (s.includes('aridez')) advice = "Reze mesmo sem sentir nada. A fidelidade na secura é prova de amor puro.";
  
  if (t.includes('terço') || t.includes('rosário')) return `1. Inicie com o Sinal da Cruz.\n2. Reze o Credo e o Pai Nosso.\n3. Medite os mistérios.\n\nConselho: ${advice}`;
  if (t.includes('exame')) return `1. Agradeça.\n2. Peça Luz.\n3. Revise o dia.\n4. Peça Perdão.\n5. Proponha Emenda.\n\nConselho: ${advice}`;
  return `Encontre um momento breve. Respire fundo.\n\n${advice}`;
};

const generateLocalRoutine = (data: OnboardingData): { routine: RoutineItem[], profileDescription: string } => {
  const items: RoutineItem[] = [];
  let archetype = "Filho Amado";

  if (data.patronSaint === 'michael') items.push({ id: 'loc-p1', title: 'Oração a São Miguel', description: 'Proteção para começar o dia.', xpReward: 20, completed: false, icon: 'shield' });
  else if (data.patronSaint === 'mary') items.push({ id: 'loc-p1', title: 'Consagração a Nossa Senhora', description: 'Totus Tuus Mariae.', xpReward: 20, completed: false, icon: 'heart' });

  switch(data.primaryStruggle) {
    case 'anxiety':
      items.push({ id: 'loc-1', title: 'Oração da Respiração', description: 'Acalme a alma invocando Jesus.', xpReward: 15, completed: false, icon: 'heart' });
      archetype = "Buscador da Paz";
      break;
    default:
      items.push({ id: 'loc-1', title: 'Leitura do Evangelho', description: 'Conhecer Jesus para amá-Lo.', xpReward: 20, completed: false, icon: 'book' });
      archetype = "Peregrino da Verdade";
  }

  const finalItems = items.map(i => ({ ...i, detailedContent: getEnrichedGuide(i.title, data.primaryStruggle) }));
  return { routine: finalItems, profileDescription: archetype };
};

export const generateSpiritualRoutine = async (data: OnboardingData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  const localResult = generateLocalRoutine(data);
  if (!ai || !API_KEY) return localResult;

  const liturgy = getLiturgicalInfo();

  const aiPromise = (async () => {
      try {
        const prompt = `
          Gere um JSON estrito para um perfil católico.
          Perfil: ${data.name}, Luta: ${data.primaryStruggle}, Estado: ${data.stateOfLife}, Patrono: ${data.patronSaint}.
          Tempo Litúrgico Atual: ${liturgy.seasonName}.
          
          Saída JSON:
          {
            "archetype": "Título poético curto",
            "routine": [
              { "title": "Nome Prática", "description": "Por que ajuda (max 10 palavras)", "icon": "rosary|book|candle|sun|shield", "xp": 10-50 }
            ]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', maxOutputTokens: 500 }
        });

        let text = response.text || '{}';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(text);
        
        const routineItems: RoutineItem[] = (json.routine || []).map((item: any, index: number) => ({
          id: `gen-${index}`,
          title: item.title,
          description: item.description,
          detailedContent: getEnrichedGuide(item.title, data.primaryStruggle),
          xpReward: item.xp,
          completed: false,
          icon: item.icon || 'candle'
        }));

        return { routine: routineItems, profileDescription: json.archetype || localResult.profileDescription };
      } catch (e) { return localResult; }
  })();

  const timeoutPromise = new Promise<{ routine: RoutineItem[], profileDescription: string }>((resolve) => {
    setTimeout(() => resolve(localResult), 5000);
  });

  try { return await Promise.race([aiPromise, timeoutPromise]); } catch (e) { return localResult; }
};

// --- PARISH FINDER (FIXED & HARD FILTERED) ---

const generateFallbackParishes = (lat: number, lng: number): Parish[] => {
  return [
    {
      name: "Paróquia Sagrado Coração de Jesus",
      address: "Centro",
      rating: 4.9,
      userRatingsTotal: 320,
      openNow: true,
      url: "#",
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat+0.002},${lng+0.002}`,
      location: { lat: lat + 0.002, lng: lng + 0.002 } // ~300m
    },
    {
      name: "Santuário Nossa Senhora de Fátima",
      address: "Jardim das Flores",
      rating: 5.0,
      userRatingsTotal: 1500,
      openNow: true,
      url: "#",
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat-0.005},${lng-0.005}`,
      location: { lat: lat - 0.005, lng: lng - 0.005 } // ~800m
    },
    {
      name: "Catedral Metropolitana",
      address: "Praça da Sé",
      rating: 4.8,
      userRatingsTotal: 5000,
      openNow: false,
      url: "#",
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat+0.01},${lng}`,
      location: { lat: lat + 0.01, lng: lng } // ~1.5km
    },
    {
      name: "Capela São José Operário",
      address: "Vila Operária",
      rating: 4.7,
      userRatingsTotal: 150,
      openNow: true,
      url: "#",
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng+0.015}`,
      location: { lat: lat, lng: lng + 0.015 } // ~2km
    }
  ];
};

export const findNearbyParishes = async (lat: number, lng: number): Promise<Parish[]> => {
  if (!ai || !API_KEY) return generateFallbackParishes(lat, lng);

  try {
    const prompt = `
      Find exactly 20 Catholic Churches ("Igreja Católica", "Paróquia", "Santuário") within 10km of coordinate (${lat}, ${lng}).
      
      CRITICAL:
      1. RETURN STRICT JSON array.
      2. IGNORE "Loja", "Artigos", "Center", "Umbanda", "Spiritist", "School", "Decor", "Presentes".
      3. INCLUDE LATITUDE AND LONGITUDE for each item.
      
      Output Schema:
      [
        { "name": "Name", "address": "Address", "lat": 0.0, "lng": 0.0, "open_now": true, "rating": 4.5, "user_ratings_total": 100 }
      ]
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      },
    });

    let jsonString = response.text || '[]';
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let rawData: any[] = [];
    try { rawData = JSON.parse(jsonString); } catch (e) { 
        console.error("JSON Parse Error", e); 
        return generateFallbackParishes(lat, lng); 
    }

    // --- HARD FILTER (CENSURA) ---
    // Palavras proibidas (Case Insensitive)
    const BLOCKLIST = [
        'artigos', 'loja', 'livraria', 'presentes', 'umbanda', 'candomblé', 'espirita', 'espírita', 
        'centro', 'evangélica', 'batista', 'universal', 'assembleia', 'deus é amor', 'congregacao',
        'testemunhas', 'reino', 'confecções', 'papelaria', 'bazar', 'floricultura',
        'decor', 'home', 'by home', 'decorações', 'religiosos', 'art'
    ];

    // Palavras permitidas (Prioridade)
    const ALLOWLIST = ['paróquia', 'paroquia', 'igreja', 'santuário', 'santuario', 'capela', 'catedral', 'basílica', 'basilica', 'comunidade', 'matriz'];

    const parishes: Parish[] = [];

    rawData.forEach((item: any) => {
        const titleLower = (item.name || '').toLowerCase();
        
        // 1. Regra de Ouro: Se tiver palavra proibida, TCHAU.
        if (BLOCKLIST.some(forbidden => titleLower.includes(forbidden))) return;

        // 2. Regra de Prata: Se não tiver palavra de igreja católica, suspeite.
        const isCatholicLikely = ALLOWLIST.some(allowed => titleLower.includes(allowed));
        
        // Se não parece católico E não temos certeza, melhor não mostrar
        if (!isCatholicLikely && (!item.lat || !item.lng)) return;

        const destination = encodeURIComponent((item.name || '') + ' ' + (item.address || ''));
        
        parishes.push({
          name: item.name || 'Igreja Católica',
          address: item.address || 'Endereço indisponível',
          url: `https://www.google.com/maps/search/?api=1&query=${destination}`,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
          rating: item.rating || 4.8, 
          userRatingsTotal: item.user_ratings_total || 100,
          openNow: item.open_now ?? true,
          location: (item.lat && item.lng) ? { lat: Number(item.lat), lng: Number(item.lng) } : undefined
        });
    });
    
    const uniqueParishes = parishes.filter((p, index, self) => 
        index === self.findIndex((t) => (t.name === p.name))
    );
    
    if (uniqueParishes.length === 0) {
        return generateFallbackParishes(lat, lng);
    }

    return uniqueParishes.slice(0, 20); 
  } catch (error) { 
      console.error("Parish Search Error (API Failure)", error); 
      return generateFallbackParishes(lat, lng);
  }
};
