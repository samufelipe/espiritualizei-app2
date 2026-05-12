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

    const displayName = name || 'Caminhante'
    const displayLevel = levelName || LEVEL_NAMES[level] || 'Peregrino'

    // prayerReality substitui routine + frequency com opções mais ricas
    const prayerRealityLabels: Record<string, string> = {
      consistent: 'tem uma rotina de oração, mesmo que imperfeita',
      occasional: 'ora quando lembra ou quando precisa muito',
      struggling: 'quer rezar mas não consegue manter',
      distant: 'faz tempo que não se sente próximo de Deus',
    }

    const prompt = `Você é um diretor espiritual católico experiente e profundamente empático.
Crie um Plano de 21 Dias de crescimento espiritual personalizado para ${displayName}, que se encontra no nível "${displayLevel}" da jornada espiritual.

Perfil de ${displayName}:
- Desafio principal: ${answers?.challenge || 'não especificado'}
- Realidade da oração: ${prayerRealityLabels[answers?.prayerReality] || answers?.prayer || 'não especificado'}
- Última confissão: ${answers?.confession || 'não especificado'}
- Objetivo espiritual: ${answers?.goal || 'não especificado'}
- Fase da vida: ${answers?.state || answers?.lifeStage || 'não especificado'}
- Maior impedimento: ${answers?.obstacle || 'não especificado'}

Pontuações por dimensão (0-100):
- Oração: ${dims?.oracao ?? dims?.[0] ?? 50}
- Sacramento: ${dims?.sacramento ?? dims?.[1] ?? 50}
- Formação: ${dims?.formacao ?? dims?.[2] ?? 50}
- Comunidade: ${dims?.comunidade ?? dims?.[3] ?? 50}
- Missão: ${dims?.missao ?? dims?.[4] ?? 50}

Estruture o plano em 3 semanas temáticas diretamente ligadas ao perfil de ${displayName}:
Semana 1 (Dias 1-7): foco no desafio principal ("${answers?.challenge || 'regularidade'}") — práticas concretas e compassivas.
Semana 2 (Dias 8-14): foco no objetivo espiritual ("${answers?.goal || 'crescimento'}") — aprofundamento e formação.
Semana 3 (Dias 15-21): foco na integração com a fase de vida ("${answers?.state || answers?.lifeStage || 'cotidiano'}") e missão.

Para cada semana, forneça também um "weekSummary": 1 frase curta e inspiradora sobre o tema (máximo 12 palavras).

Para cada dia (21 no total), forneça:
- intention: intenção do dia em 1ª pessoa do singular, íntima e pessoal ("Hoje escolho...")
- prayer: oração ou prática específica sugerida (nome concreto)
- task: tarefa prática simples e realizável em 5-15 minutos
- verse: versículo bíblico (referência no formato "Jo 15,5" + texto curto)

IMPORTANTE: As intenções devem ser íntimas, empáticas e pessoais — como se um diretor espiritual estivesse conversando diretamente com ${displayName}. Linguagem acessível, sem termos litúrgicos complexos.

Retorne APENAS JSON válido com esta estrutura:
{"weeks":[{"theme":"Tema da Semana","weekSummary":"Uma frase curta inspiradora","lucideIcon":"leaf","days":[{"day":1,"intention":"Hoje escolho...","prayer":"...","task":"...","verse":"Jo 15,5 — ..."}]}]}

Ícones Lucide sugeridos por semana: "leaf" (início/semente), "map" (caminho/objetivo), "star" (missão/integração).
Tom: pastoral, íntimo, encorajador. Linguagem: português brasileiro acessível. Conteúdo: estritamente católico.`

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
      return new Response(JSON.stringify({ error: 'Erro ao gerar plano', plan: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const data = await res.json()
    const rawText = data?.content?.[0]?.text || ''

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON in response')
      return new Response(JSON.stringify({ error: 'Formato inválido', plan: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const plan = JSON.parse(jsonMatch[0])
    console.log(`Plano gerado para ${displayName} (${displayLevel})`)

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