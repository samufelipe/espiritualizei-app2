import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Intenções de fallback (usadas quando plan_data não está disponível)
const FALLBACK_INTENTIONS = [
  'Hoje escolho pausar o barulho do mundo e abrir meu coração para o silêncio de Deus.',
  'Hoje escolho me alegrar pelas bênçãos que já recebi e que muitas vezes não percebo.',
  'Hoje escolho olhar com honestidade para quem eu sou e confiar na misericórdia de Deus.',
  'Hoje escolho falar com Deus com minhas próprias palavras, como se conversasse com um amigo.',
  'Hoje escolho permanecer em Deus como o galho na videira, com confiança total.',
  'Hoje escolho abrir meu coração à Virgem Maria e pedir sua intercessão por quem mais precisa.',
  'Hoje escolho descansar em Deus, não nas minhas forças, mas completamente nEle.',
  'Hoje escolho começar o dia com louvor, antes do celular, antes do café, Deus primeiro.',
  'Hoje escolho alimentar minha fé com conhecimento, pois amar a Deus é também conhecê-Lo mais.',
  'Hoje escolho oferecer ao Senhor o que tenho: meu tempo, minha atenção, minha fome de Deus.',
  'Hoje escolho adorar a Jesus presente na Eucaristia, o maior mistério e o maior dom da nossa fé.',
  'Hoje escolho rezar os salmos como fez Jesus, deixando essas palavras antigas tocar meu coração.',
  'Hoje escolho encerrar o dia em oração, não deixando que as preocupações roubem minha paz noturna.',
  'Hoje escolho interceder, lembrar que minha oração pode ser um presente para quem está sofrendo.',
  'Hoje escolho consagrar meu dia a Deus desde o primeiro momento, antes de qualquer outra coisa.',
  'Hoje escolho contemplar a Paixão de Cristo e deixar que o amor que Ele mostrou me transforme.',
  'Hoje escolho abrir a Bíblia com fé, acreditando que Deus tem uma palavra específica para mim.',
  'Hoje escolho enxergar Deus na criação, nas coisas simples que esqueci de admirar no cotidiano.',
  'Hoje escolho pedir perdão ao Senhor, a mim mesmo e a quem magoei, e recomeçar completamente livre.',
  'Hoje escolho reconhecer a mão de Deus em cada detalhe, pois tudo que tenho é dom.',
  'Hoje escolho renovar meu compromisso com Deus e carregar o que aprendi para o resto da vida.',
]

const WEEK_THEMES: Record<string, string[]> = {
  anxiety:   ['Aprender a descansar em Deus',          'Cultivando a paz que o mundo não dá',   'Integração com a vida cotidiana'],
  laziness:  ['Construindo o hábito da presença',       'A disciplina como ato de amor',          'Constância no cotidiano'],
  dryness:   ['Reencontrar Deus no silêncio',           'Formação e aprofundamento da fé',        'Fé viva e integrada'],
  ignorance: ['Conhecer para amar com mais força',      'Formação e aprofundamento da fé',        'Vivendo o que aprendi'],
  pride:     ['O caminho do esvaziamento interior',     'Amar como Deus ama',                     'Serviço e doação'],
  lust:      ['Ordenando o coração com misericórdia',   'Cura e libertação pelo amor divino',     'Integração e liberdade'],
}

const NOVENA_NAMES: Record<string, string> = {
  anxiety:   'Novena da Paz Interior',
  laziness:  'Novena da Constância',
  dryness:   'Novena do Reencontro',
  ignorance: 'Novena da Luz na Fé',
  pride:     'Novena do Esvaziamento',
  lust:      'Novena da Libertação',
}

// ── HTML builder (duplicado em send-quiz-drip.js para Vercel) ─────────────────

function buildDayEmailHtml(params: {
  name:       string
  dayNumber:  number
  weekNumber: number
  weekTheme:  string
  intention:  string
  challenge:  string
  ctaUrl:     string
  stripeSessionId: string
}): string {
  const { name, dayNumber, weekNumber, weekTheme, intention, ctaUrl, challenge, stripeSessionId } = params
  const isNovena   = dayNumber <= 9
  const isLastWeek = weekNumber === 3
  const progressPct = Math.round((dayNumber / 21) * 100)
  const novenaName  = NOVENA_NAMES[challenge] || 'Novena Personalizada'
  const dashboardUrl = `https://www.espiritualizei.com/quiz/resultado?session=${stripeSessionId}`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dia ${dayNumber} do seu Desafio | Espiritualizei</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:36px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,0.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,0.15);">

    <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 20px;">Bom dia, ${name}.</p>

    <div style="margin-bottom:20px;">
      <div style="display:inline-block;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);border-radius:40px;padding:6px 16px;margin-bottom:12px;">
        <span style="font-size:11px;font-weight:700;color:#A78BFA;letter-spacing:1.5px;text-transform:uppercase;">DIA ${dayNumber} DE 21</span>
      </div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 4px;line-height:1.2;">
        ${isLastWeek ? 'Reta final da sua jornada.' : `Semana ${weekNumber} do seu desafio.`}
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;">${weekTheme}</p>
    </div>

    <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:4px;margin-bottom:28px;overflow:hidden;">
      <div style="background:#A78BFA;height:100%;width:${progressPct}%;border-radius:4px;"></div>
    </div>

    ${isNovena ? `<div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:10px;padding:9px 14px;margin-bottom:24px;">
      <span style="font-size:10px;font-weight:700;color:rgba(167,139,250,0.7);letter-spacing:1.5px;text-transform:uppercase;">NOVENA &middot; DIA ${dayNumber} DE 9 &middot; ${novenaName}</span>
    </div>` : ''}

    <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:24px;"></div>

    <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,0.65);margin:0 0 12px;">INTENÇÃO DO DIA</p>
    <p style="font-size:19px;font-style:italic;font-family:Georgia,'Times New Roman',serif;color:rgba(255,255,255,0.93);line-height:1.75;margin:0 0 32px;border-left:3px solid #A78BFA;padding-left:16px;">
      &ldquo;${intention}&rdquo;
    </p>

    <div style="text-align:center;">
      <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;">
        Come&ccedil;ar o Dia ${dayNumber} &rarr;
      </a>
    </div>

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0 0 6px;">Você recebe este e-mail porque adquiriu o Diagnóstico Espiritual do Espiritualizei.</p>
    <p style="font-size:11px;margin:0;">
      <a href="${dashboardUrl}" style="color:rgba(167,139,250,0.5);text-decoration:underline;">Ver meu plano completo</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20desafio" style="color:rgba(255,255,255,0.2);text-decoration:underline;">Cancelar e-mails</a>
    </p>
  </div>

</div>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req: any) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')      ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendKey   = Deno.env.get('RESEND_API_KEY')

    const { quiz_session_id, stripe_session_id, email, name, plan_data, quiz_data } = await req.json()

    if (!quiz_session_id || !stripe_session_id || !email) {
      return new Response(
        JSON.stringify({ error: 'quiz_session_id, stripe_session_id, email são obrigatórios' }),
        { headers: { ...cors, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase  = createClient(supabaseUrl, serviceKey)
    const challenge = quiz_data?.answers?.challenge || 'anxiety'
    const weekThemes = WEEK_THEMES[challenge] || WEEK_THEMES.anxiety
    const firstName  = (name || '').split(' ')[0] || 'Caminhante'
    const now        = new Date()

    // Montar 21 registros
    const records: any[] = []

    for (let day = 1; day <= 21; day++) {
      const weekIdx  = Math.ceil(day / 7) - 1
      let intention  = FALLBACK_INTENTIONS[day - 1]
      let weekTheme  = weekThemes[weekIdx] || weekThemes[0]

      if (plan_data?.weeks?.[weekIdx]) {
        const week = plan_data.weeks[weekIdx]
        if (week.theme) weekTheme = week.theme
        const dayData = week.days?.find((d: any) => d.day === day)
        if (dayData?.intention) intention = dayData.intention
      }

      // Day 1 → agendado para NOW (processado imediatamente abaixo)
      // Days 2-21 → agendado para D+N às 10h UTC (7h BRT)
      let scheduledAt: string
      if (day === 1) {
        scheduledAt = now.toISOString()
      } else {
        const d = new Date(now)
        d.setDate(d.getDate() + (day - 1))
        d.setUTCHours(10, 0, 0, 0)
        scheduledAt = d.toISOString()
      }

      records.push({
        quiz_session_id,
        email,
        name:              firstName,
        stripe_session_id,
        day_number:        day,
        week_theme:        weekTheme,
        intention,
        challenge,
        scheduled_at:      scheduledAt,
        status:            'pending',
      })
    }

    // Inserir — ignorar duplicatas (idempotente)
    const { error: insertErr } = await supabase
      .from('quiz_email_drip')
      .upsert(records, { onConflict: 'quiz_session_id,day_number', ignoreDuplicates: true })

    if (insertErr) throw new Error(insertErr.message)

    console.log(`✅ ${records.length} e-mails agendados para ${email}`)

    // Marcar drip como agendado em quiz_sessions
    await supabase.from('quiz_sessions')
      .update({ drip_scheduled: true })
      .eq('id', quiz_session_id)

    // Enviar Day 1 imediatamente
    if (resendKey) {
      const d1       = records[0]
      const ctaUrl   = `https://www.espiritualizei.com/quiz/resultado?session=${stripe_session_id}&day=1`
      const emailHtml = buildDayEmailHtml({
        name:            firstName,
        dayNumber:       1,
        weekNumber:      1,
        weekTheme:       d1.week_theme,
        intention:       d1.intention,
        challenge,
        ctaUrl,
        stripeSessionId: stripe_session_id,
      })

      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from:    'Espiritualizei <contato@espiritualizei.com>',
          to:      [email],
          subject: `${firstName}, seu Desafio de 21 Dias começa hoje 🙏`,
          html:    emailHtml,
        }),
      })

      if (sendRes.ok) {
        await supabase.from('quiz_email_drip')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('quiz_session_id', quiz_session_id)
          .eq('day_number', 1)
        console.log(`📧 E-mail Dia 1 enviado para ${email}`)
      } else {
        console.warn('Falha ao enviar Day 1:', await sendRes.text())
      }
    }

    return new Response(
      JSON.stringify({ success: true, scheduled: records.length }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (e: any) {
    console.error('schedule-quiz-drip:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
