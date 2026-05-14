import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ok  = (body: object) => new Response(JSON.stringify(body), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 })
const err = (status: number, msg: string) => new Response(JSON.stringify({ error: msg }), { headers: { ...cors, 'Content-Type': 'application/json' }, status })

// ── Meta Conversions API ──────────────────────────────────────────────────────

const META_PIXEL_ID = '929131016839633'

async function hashSHA256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.toLowerCase().trim())
  const buf  = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendMetaCAPI(capiToken: string, email: string, stripeSessionId: string): Promise<void> {
  try {
    const hashedEmail = await hashSHA256(email)
    const eventId     = `purchase_${stripeSessionId}`
    const payload = {
      data: [{
        event_name:       'Purchase',
        event_time:       Math.floor(Date.now() / 1000),
        event_id:         eventId,
        event_source_url: `https://www.espiritualizei.com/quiz/resultado?session=${stripeSessionId}`,
        action_source:    'website',
        user_data: {
          em: [hashedEmail],
        },
        custom_data: {
          value:        19.90,
          currency:     'BRL',
          content_name: 'Diagnóstico Espiritual',
          content_ids:  ['diagnostico-espiritual'],
          content_type: 'product',
        },
      }],
    }
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${capiToken}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
    const body = await res.json()
    if (!res.ok) console.error('Meta CAPI error:', JSON.stringify(body))
    else console.log(`📊 Meta CAPI Purchase enviado — event_id: ${eventId}, events_received: ${body.events_received}`)
  } catch (e: any) {
    console.warn('Meta CAPI falhou silenciosamente:', e.message)
  }
}

// ── Plan generation (inlined from generate-quiz-plan) ─────────────────────────

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
    oracao:     dims?.oracao     ?? 50,
    sacramento: dims?.sacramento ?? 50,
    formacao:   dims?.formacao   ?? 50,
    comunidade: dims?.comunidade ?? 50,
    missao:     dims?.missao     ?? 50,
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
    console.error('Anthropic API error:', await res.text())
    return null
  }
  const data = await res.json()
  return data?.content?.[0]?.text || null
}

function parseWeekJson(raw: string | null, weekNum: number): any | null {
  if (!raw) return null
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) { console.error(`Semana ${weekNum}: sem JSON`); return null }
    return JSON.parse(match[0])
  } catch (e: any) {
    console.error(`Semana ${weekNum}: JSON inválido —`, e.message)
    return null
  }
}

async function generatePlan(quizData: any): Promise<any | null> {
  const anthroKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthroKey) { console.error('ANTHROPIC_API_KEY não configurado'); return null }

  const { name, levelName, answers, dims } = quizData
  const displayName  = name      || 'Caminhante'
  const displayLevel = levelName || 'Buscando'

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
    truth:      { theme: 'Formação e aprofundamento da fé',     icon: 'lightbulb' },
    discipline: { theme: 'A disciplina como ato de amor',       icon: 'target'    },
    love:       { theme: 'Amar como Deus ama',                  icon: 'heart'     },
    healing:    { theme: 'Cura e libertação pelo amor divino',  icon: 'leaf'      },
  }
  const STATE_THEMES: Record<string, { theme: string; icon: string }> = {
    student: { theme: 'Crescendo na fé em cada fase',           icon: 'book-open' },
    single:  { theme: 'A missão de quem caminha livre',         icon: 'user'      },
    married: { theme: 'O casal que ora junto permanece junto',  icon: 'users'     },
    parent:  { theme: 'A espiritualidade de quem serve a vida', icon: 'home'      },
    retired: { theme: 'A sabedoria da contemplação madura',     icon: 'coffee'    },
  }

  const w1 = CHALLENGE_THEMES[answers?.challenge] || { theme: 'Regularidade na oração', icon: 'heart'     }
  const w2 = GOAL_THEMES[answers?.goal]            || { theme: 'Aprofundamento da fé',   icon: 'lightbulb' }
  const w3 = STATE_THEMES[answers?.state]          || { theme: 'Integração com a vida',  icon: 'star'      }

  console.log(`Gerando plano para ${displayName} (${displayLevel}) — 3 semanas em paralelo`)

  const [raw1, raw2, raw3] = await Promise.all([
    callClaude(anthroKey, buildWeekPrompt(1,  1, 'desafio principal',   answers?.challenge || 'regularidade', w1.theme, w1.icon, displayName, displayLevel, answers, dims)),
    callClaude(anthroKey, buildWeekPrompt(2,  8, 'objetivo espiritual', answers?.goal      || 'crescimento',  w2.theme, w2.icon, displayName, displayLevel, answers, dims)),
    callClaude(anthroKey, buildWeekPrompt(3, 15, 'fase de vida',        answers?.state     || 'cotidiano',    w3.theme, w3.icon, displayName, displayLevel, answers, dims)),
  ])

  const week1 = parseWeekJson(raw1, 1)
  const week2 = parseWeekJson(raw2, 2)
  const week3 = parseWeekJson(raw3, 3)

  if (!week1 && !week2 && !week3) { console.error('Todas as semanas falharam'); return null }

  const totalDays = [week1, week2, week3].reduce((acc, w) => acc + (w?.days?.length || 0), 0)
  console.log(`✅ Plano gerado para ${displayName}: ${totalDays} dias`)

  return {
    weeks: [
      week1 || { theme: w1.theme, weekSummary: 'Construa a base da sua rotina espiritual.', lucideIcon: w1.icon, days: [] },
      week2 || { theme: w2.theme, weekSummary: 'Aprofunde sua relação com Deus.',            lucideIcon: w2.icon, days: [] },
      week3 || { theme: w3.theme, weekSummary: 'Integre a fé com o seu cotidiano.',          lucideIcon: w3.icon, days: [] },
    ],
  }
}

// ── Email HTML ────────────────────────────────────────────────────────────────

function buildEmailHtml(quizData: any, plan: any, stripeSessionId: string): string {
  const name      = quizData.name      || 'Caminhante'
  const levelName = quizData.levelName || 'Buscando'
  const resultUrl = `https://www.espiritualizei.com/quiz/resultado?session=${stripeSessionId}`

  const firstWeek = plan?.weeks?.[0]
  const daysHtml  = (firstWeek?.days || []).slice(0, 3).map((d: any) => `
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(167,139,250,0.25);border-radius:10px;padding:20px;margin-bottom:12px;">
      <p style="color:#A78BFA;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;">DIA ${d.day}</p>
      <p style="font-style:italic;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.5;margin:0 0 10px;">"${d.int || d.intention || ''}"</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0;">📖 ${d.verse || ''}</p>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Seu Diagnóstico Espiritual | Espiritualizei</title>
</head>
<body style="background:#1A2530;color:#ffffff;font-family:Arial,Helvetica,sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:40px 24px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:32px;">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="#A78BFA" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:#A78BFA;font-size:11px;letter-spacing:2.5px;margin:8px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <!-- Hero -->
  <div style="text-align:center;margin-bottom:36px;">
    <h1 style="font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;">${name}, seu diagnóstico<br>espiritual está aqui.</h1>
    <p style="color:rgba(255,255,255,0.45);font-size:14px;margin:0;">Nível <strong style="color:#A78BFA;">${levelName}</strong> · Plano de 21 Dias personalizado para você</p>
  </div>

  <!-- Plan preview -->
  ${firstWeek ? `
  <h2 style="font-size:14px;color:#A78BFA;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">
    Semana 1 — ${firstWeek.theme || ''}
  </h2>
  ${daysHtml}
  <p style="color:rgba(255,255,255,0.35);font-size:13px;text-align:center;margin:16px 0 32px;">
    + 18 dias mais aguardando você no seu plano completo.
  </p>
  ` : ''}

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:32px;">
    <a href="${resultUrl}" style="display:inline-block;background:#A78BFA;color:#1A2530;text-decoration:none;padding:18px 36px;border-radius:10px;font-weight:800;font-size:16px;">
      Acessar Meu Plano Completo →
    </a>
  </div>

  <!-- Trust -->
  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;text-align:center;">
    <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0 0 8px;">Guarde este e-mail. O link acima dá acesso permanente ao seu diagnóstico.</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">Espiritualizei · contato@espiritualizei.com</p>
  </div>

</div>
</body>
</html>`
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: any) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const stripeKey   = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendKey   = Deno.env.get('RESEND_API_KEY')
    const capiToken   = Deno.env.get('META_CAPI_TOKEN')

    if (!stripeKey) return err(500, 'Stripe não configurado')

    // quiz_data_fallback: enviado pelo client a partir do localStorage quando salvo no quiz
    const { stripe_session_id, quiz_data_fallback } = await req.json()
    if (!stripe_session_id) return err(400, 'stripe_session_id é obrigatório')

    const stripe   = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Verificar pagamento no Stripe
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id)
    if (session.payment_status !== 'paid') {
      return err(402, 'Pagamento ainda não confirmado')
    }

    const customerEmail = session.customer_email || session.customer_details?.email || ''

    // 2. Buscar quiz_session com cascata de fallbacks
    let qs: any = null

    // 2a. Pelo quiz_session_id salvo nos metadados do Stripe (caminho feliz)
    const metaId = session.metadata?.quiz_session_id
    if (metaId) {
      const { data } = await supabase.from('quiz_sessions').select('*').eq('id', metaId).single()
      if (data) qs = data
    }

    // 2b. Pelo stripe_session_id já gravado (re-acesso à página)
    if (!qs) {
      const { data } = await supabase.from('quiz_sessions').select('*').eq('stripe_session_id', stripe_session_id).single()
      if (data) qs = data
    }

    // 2c. Pelo e-mail do comprador (save-quiz-session expirou antes de retornar)
    if (!qs && customerEmail) {
      const { data } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('email', customerEmail)
        .is('stripe_session_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) qs = data
    }

    // 2d. Criar sessão on-the-fly com dados enviados pelo client (último recurso)
    if (!qs && quiz_data_fallback && customerEmail) {
      console.log(`⚡ Criando quiz_session on-the-fly para ${customerEmail}`)
      const { data } = await supabase
        .from('quiz_sessions')
        .insert({ email: customerEmail, name: quiz_data_fallback.name || '', quiz_data: quiz_data_fallback, stripe_session_id })
        .select('*')
        .single()
      if (data) qs = data
    }

    if (!qs) return err(404, 'Dados do quiz não encontrados. Verifique seu e-mail para acessar o plano.')

    // Gravar stripe_session_id para lookups futuros (re-acesso)
    if (!qs.stripe_session_id) {
      await supabase.from('quiz_sessions').update({ stripe_session_id }).eq('id', qs.id)
    }

    // 3. Se plano já gerado, retornar direto
    if (qs.plan_data) {
      console.log(`✅ Plano existente retornado para ${qs.email}`)
      return ok({ quizData: qs.quiz_data, plan: qs.plan_data })
    }

    // 3b. Enviar evento Purchase ao Meta CAPI (apenas na primeira vez — plan_data ainda null)
    if (capiToken && qs.email) {
      await sendMetaCAPI(capiToken, qs.email, stripe_session_id)
    }

    // 4. Gerar plano via Anthropic API (inlined)
    const plan = await generatePlan(qs.quiz_data)

    // 5. Salvar plano no banco
    if (plan) {
      await supabase.from('quiz_sessions').update({ plan_data: plan }).eq('id', qs.id)
    }

    // 6. Enviar e-mail (somente na primeira vez)
    if (!qs.email_sent && qs.email && resendKey) {
      try {
        const emailHtml = buildEmailHtml(qs.quiz_data, plan, stripe_session_id)
        const name      = qs.quiz_data?.name || 'Caminhante'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: 'Espiritualizei <contato@espiritualizei.com>',
            to: [qs.email],
            subject: `${name}, seu Plano de 21 Dias está pronto 🙏`,
            html: emailHtml,
          }),
        })
        await supabase.from('quiz_sessions').update({ email_sent: true }).eq('id', qs.id)
        console.log(`📧 E-mail enviado para ${qs.email}`)
      } catch (emailErr: any) {
        console.warn('Falha ao enviar e-mail:', emailErr.message)
      }
    }

    console.log(`✅ Resultado entregue para ${qs.email}`)
    return ok({ quizData: qs.quiz_data, plan })

  } catch (e: any) {
    console.error('get-quiz-result:', e.message)
    return err(500, e.message)
  }
})