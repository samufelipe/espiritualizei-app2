import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1/messages';

const getModel = () => Deno.env.get('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001';

async function callClaude(
  userText: string,
  apiKey: string,
  options: {
    system?: string;
    maxTokens?: number;
    tools?: any[];
  } = {}
): Promise<string> {
  const body: any = {
    model: getModel(),
    max_tokens: options.maxTokens || 1024,
    messages: [{ role: 'user', content: userText }],
  };

  if (options.system) {
    body.system = options.system;
  }

  if (options.tools) {
    body.tools = options.tools;
    body.tool_choice = { type: 'tool', name: options.tools[0].name };
  }

  const res = await fetch(ANTHROPIC_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));

  if (options.tools && data.content?.[0]?.type === 'tool_use') {
    return JSON.stringify(data.content[0].input);
  }

  return data.content?.[0]?.text ?? '';
}

const ROUTINE_TOOL = {
  name: 'routine_output',
  description: 'Retorna a rotina espiritual semanal personalizada em formato estruturado.',
  input_schema: {
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
  },
};

const ROUTINE_SYSTEM_PROMPT = `Voce e um Guia de Jornada Catolica. Crie uma Regra de Vida personalizada e UNICA para cada dia da semana.
IMPORTANTE: Cada dia da semana DEVE ter itens especificos que NAO se repetem nos outros dias, respeitando a tradicao da Igreja:
- Domingo (0): FOCO ABSOLUTO NA SANTA MISSA.
- Segunda (1): Almas do Purgatorio e Doutrina. (Acao: READ_KNOWLEDGE)
- Terca (2): Santos Anjos e Combate Espiritual. (Acao: READ_LITURGY)
- Quarta (3): Sao Jose e Santidade no Trabalho/Familia. (Acao: OPEN_COMMUNITY)
- Quinta (4): Santissima Eucaristia e Sacerdocio. (Acao: OPEN_SOCIAL)
- Sexta (5): Paixao de Nosso Senhor e Penitencia. (Acao: READ_LITURGY)
- Sabado (6): Nossa Senhora. (Acao: OPEN_COMMUNITY)
REGRAS: Gere 3-4 itens por dia. Use tons humildes e naturais. NUNCA use negritos ou simbolos.
Acoes validas: READ_LITURGY, OPEN_COMMUNITY, OPEN_SOCIAL, READ_KNOWLEDGE, NONE.`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
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
        const { message, userContext } = payload;
        const system = `Voce e um assistente catolico humilde, sabio e acolhedor.
RESPONDA SEMPRE EM PORTUGUES DO BRASIL.
Seu tom e de um irmao que caminha junto, nunca autoritario ou frio.
NUNCA use negritos, hifens longos ou listas numeradas roboticas.
Escreva de forma fluida, como uma carta de um amigo.
Contexto: ${userContext || 'Um irmao em busca de orientacao.'}`;
        const text = await callClaude(message, API_KEY, { system });
        result = { text };
        break;
      }

      case 'generateTheme': {
        const text = await callClaude(
          `Resuma este Evangelho em uma frase curta, poetica e humana (maximo 10 palavras) em Portugues. NAO use negritos ou simbolos: ${payload.gospelText}`,
          API_KEY,
          { maxTokens: 50 }
        );
        result = { text };
        break;
      }

      case 'generateReflection': {
        const text = await callClaude(
          `Gere uma frase catolica curta, inspiradora e humana inspirada em ${payload.saint}. Maximo 20 palavras. NAO use negritos ou simbolos.`,
          API_KEY,
          { maxTokens: 60 }
        );
        result = { text };
        break;
      }

      case 'sendMessageToGuide': {
        const text = await callClaude(payload.message, API_KEY);
        result = { text };
        break;
      }

      case 'generateRoutine': {
        const { userData, reviewData } = payload;
        const userContext = `Nome: ${userData.name}. Luta: ${userData.primaryStruggle}. Objetivo: ${userData.spiritualGoal}. Disponibilidade: ${userData.routineType}. Melhor momento: ${userData.bestMoment}.${reviewData ? ` Feedback: Intensidade ${reviewData.intensity}, Constancia ${reviewData.consistency}.` : ''}`;
        const text = await callClaude(userContext, API_KEY, {
          system: ROUTINE_SYSTEM_PROMPT,
          maxTokens: 4096,
          tools: [ROUTINE_TOOL],
        });
        const json = JSON.parse(text || '{}');
        result = {
          profileDescription: json.profileDescription ?? 'Peregrino',
          profileReasoning: json.profileReasoning ?? 'Caminho de fe.',
          routine: (json.routine ?? []).map((i: any) => ({
            ...i,
            id: crypto.randomUUID(),
            completed: false,
          })),
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Acao desconhecida: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ai-proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
