/**
 * process-quiz-drip — Edge Function do Supabase
 *
 * Chamada pelo cron Vercel (/api/send-quiz-drip) diariamente às 10h UTC (7h BRT).
 * Consulta quiz_email_drip, envia e-mails via Resend e atualiza status.
 *
 * Todos os secrets já estão configurados no Supabase:
 *   RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NOVENA_NAMES: Record<string, string> = {
  anxiety:   'Novena da Paz Interior',
  laziness:  'Novena da Constância',
  dryness:   'Novena do Reencontro',
  ignorance: 'Novena da Luz na Fé',
  pride:     'Novena do Esvaziamento',
  lust:      'Novena da Libertação',
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function buildDayEmailHtml(p: {
  name: string; dayNumber: number; weekNumber: number; weekTheme: string
  intention: string; challenge: string; ctaUrl: string; stripeSessionId: string
}): string {
  const { name, dayNumber, weekNumber, weekTheme, intention, ctaUrl, challenge, stripeSessionId } = p
  const isNovena    = dayNumber <= 9
  const isLastWeek  = weekNumber === 3
  const progressPct = Math.round((dayNumber / 21) * 100)
  const novenaName  = NOVENA_NAMES[challenge] || 'Novena Personalizada'
  const dashboardUrl = `https://www.espiritualizei.com/quiz/resultado?session=${stripeSessionId}`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dia ${dayNumber} do seu Desafio | Espiritualizei</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#fff;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:36px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <p style="font-size:14px;color:rgba(255,255,255,.5);margin:0 0 20px;">Bom dia, ${name}.</p>

    <div style="margin-bottom:20px;">
      <div style="display:inline-block;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.25);border-radius:40px;padding:6px 16px;margin-bottom:12px;">
        <span style="font-size:11px;font-weight:700;color:#A78BFA;letter-spacing:1.5px;text-transform:uppercase;">DIA ${dayNumber} DE 21</span>
      </div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 4px;line-height:1.2;">
        ${isLastWeek ? 'Reta final da sua jornada.' : `Semana ${weekNumber} do seu desafio.`}
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,.4);margin:0;">${weekTheme}</p>
    </div>

    <div style="background:rgba(255,255,255,.06);border-radius:4px;height:4px;margin-bottom:28px;overflow:hidden;">
      <div style="background:#A78BFA;height:100%;width:${progressPct}%;border-radius:4px;"></div>
    </div>

    ${isNovena ? `<div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:9px 14px;margin-bottom:24px;">
      <span style="font-size:10px;font-weight:700;color:rgba(167,139,250,.7);letter-spacing:1.5px;text-transform:uppercase;">NOVENA &middot; DIA ${dayNumber} DE 9 &middot; ${novenaName}</span>
    </div>` : ''}

    <div style="height:1px;background:rgba(255,255,255,.07);margin-bottom:24px;"></div>

    <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,.65);margin:0 0 12px;">INTEN&Ccedil;&Atilde;O DO DIA</p>
    <p style="font-size:19px;font-style:italic;font-family:Georgia,'Times New Roman',serif;color:rgba(255,255,255,.93);line-height:1.75;margin:0 0 32px;border-left:3px solid #A78BFA;padding-left:16px;">
      &ldquo;${intention}&rdquo;
    </p>

    ${(dayNumber === 7 || dayNumber === 14) ? `<div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.18);border-radius:12px;padding:14px 16px;margin:0 0 24px;">
      <p style="font-size:12.5px;color:rgba(255,255,255,.6);line-height:1.6;margin:0;">Voc&ecirc; sabia? Milhares de cat&oacute;licos rezam todos os dias no app do Espiritualizei, uns pelos outros. Quando seus 21 dias terminarem, voc&ecirc; n&atilde;o vai precisar caminhar sozinha.</p>
    </div>` : ''}

    <div style="text-align:center;">
      <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#fff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;">
        Come&ccedil;ar o Dia ${dayNumber} &rarr;
      </a>
    </div>

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,.2);margin:0 0 6px;">Voc&ecirc; recebe este e-mail porque adquiriu o Diagn&oacute;stico Espiritual do Espiritualizei.</p>
    <p style="font-size:11px;margin:0;">
      <a href="${dashboardUrl}" style="color:rgba(167,139,250,.5);text-decoration:underline;">Ver meu plano completo</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20desafio" style="color:rgba(255,255,255,.2);text-decoration:underline;">Cancelar e-mails</a>
    </p>
  </div>

</div>
</body>
</html>`
}

// ── E-mail de fechamento (Dia 21): oferta forte do app ─────────────────────────

function buildDay21CloseHtml(name: string): string {
  const appUrl = 'https://www.espiritualizei.com/?from=drip21'
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Você concluiu os 21 dias | Espiritualizei</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#fff;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <div style="display:inline-block;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:40px;padding:6px 16px;margin-bottom:16px;">
      <span style="font-size:11px;font-weight:700;color:#10B981;letter-spacing:1.5px;text-transform:uppercase;">21 DE 21 &middot; CONCLU&Iacute;DO</span>
    </div>

    <h1 style="font-size:24px;font-weight:800;margin:0 0 16px;line-height:1.25;">${name}, voc&ecirc; foi at&eacute; o fim. Que orgulho da sua const&acirc;ncia.</h1>

    <div style="height:1px;background:rgba(255,255,255,.07);margin-bottom:20px;"></div>

    <p style="font-size:15px;color:rgba(255,255,255,.78);line-height:1.75;margin:0 0 18px;">
      Em 21 dias voc&ecirc; provou pra si mesma uma coisa: a paz &eacute; poss&iacute;vel quando existe um caminho.
    </p>
    <p style="font-size:15px;color:rgba(255,255,255,.78);line-height:1.75;margin:0 0 18px;">
      Mas hoje &eacute; o dia 21. E amanh&atilde; &eacute; o dia 22. A ansiedade n&atilde;o avisa quando vai voltar, e o pior jeito de enfrentar isso &eacute; sozinha.
    </p>
    <p style="font-size:15px;color:rgba(255,255,255,.9);line-height:1.75;margin:0 0 28px;font-weight:600;">
      No app do Espiritualizei a sua caminhada continua, e voc&ecirc; nunca mais reza sozinha: milhares de cat&oacute;licos rezando todos os dias, uns pelos outros.
    </p>

    <div style="background:rgba(167,139,250,.07);border:1.5px solid rgba(167,139,250,.2);border-radius:14px;padding:18px;margin-bottom:28px;">
      <p style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:rgba(167,139,250,.7);text-transform:uppercase;margin:0 0 10px;">O QUE CONTINUA NO APP</p>
      <p style="font-size:13.5px;color:rgba(255,255,255,.75);line-height:1.7;margin:0;">
        &bull; Uma comunidade rezando com voc&ecirc;, todos os dias<br>
        &bull; Sua caminhada que se adapta &agrave; sua vida e ao tempo da Igreja<br>
        &bull; Forma&ccedil;&atilde;o: santos, liturgia e os tesouros da f&eacute;
      </p>
    </div>

    <div style="text-align:center;">
      <p style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:#A78BFA;margin:0 0 10px;">7 DIAS GR&Aacute;TIS &middot; SEM CART&Atilde;O AGORA</p>
      <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#A78BFA,#7C3AED);color:#fff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;">
        Continuar minha caminhada &rarr;
      </a>
    </div>

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,.2);margin:0;">
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20desafio" style="color:rgba(255,255,255,.2);text-decoration:underline;">Cancelar e-mails</a>
    </p>
  </div>

</div>
</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req: any) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 405,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')             ?? ''
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const resendKey   = Deno.env.get('RESEND_API_KEY')

  if (!serviceKey) {
    return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY não configurada' }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey)
    const now      = new Date().toISOString()

    // 1. Buscar pendentes
    const { data: pending, error: queryErr } = await supabase
      .from('quiz_email_drip')
      .select('*')
      .lte('scheduled_at', now)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (queryErr) throw new Error(queryErr.message)
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: 'Nenhum e-mail pendente.' }), {
        headers: { ...cors, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    console.log(`📬 Processando ${pending.length} e-mails...`)

    // 2. Enviar cada e-mail
    const results = await Promise.allSettled(
      pending.map(async (record: any) => {
        const weekNumber = Math.ceil(record.day_number / 7)
        const ctaUrl     = `https://www.espiritualizei.com/quiz/resultado?session=${record.stripe_session_id}&day=${record.day_number}`

        let subject: string
        let html: string
        if (record.day_number === 21) {
          // Fechamento: oferta forte do app (continuação)
          subject = `${record.name}, você concluiu os 21 dias 🎉 e agora?`
          html = buildDay21CloseHtml(record.name)
        } else {
          if (record.day_number === 1) {
            subject = `${record.name}, seu Desafio de 21 Dias começa hoje 🙏`
          } else if (record.day_number <= 9) {
            subject = `${record.name}, Dia ${record.day_number} da sua Novena te espera ✨`
          } else {
            subject = `${record.name}, Dia ${record.day_number} do seu Desafio Espiritual 🙏`
          }
          html = buildDayEmailHtml({
            name:            record.name,
            dayNumber:       record.day_number,
            weekNumber,
            weekTheme:       record.week_theme || '',
            intention:       record.intention  || '',
            challenge:       record.challenge  || 'anxiety',
            ctaUrl,
            stripeSessionId: record.stripe_session_id,
          })
        }

        const sendRes = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body:    JSON.stringify({
            from:    'Espiritualizei <contato@espiritualizei.com>',
            to:      [record.email],
            subject,
            html,
          }),
        })

        if (!sendRes.ok) {
          const errBody = await sendRes.text()
          await supabase.from('quiz_email_drip')
            .update({ status: 'failed' })
            .eq('id', record.id)
          throw new Error(`Resend ${record.id}: ${errBody}`)
        }

        await supabase.from('quiz_email_drip')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', record.id)

        console.log(`✅ Dia ${record.day_number} → ${record.email}`)
        return { id: record.id, day: record.day_number }
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    console.log(`📧 ${sent} enviados, ${failed} falhas`)

    return new Response(
      JSON.stringify({
        processed: pending.length,
        sent,
        failed,
        errors: results.filter(r => r.status === 'rejected').map((r: any) => r.reason?.message),
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (e: any) {
    console.error('process-quiz-drip:', e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
