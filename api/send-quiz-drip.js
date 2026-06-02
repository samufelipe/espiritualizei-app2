/**
 * Vercel Cron Handler — processa e-mails diários do desafio de 21 dias
 * Agendado em vercel.json: "0 10 * * *" (10h UTC = 7h BRT)
 * Também pode ser chamado manualmente via GET /api/send-quiz-drip
 *
 * Requer no Vercel Dashboard > Environment Variables:
 *   SUPABASE_SERVICE_ROLE_KEY  — chave service role do Supabase
 *   RESEND_API_KEY             — chave da API do Resend
 */

const SUPABASE_URL     = process.env.SUPABASE_URL     || 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const RESEND_API_KEY   = process.env.RESEND_API_KEY   || ''

const NOVENA_NAMES = {
  anxiety:   'Novena da Paz Interior',
  laziness:  'Novena da Constância',
  dryness:   'Novena do Reencontro',
  ignorance: 'Novena da Luz na Fé',
  pride:     'Novena do Esvaziamento',
  lust:      'Novena da Libertação',
}

// ── E-mail HTML builder ───────────────────────────────────────────────────────

function buildDayEmailHtml({ name, dayNumber, weekNumber, weekTheme, intention, challenge, ctaUrl, stripeSessionId }) {
  const isNovena    = dayNumber <= 9
  const isLastWeek  = weekNumber === 3
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

    <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,0.65);margin:0 0 12px;">INTEN&Ccedil;&Atilde;O DO DIA</p>
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
    <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0 0 6px;">Voc&ecirc; recebe este e-mail porque adquiriu o Diagn&oacute;stico Espiritual do Espiritualizei.</p>
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

// ── Supabase REST helpers ─────────────────────────────────────────────────────

async function queryPendingDrips() {
  const now = new Date().toISOString()
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/quiz_email_drip?select=*&scheduled_at=lte.${encodeURIComponent(now)}&status=eq.pending&order=scheduled_at.asc&limit=50`,
    {
      headers: {
        apikey:          SERVICE_ROLE_KEY,
        Authorization:   `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type':  'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`Supabase query failed: ${res.status}`)
  return res.json()
}

async function markSent(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/quiz_email_drip?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey:          SERVICE_ROLE_KEY,
      Authorization:   `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=minimal',
    },
    body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString() }),
  })
}

async function markFailed(id, errorMsg) {
  await fetch(`${SUPABASE_URL}/rest/v1/quiz_email_drip?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey:          SERVICE_ROLE_KEY,
      Authorization:   `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=minimal',
    },
    body: JSON.stringify({ status: 'failed' }),
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' })
  }
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada' })
  }

  try {
    const pending = await queryPendingDrips()

    if (!Array.isArray(pending) || pending.length === 0) {
      return res.status(200).json({ processed: 0, message: 'Nenhum e-mail pendente.' })
    }

    const results = await Promise.allSettled(
      pending.map(async (record) => {
        const weekNumber = Math.ceil(record.day_number / 7)
        const ctaUrl = `https://www.espiritualizei.com/quiz/resultado?session=${record.stripe_session_id}&day=${record.day_number}`

        // Assunto personalizado por dia
        let subject
        if (record.day_number === 1) {
          subject = `${record.name}, seu Desafio de 21 Dias começa hoje 🙏`
        } else if (record.day_number <= 9) {
          subject = `${record.name}, Dia ${record.day_number} da sua Novena te espera ✨`
        } else {
          subject = `${record.name}, Dia ${record.day_number} do seu Desafio Espiritual 🙏`
        }

        const html = buildDayEmailHtml({
          name:            record.name,
          dayNumber:       record.day_number,
          weekNumber,
          weekTheme:       record.week_theme || '',
          intention:       record.intention  || '',
          challenge:       record.challenge  || 'anxiety',
          ctaUrl,
          stripeSessionId: record.stripe_session_id,
        })

        const sendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            Authorization:   `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from:    'Espiritualizei <contato@espiritualizei.com>',
            to:      [record.email],
            subject,
            html,
          }),
        })

        if (!sendRes.ok) {
          const errBody = await sendRes.text()
          await markFailed(record.id, errBody)
          throw new Error(`Resend error for record ${record.id}: ${errBody}`)
        }

        await markSent(record.id)
        console.log(`✅ Dia ${record.day_number} enviado para ${record.email}`)
        return { id: record.id, day: record.day_number, email: record.email }
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`📧 Drip processado: ${sent} enviados, ${failed} falhas`)

    return res.status(200).json({
      processed: pending.length,
      sent,
      failed,
      errors: results.filter(r => r.status === 'rejected').map(r => r.reason?.message),
    })

  } catch (e) {
    console.error('[send-quiz-drip]', e.message)
    return res.status(500).json({ error: e.message })
  }
}
