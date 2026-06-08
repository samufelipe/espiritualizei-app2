/**
 * process-recovery-emails — Edge Function do Supabase
 *
 * Disparada pelo pg_cron a cada 10 minutos.
 * Envia a sequência de 3 e-mails de recuperação de carrinho para leads
 * que iniciaram o quiz mas não completaram a compra.
 *
 * Jornada de saída: stripe-assessment-webhook cancela os registros ao pagar.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CHALLENGE_LABELS: Record<string, string> = {
  anxiety:       'ansiedade e medo',
  sadness:       'a tristeza e o desânimo que pesam',
  relationships: 'as feridas e conflitos nos relacionamentos',
  laziness:      'falta de constância na vida espiritual',
  dryness:       'a oração que parece vazia e distante',
  ignorance:     'dúvidas e questionamentos na fé',
  pride:         'a mágoa, a raiva e a dificuldade de perdoar',
  lust:          'os vícios e dependências que prendem',
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function buildRecoveryHtml(p: {
  step: number; name: string; challenge: string; ctaUrl: string
}): string {
  const { step, name, challenge, ctaUrl } = p
  const challengeText = CHALLENGE_LABELS[challenge] || 'sua jornada espiritual'

  const configs = [
    {
      subject:  `${name}, seu diagnóstico espiritual está aqui`,
      headline: 'Seu diagnóstico está esperando por você.',
      body:     `Você respondeu 3 perguntas honestas sobre sua vida espiritual e revelou algo importante sobre onde está agora. Seu diagnóstico personalizado e o Plano de 21 Dias criado para o seu momento estão prontos e aguardando.`,
      cta:      'Acessar meu diagn&oacute;stico &rarr;',
      ps:       null,
      showPrice: false,
    },
    {
      subject:  `${name}, você ainda está carregando isso?`,
      headline: `Voc&ecirc; ainda est&aacute; carregando ${challengeText}?`,
      body:     `${name}, esse peso não desaparece sozinho. O Plano de 21 Dias que criamos foi pensado especificamente para o desafio que você revelou — não um plano genérico, mas um caminho feito para o seu momento real. Ele está esperando por você.`,
      cta:      'Ver meu plano personalizado &rarr;',
      ps:       'R$19,90 — pagamento único, acesso permanente. Menos de R$1 por dia.',
      showPrice: false,
    },
    {
      subject:  `${name}, uma última coisa antes de você ir...`,
      headline: 'Uma &uacute;ltima coisa antes de voc&ecirc; ir.',
      body:     `${name}, você fez as perguntas certas. Revelou onde está. Existe um caminho de 21 dias esperando por você — com intenção, oração e tarefa para cada dia, criados para o seu desafio específico. Não é uma promessa vaga. É um plano real para um começo real.`,
      cta:      'Quero meu plano de 21 dias &rarr;',
      ps:       'Garantia de 7 dias. Se não valer cada centavo, devolvemos tudo.',
      showPrice: true,
    },
  ]

  const c = configs[step - 1] || configs[0]

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#fff;">
<div style="display:none;max-height:0;overflow:hidden;">${c.subject}</div>
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:36px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <p style="font-size:14px;color:rgba(255,255,255,.5);margin:0 0 20px;">Ol&aacute;, ${name}.</p>

    <h1 style="font-size:22px;font-weight:800;margin:0 0 20px;line-height:1.25;color:#fff;">
      ${c.headline}
    </h1>

    <div style="height:1px;background:rgba(255,255,255,.07);margin-bottom:20px;"></div>

    <p style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.75;margin:0 0 28px;">
      ${c.body}
    </p>

    ${c.showPrice ? `
    <div style="background:rgba(167,139,250,.08);border:1.5px solid rgba(167,139,250,.2);border-radius:14px;padding:16px 18px;margin-bottom:28px;text-align:center;">
      <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(167,139,250,.7);margin:0 0 6px;">PAGAMENTO &Uacute;NICO</p>
      <p style="font-size:28px;font-weight:900;color:#fff;margin:0;">R$19,90</p>
      <p style="font-size:12px;color:rgba(255,255,255,.4);margin:4px 0 0;">Acesso permanente. Menos de R$1 por dia.</p>
    </div>` : ''}

    <div style="text-align:center;margin-bottom:${c.ps ? '20px' : '0'};">
      <a href="${ctaUrl}" style="display:inline-block;background:#A78BFA;color:#1A2530;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;">
        ${c.cta}
      </a>
    </div>

    ${c.ps ? `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07);text-align:center;">
      <p style="font-size:12px;color:rgba(255,255,255,.35);margin:0;font-style:italic;">${c.ps}</p>
    </div>` : ''}

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,.2);margin:0 0 6px;">Voc&ecirc; recebe este e-mail porque iniciou o Diagn&oacute;stico Espiritual do Espiritualizei.</p>
    <p style="font-size:11px;margin:0;">
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20diagn%C3%B3stico" style="color:rgba(255,255,255,.2);text-decoration:underline;">N&atilde;o quero mais receber</a>
    </p>
  </div>

</div>
</body>
</html>`
}

function getSubject(step: number, name: string): string {
  if (step === 1) return `${name}, seu diagnóstico espiritual está aqui`
  if (step === 2) return `${name}, você ainda está carregando isso?`
  return `${name}, uma última coisa antes de você ir...`
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

  if (!serviceKey || !resendKey) {
    return new Response(JSON.stringify({ error: 'Secrets não configurados' }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey)
    const now      = new Date().toISOString()

    const { data: pending, error: queryErr } = await supabase
      .from('quiz_recovery_emails')
      .select('*')
      .lte('scheduled_at', now)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (queryErr) throw new Error(queryErr.message)

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...cors, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    console.log(`📬 Processando ${pending.length} e-mails de recuperação...`)

    const results = await Promise.allSettled(
      pending.map(async (record: any) => {
        const ctaUrl = `https://www.espiritualizei.com/quiz?resume=${record.quiz_session_id}`
        const html   = buildRecoveryHtml({
          step:      record.sequence_step,
          name:      record.name,
          challenge: record.challenge || 'anxiety',
          ctaUrl,
        })
        const subject = getSubject(record.sequence_step, record.name)

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
          await supabase.from('quiz_recovery_emails')
            .update({ status: 'failed' })
            .eq('id', record.id)
          throw new Error(`Resend step${record.sequence_step} ${record.email}: ${errBody}`)
        }

        await supabase.from('quiz_recovery_emails')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', record.id)

        console.log(`✅ Step ${record.sequence_step} → ${record.email}`)
        return { id: record.id, step: record.sequence_step }
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

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
    console.error('process-recovery-emails:', e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
