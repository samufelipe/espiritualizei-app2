import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const flashModel = () => Deno.env.get('GEMINI_FLASH_MODEL') || 'gemini-2.0-flash';
const proModel = () => Deno.env.get('GEMINI_PRO_MODEL') || 'gemini-2.0-flash';

async function callGemini(model: string, userText: string, apiKey: string, opts: {
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
} = {}): Promise<string> {
  const body: any = { contents: [{ parts: [{ text: userText }] }] };
  if (opts.systemInstruction) body.system_instruction = { parts: [{ text: opts.systemInstruction }] };
  if (opts.responseMimeType) {
    body.generationConfig = {
      responseMimeType: opts.responseMimeType,
      ...(opts.responseSchema && { responseSchema: opts.responseSchema }),
    };
  }
  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

const ROUTINE_SCHEMA = {
  type: 'object',
  properties: {
    profileDescription: { type: 'string' },
    profileReasoning: { type: 'string' },
    routine: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          detailedContent: { type: 'string' },
          xpReward: { type: 'number' },
          icon: { type: 'string' },
          timeOfDay: { type: 'string' },
          dayOfWeek: { type: 'array', items: { type: 'integer' } },
          actionLink: { type: 'string' },
        },
        required: ['title', 'description', 'xpReward', 'icon', 'timeOfDay', 'dayOfWeek', 'actionLink'],
      },
    },
  },
  required: ['profileDescription', 'profileReasoning', 'routine'],
};

const ROUTINE_SYSTEM = `Você é um Guia de Jornada Católica. Crie uma Regra de Vida personalizada e ÚNICA para cada dia da semana.
- Domingo (0): FOCO NA SANTA MISSA.
- Segunda (1): Almas do Purgatório. (Ação: READ_KNOWLEDGE)
- Terça (2): Santos Anjos. (Ação: READ_LITURGY)
- Quarta (3): São José. (Ação: OPEN_COMMUNITY)
- Quinta (4): Eucaristia. (Ação: OPEN_SOCIAL)
- Sexta (5): Paixão e Penitência. (Ação: READ_LITURGY)
- Sábado (6): Nossa Senhora. (Ação: OPEN_COMMUNITY)
Gere 3-4 itens por dia. Tom humilde e natural. Ações válidas: READ_LITURGY, OPEN_COMMUNITY, OPEN_SOCIAL, READ_KNOWLEDGE, NONE.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, payload } = await req.json();
    let result: Record<string, any>;

    switch (action) {
      case 'sendMessage': {
        const sys = `Você é um assistente católico humilde, sábio e acolhedor. RESPONDA EM PORTUGUÊS DO BRASIL. Tom fraternal, sem negritos ou símbolos de IA. Contexto: ${payload.userContext || 'Um irmão em busca de orientação.'}`;
        const text = await callGemini(flashModel(), payload.message, API_KEY, { systemInstruction: sys });
        result = { text };
        break;
      }
      case 'generateTheme': {
        const text = await callGemini(flashModel(), `Resuma em uma frase curta e poética (max 10 palavras) em Português, sem símbolos: ${payload.gospelText}`, API_KEY);
        result = { text };
        break;
      }
      case 'generateReflection': {
        const text = await callGemini(flashModel(), `Frase católica curta e inspiradora inspirada em ${payload.saint}. Max 20 palavras, sem símbolos.`, API_KEY);
        result = { text };
        break;
      }
      case 'sendMessageToGuide': {
        const text = await callGemini(flashModel(), payload.message, API_KEY);
        result = { text };
        break;
      }
      case 'generateRoutine': {
        const { userData, reviewData } = payload;
        const ctx = `Nome: ${userData.name}. Luta: ${userData.primaryStruggle}. Objetivo: ${userData.spiritualGoal}. Disponibilidade: ${userData.routineType}. Melhor momento: ${userData.bestMoment}. ${reviewData ? `Feedback: ${reviewData.intensity}, ${reviewData.consistency}.` : ''}`;
        const text = await callGemini(proModel(), ctx, API_KEY, {
          systemInstruction: ROUTINE_SYSTEM,
          responseMimeType: 'application/json',
          responseSchema: ROUTINE_SCHEMA,
        });
        const json = JSON.parse(text || '{}');
        result = {
          profileDescription: json.profileDescription ?? 'Peregrino',
          profileReasoning: json.profileReasoning ?? 'Caminho de fé.',
          routine: (json.routine ?? []).map((i: any) => ({ ...i, id: crypto.randomUUID(), completed: false })),
        };
        break;
      }
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Ação desconhecida: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
