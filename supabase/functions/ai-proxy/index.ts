import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
declare const Deno: any;

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const ANT_BASE = 'https://api.anthropic.com/v1/messages';
const getModel = () => Deno.env.get('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001';

async function callClaude(
  userText: string,
  apiKey: string,
  options: { system?: string; maxTokens?: number; tools?: any[] } = {}
): Promise<string> {
  const body: any = { model: getModel(), max_tokens: options.maxTokens || 1024, messages: [{ role: 'user', content: userText }] };
  if (options.system) body.system = options.system;
  if (options.tools) { body.tools = options.tools; body.tool_choice = { type: 'tool', name: options.tools[0].name }; }
  const res = await fetch(ANT_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  if (options.tools && data.content?.[0]?.type === 'tool_use') return JSON.stringify(data.content[0].input);
  return data.content?.[0]?.text ?? '';
}

const ROUTINE_TOOL = {
  name: 'routine_output',
  description: 'Retorna a rotina espiritual semanal personalizada.',
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

const JOURNAL_TOOL = {
  name: 'journal_reflection',
  description: 'Retorna reflexao espiritual e versiculo para o diario.',
  input_schema: {
    type: 'object',
    properties: {
      reflection: { type: 'string' },
      verse: { type: 'string' },
    },
    required: ['reflection', 'verse'],
  },
};

const FRIEND_SYSTEM = `Voce e o melhor amigo do usuario: jovem, divertido, cheio de empatia e com um conhecimento profundo da fe catolica.
Nao e padre, nao e professor, nao e chato. Fala em portugues do Brasil, naturalmente, com calor humano.
NUNCA usa negritos, hifens longos, listas roboticas ou linguagem de sermao.
Escreve como uma mensagem de WhatsApp boa: fluida, calorosa, real, que faz a pessoa se sentir amada e compreendida.`;

const ROUTINE_SYSTEM = `Voce e o melhor amigo espiritual que alguem poderia ter.
Jovem, acolhedor, com conhecimento enciclopedico da fe catolica, mas fala como amigo, sem linguagem de padre ou sermao.

CONHECIMENTO PROFUNDO QUE VOCE TEM:
- Liturgia de cada dia da semana e seu significado historico na Igreja
- Vida real de centenas de Santos: historias verdadeiras, lutas, frases marcantes
- Os 7 Sacramentos e como transformam a vida pratica
- O Catecismo da Igreja Catolica aplicado ao dia a dia real
- Lutas espirituais mais comuns em jovens e adultos hoje
- Tradicao da oracao: Rosario, Liturgia das Horas, Lectio Divina, Exame de Consciencia
- Espiritualidade dos grandes mestres: Sao Joao da Cruz, Santa Teresa de Avila, Sao Joao Maria Vianney

TEMATICA SAGRADA DE CADA DIA (respeite sempre):
- Domingo (0): Santa Missa - centro e fonte de tudo, dia do Senhor
- Segunda (1): Almas do Purgatorio e intercessao pelos que ja partiram
- Terca (2): Santos Anjos e protecao espiritual no dia a dia
- Quarta (3): Sao Jose e santidade no trabalho e na vida familiar
- Quinta (4): Santissima Eucaristia e presenca real de Jesus
- Sexta (5): Paixao de Cristo, penitencia, misericordia e perdao
- Sabado (6): Nossa Senhora, devoção mariana, o rosario como ancora

REGRAS OBRIGATORIAS:
1. Gere EXATAMENTE 3 itens por dia = 21 itens no total
2. title: nome bonito e humano (ex: "Conversa com Deus ao acordar", nao "Oracao Matutina")
3. description: UMA frase calorosa e real explicando o porque, sem ser robotico
4. detailedContent: 2-3 frases praticas como um amigo ensinando. Use exemplos concretos do dia a dia. Simples o suficiente para uma crianca de 10 anos conseguir fazer
5. xpReward: 15 a 100, proporcional a dificuldade e tempo real que exige
6. icon: escolha entre: rosary, book, cross, candle, sun, heart, shield, moon
7. timeOfDay: morning, afternoon, night, ou any (adapte ao melhor momento do usuario)
8. actionLink: READ_LITURGY, OPEN_COMMUNITY, OPEN_SOCIAL, READ_KNOWLEDGE, ou NONE

ADAPTE PROFUNDAMENTE AO PERFIL:
- ANSIEDADE: Salmos de confianca (Sl 23, 46, 91), oracao da serenidade, Sao Pio de Pietrelcina, respiracao na presenca de Deus
- PREGUICA: Comeos muito pequenos e progressivos sem pressao, Carlo Acutis como modelo jovem e real
- IMPUREZA: Devoção intensa a Maria, Rosario como ancora diaria, jejum suave, Sao Domingos Savio
- ORGULHO: Servico pratico aos outros, exame de consciencia detalhado, humildade silenciosa de Sao Jose
- IRA: Sao Francisco de Sales (meigo e paciente), meditacao especifica no perdao, parar antes de reagir
- SECURA ESPIRITUAL: Adoracao contemplativa, Lectio Divina devagar, Santa Teresinha do Menino Jesus
- IGNORANCIA: Catecismo de forma acessivel, historia viva dos santos contada com vida, Sao Tomas simplificado

profileDescription: UMA frase calida e especifica que resume quem essa pessoa e espiritualmente (sem cliches)
profileReasoning: 2-3 frases com carinho explicando por que voce escolheu ESSA rotina especificamente pra ela

NUNCA use negritos, asteriscos, hifens decorativos ou linguagem robotica`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!API_KEY) return new Response(
      JSON.stringify({ success: false, error: 'AI service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    const { action, payload } = await req.json();
    let result: Record<string, any>;

    switch (action) {

      case 'sendMessage': {
        const { message, userContext } = payload;
        const text = await callClaude(message, API_KEY, {
          system: FRIEND_SYSTEM + '\n\nContexto do usuario: ' + (userContext || 'Um irmao buscando Deus.'),
        });
        result = { text };
        break;
      }

      case 'generateTheme': {
        const text = await callClaude(
          `Esse e o Evangelho de hoje: "${payload.gospelText}"\n\nMe conta, em no maximo 12 palavras simples e poeticas, qual e o coracao dessa mensagem pra vida real de quem le hoje? Como se voce tivesse acabado de ler e ficado com o coracao cheio. Sem jargao religioso.`,
          API_KEY,
          {
            system: 'Voce e um jovem apaixonado pelo Evangelho que explica tudo com palavras simples e bonitas, tao claro que ate uma crianca de 5 anos entende e se encanta. Sem simbolos, sem negritos, so palavras bonitas e verdadeiras.',
            maxTokens: 60,
          }
        );
        result = { text: text.trim() };
        break;
      }

      case 'generateReflection': {
        const text = await callClaude(
          `Hoje e o dia de ${payload.saint}. Me da UMA frase (maximo 20 palavras) que capture algo real que esse santo viveu, disse ou ensinou, de um jeito que faca meu coracao bater mais forte. Simples, verdadeiro, profundo.`,
          API_KEY,
          {
            system: 'Voce e um jovem apaixonado pelos Santos da Igreja. Conhece a historia real de cada um: as dores, as escolhas corajosas, as palavras que marcaram geracoes. Fala sobre eles com afeto profundo, como quem realmente os ama. Nada de linguagem de sermao. So calor e verdade. Sem negritos ou simbolos.',
            maxTokens: 80,
          }
        );
        result = { text: text.trim() };
        break;
      }

      case 'generateJournalReflection': {
        const { mood, content } = payload;
        const moodLabel = mood === 'peace' ? 'paz e consolacao' : 'dificuldade e desolacao';
        const text = await callClaude(
          `Meu amigo esta sentindo: ${moodLabel}.\n\nEle escreveu: "${content}"\n\nResponda com uma reflexao espiritual curta (max 20 palavras) feita especialmente pra ele, e um versiculo biblico real e especifico que fale exatamente ao coracao dele nesse momento.`,
          API_KEY,
          {
            system: FRIEND_SYSTEM + ' Seu papel aqui e de conselheiro espiritual amoroso. Voce le o que a pessoa escreveu com muita atencao e responde algo que ela sente que foi feito especialmente pra ela, nao conselho generico.',
            maxTokens: 200,
            tools: [JOURNAL_TOOL],
          }
        );
        const parsed = JSON.parse(text || '{}');
        result = {
          reflection: parsed.reflection ?? 'Deus te ve e te ama nesse momento.',
          verse: parsed.verse ?? 'Salmo 139, 1',
        };
        break;
      }

      case 'sendMessageToGuide': {
        const text = await callClaude(payload.message, API_KEY, { system: FRIEND_SYSTEM, maxTokens: 300 });
        result = { text };
        break;
      }

      case 'generateRoutine': {
        const { userData, reviewData } = payload;
        const lifeMap: Record<string, string> = { student: 'estudante', single: 'solteiro(a)', married: 'casado(a)', parent: 'pai/mae de familia', retired: 'aposentado(a)' };
        const struggleMap: Record<string, string> = { anxiety: 'ansiedade e preocupacao excessiva', lust: 'impureza e tentacoes', laziness: 'preguica espiritual e falta de animo', pride: 'orgulho e dificuldade de se humilhar', anger: 'ira e impaciencia', dryness: 'secura espiritual (oracao parece vazia)', ignorance: 'falta de conhecimento da propria fe' };
        const goalMap: Record<string, string> = { peace: 'encontrar paz interior e serenidade', truth: 'conhecer a verdade da fe mais profundamente', discipline: 'ter disciplina e constancia espiritual', love: 'aprender a amar de verdade (a Deus e ao proximo)', healing: 'buscar cura interior e libertacao' };
        const momentMap: Record<string, string> = { morning: 'pela manha ao acordar', commute: 'durante o trajeto/transporte', breaks: 'nos intervalos do dia', night: 'a noite antes de dormir', random: 'em momentos livres ao longo do dia' };
        const routineMap: Record<string, string> = { chaotic: 'vida caotica, horarios imprevisivos', structured: 'rotina bem organizada', flexible: 'rotina flexivel com alguns compromissos fixos', overwhelmed: 'sobrecarregado(a) com pouquissimo tempo livre' };
        const confMap: Record<string, string> = { frequent: 'se confessa com frequencia', rare: 'raramente se confessa', long_time: 'ha muito tempo sem se confessar', never: 'nunca se confessou ou esta redescubrindo a fe' };
        const patronMap: Record<string, string> = { acutis: 'Beato Carlo Acutis (jovem beato dos nossos tempos, evangelizador digital)', michael: 'Sao Miguel Arcanjo (protecao e combate espiritual)', therese: 'Santa Teresinha do Menino Jesus (o pequeno caminho do amor)', joseph: 'Sao Jose (trabalhador silencioso, pai e esposo fiel)', mary: 'Nossa Senhora (mae, intercessora, estrela da manha)' };

        const ctx = [
          'Nome: ' + userData.name,
          'Estado de vida: ' + (lifeMap[userData.stateOfLife] || userData.stateOfLife),
          'Maior luta espiritual: ' + (struggleMap[userData.primaryStruggle] || userData.primaryStruggle),
          'Objetivo espiritual: ' + (goalMap[userData.spiritualGoal] || userData.spiritualGoal),
          'Tipo de rotina/vida: ' + (routineMap[userData.routineType] || userData.routineType),
          'Melhor momento pra orar: ' + (momentMap[userData.bestMoment] || userData.bestMoment),
          'Situacao com a Confissao: ' + (confMap[userData.confessionFrequency] || userData.confessionFrequency),
          userData.patronSaint ? 'Santo intercessor escolhido: ' + (patronMap[userData.patronSaint] || userData.patronSaint) : '',
          reviewData
            ? 'FEEDBACK DO MES ANTERIOR: rotina estava '
              + (reviewData.intensity === 'too_heavy' ? 'pesada demais' : reviewData.intensity === 'too_light' ? 'leve demais' : 'equilibrada')
              + ', constancia ' + reviewData.consistency
              + (reviewData.newStruggle ? ', nova luta: ' + reviewData.newStruggle : '')
              + (reviewData.newGoal ? ', novo objetivo: ' + (goalMap[reviewData.newGoal] || reviewData.newGoal) : '')
            : '',
        ].filter(Boolean).join('\n');

        const text = await callClaude(
          'Crie a rotina espiritual personalizada para:\n\n' + ctx,
          API_KEY,
          { system: ROUTINE_SYSTEM, maxTokens: 6000, tools: [ROUTINE_TOOL] }
        );
        const json = JSON.parse(text || '{}');
        result = {
          profileDescription: json.profileDescription ?? 'Peregrino em busca de Deus',
          profileReasoning: json.profileReasoning ?? 'Cada passo, por menor que seja, e um sim a Deus.',
          routine: (json.routine ?? []).map((i: any) => ({ ...i, id: crypto.randomUUID(), completed: false })),
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Acao desconhecida: ' + action }),
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