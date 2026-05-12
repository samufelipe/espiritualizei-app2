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

// ── Email HTML ────────────────────────────────────────────────────────────────

function buildEmailHtml(quizData: any, plan: any, stripeSessionId: string): string {
  const name      = quizData.name      || 'Caminhante'
  const levelName = quizData.levelName || 'Peregrino'
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const stripeKey  = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendKey   = Deno.env.get('RESEND_API_KEY')
    const anthroKey   = Deno.env.get('ANTHROPIC_API_KEY')

    if (!stripeKey) return err(500, 'Stripe não configurado')

    const { stripe_session_id } = await req.json()
    if (!stripe_session_id) return err(400, 'stripe_session_id é obrigatório')

    const stripe   = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Verificar pagamento no Stripe
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id)
    if (session.payment_status !== 'paid') {
      return err(402, 'Pagamento ainda não confirmado')
    }

    // 2. Obter quiz_session_id dos metadados
    const quiz_session_id = session.metadata?.quiz_session_id
    if (!quiz_session_id) return err(404, 'Dados do quiz não encontrados. Acesse seu e-mail para recuperar o plano.')

    // 3. Buscar sessão no banco
    const { data: qs, error: dbErr } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', quiz_session_id)
      .single()

    if (dbErr || !qs) return err(404, 'Sessão do quiz não encontrada')

    // Atualizar stripe_session_id se ausente
    if (!qs.stripe_session_id) {
      await supabase.from('quiz_sessions').update({ stripe_session_id }).eq('id', quiz_session_id)
    }

    // 4. Se plano já gerado, retornar direto
    if (qs.plan_data) {
      console.log(`✅ Plano existente retornado para ${qs.email}`)
      return ok({ quizData: qs.quiz_data, plan: qs.plan_data })
    }

    // 5. Gerar plano via generate-quiz-plan
    let plan: any = null
    if (anthroKey) {
      try {
        const planRes = await fetch(`${supabaseUrl}/functions/v1/generate-quiz-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
          },
          body: JSON.stringify(qs.quiz_data),
        })
        const planData = await planRes.json()
        plan = planData?.plan || null
      } catch (_) {
        console.warn('Falha ao gerar plano via IA — usando fallback')
      }
    }

    // 6. Salvar plano no banco
    if (plan) {
      await supabase.from('quiz_sessions').update({ plan_data: plan }).eq('id', quiz_session_id)
    }

    // 7. Enviar e-mail (somente na primeira vez)
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
        await supabase.from('quiz_sessions').update({ email_sent: true }).eq('id', quiz_session_id)
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