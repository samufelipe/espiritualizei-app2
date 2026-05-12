import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

declare const Deno: any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Semente',
  2: 'Peregrino',
  3: 'Discípulo',
  4: 'Servo',
  5: 'Contemplativo',
}

const PRAYER_REALITY_LABELS: Record<string, string> = {
  consistent: 'tem uma rotina de oração, mesmo que imperfeita',
  occasional: 'ora quando lembra ou quando precisa muito',
  struggling: 'quer rezar mas não consegue manter',
  distant:    'faz tempo que não se sente próximo de Deus',
}

function buildWeekPrompt(
  weekNum: number,
  startDay: number,
  weekFocus: string,
  weekFocusLabel: string,
  weekThemeHint: string,
  weekIconHint: string,
  displayName: string,
  displayLevel: string,
  answers: any,
  dims: any,
): string {
  const dimLabels = {
    oracao:      dims?.oracao      ?? 50,
    sacramento:  dims?.sacramento  ?? 50,
    formacao:    dims?.formacao    ?? 50,
    comunidade:  dims?.comunidade  ?? 50,
    missao:      dims?.missao      ?? 50,
  }

  const days = Array.from({ length: 7 }, (_, i) => startDay + i).join(', ')

  return `Você é um diretor espiritual católico.
Gere os dias ${days} de um plano espiritual personalizado para ${displayName} (nível: ${displayLevel}).

Perfil:
- Desafio: ${answers?.challenge || 'N/A'}
- Oração: ${PRAYER_REALITY_LABELS[answers?.prayerReality] || answers?.prayer || 'N/A'}
- Objetivo: ${answers?.goal || 'N/A'}
- Fase de vida: ${answers?.state || answers?.lifeStage || 'N/A'}
- Impedimento: ${answers?.obstacle || 'N/A'}
Dimensões (0-100): Oração ${dimLabels.oracao} | Sacramento ${dimLabels.sacramento} | Formação ${dimLabels.formacao} | Comunidade ${dimLabels.comunidade} | Missão ${dimLabels.missao}

Esta é a SEMANA ${weekNum}. Tema: "${weekThemeHint}". Foco: ${weekFocus} ("${weekFocusLabel}").

Para cada um dos 7 dias (${days}), forneça:
- day: número do dia (${startDay} a ${startDay + 6})
- intention: frase em 1ª pessoa ("Hoje escolho..."), pessoal e empática, máximo 20 palavras
- prayer: nome da prática espiritual (ex: "Lectio Divina", "Rosário", "Exame de consciência")
- prayer_steps: array de 3 strings — passos didáticos curtos (max 15 palavras cada) ensinando a prática
- task: nome curto da tarefa prática
- task_steps: array de 3 strings — passos concretos curtos (max 15 palavras cada)
- verse: "Referência — Texto do versículo." (ex: "Jo 15,5 — Sem mim, nada podeis fazer.")
- resource_search: termo de busca YouTube em português para a prática do dia
- duration_minutes: inteiro entre 10 e 30

REGRAS: Cada dia deve ter oração, versículo e prática DIFERENTES dos outros dias. Linguagem acessível, conteúdo católico.

Retorne APENAS JSON válido:
{"theme":"${weekThemeHint}","weekSummary":"Frase inspiradora de até 10 palavras.","lucideIcon":"${weekIconHint}","days":[{"day":${startDay},"intention":"...","prayer":"...","prayer_steps":["...","...","..."],"task":"...","task_steps":["...","...","..."],"verse":"Ref — Texto.","resource_search":"...","duration_minutes":15}]}`
}

async function callClaude(apiKey: string, prompt: string): Promise<string | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Anthropic API error:', errText)
    return null
  }

  const data = await res.json()
  return data?.content?.[0]?.text || null
}

function parseWeekJson(raw: string | null, weekNum: number): any | null {
  if (!raw) return null
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) { console.error(`Semana ${weekNum}: sem JSON na resposta`); return null }
    return JSON.parse(match[0])
  } catch (e: any) {
    console.error(`Semana ${weekNum}: JSON inválido —`, e.message)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY não configurado')
      return new Response(JSON.stringify({ error: 'Servidor mal configurado', plan: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const quizData = await req.json()
    const { name, level, levelName, answers, dims } = quizData

    const displayName  = name      || 'Caminhante'
    const displayLevel = levelName || LEVEL_NAMES[level] || 'Peregrino'

    // Definir temas das semanas com base nas respostas
    const CHALLENGE_THEMES: Record<string, { theme: string; icon: string }> = {
      anxiety:   { theme: 'Aprender a descansar em Deus',         icon: 'wind'      },
      laziness:  { theme: 'Construindo o hábito da presença',     icon: 'anchor'    },
      dryness:   { theme: 'Reencontrar Deus no silêncio',         icon: 'cloud'     },
      ignorance: { theme: 'Conhecer para amar com mais força',    icon: 'book-open' },
      pride:     { theme: 'O caminho do esvaziamento interior',   icon: 'feather'   },
      lust:      { theme: 'Ordenando o coração com misericórdia', icon: 'heart'     },
    }
    const GOAL_THEMES: Record<string, { theme: string; icon: string }> = {
      peace:      { theme: 'Cultivando a paz que o mundo não dá', icon: 'sun'       },
      truth:      { theme: 'Formação e aprofundamento da fé',      icon: 'lightbulb' },
      discipline: { theme: 'A disciplina como ato de amor',        icon: 'target'    },
      love:       { theme: 'Amar como Deus ama',                   icon: 'heart'     },
      healing:    { theme: 'Cura e libertação pelo amor divino',   icon: 'leaf'      },
    }
    const STATE_THEMES: Record<string, { theme: string; icon: string }> = {
      student: { theme: 'Crescendo na fé em cada fase',           icon: 'book-open' },
      single:  { theme: 'A missão de quem caminha livre',         icon: 'user'      },
      married: { theme: 'O casal que ora junto permanece junto',  icon: 'users'     },
      parent:  { theme: 'A espiritualidade de quem serve a vida', icon: 'home'      },
      retired: { theme: 'A sabedoria da contemplação madura',     icon: 'coffee'    },
    }

    const w1 = CHALLENGE_THEMES[answers?.challenge] || { theme: 'Regularidade na oração',  icon: 'heart'     }
    const w2 = GOAL_THEMES[answers?.goal]            || { theme: 'Aprofundamento da fé',    icon: 'lightbulb' }
    const w3 = STATE_THEMES[answers?.state]          || { theme: 'Integração com a vida',   icon: 'star'      }

    // Gerar as 3 semanas em paralelo
    console.log(`Gerando plano para ${displayName} (${displayLevel}) — 3 semanas em paralelo`)

    const [raw1, raw2, raw3] = await Promise.all([
      callClaude(apiKey, buildWeekPrompt(1,  1, 'desafio principal', answers?.challenge || 'regularidade', w1.theme, w1.icon, displayName, displayLevel, answers, dims)),
      callClaude(apiKey, buildWeekPrompt(2,  8, 'objetivo espiritual', answers?.goal || 'crescimento',      w2.theme, w2.icon, displayName, displayLevel, answers, dims)),
      callClaude(apiKey, buildWeekPrompt(3, 15, 'fase de vida',       answers?.state  || 'cotidiano',       w3.theme, w3.icon, displayName, displayLevel, answers, dims)),
    ])

    const week1 = parseWeekJson(raw1, 1)
    const week2 = parseWeekJson(raw2, 2)
    const week3 = parseWeekJson(raw3, 3)

    // Precisamos de pelo menos a semana 1 para retornar algo útil
    if (!week1 && !week2 && !week3) {
      console.error('Todas as semanas falharam ao gerar')
      return new Response(JSON.stringify({ error: 'Falha ao gerar plano', plan: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const plan = {
      weeks: [
        week1 || { theme: w1.theme, weekSummary: 'Construa a base da sua rotina espiritual.', lucideIcon: w1.icon, days: [] },
        week2 || { theme: w2.theme, weekSummary: 'Aprofunde sua relação com Deus.',            lucideIcon: w2.icon, days: [] },
        week3 || { theme: w3.theme, weekSummary: 'Integre a fé com o seu cotidiano.',          lucideIcon: w3.icon, days: [] },
      ],
    }

    const totalDays = plan.weeks.reduce((acc, w) => acc + (w.days?.length || 0), 0)
    console.log(`✅ Plano gerado para ${displayName}: ${totalDays} dias`)

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro ao gerar plano:', error.message)
    return new Response(JSON.stringify({ error: error.message, plan: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})