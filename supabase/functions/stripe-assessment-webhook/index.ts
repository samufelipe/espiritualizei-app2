import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const APP_ORIGIN = 'https://www.espiritualizei.com'

// E-mail instantaneo de pos-compra: acolhedor, humano, cheio de esperanca.
// Estilo escuro espelhando getRecoveryEmail. Nenhuma palavra proibida na copy
// voltada ao usuario (sem travessao longo, sem "IA"/"PDF"/"prompt").
function buildPurchaseWelcomeEmail(params: { firstName: string; createAccountUrl: string }): string {
  const { firstName, createAccountUrl } = params
  const preview = `${firstName}, seus materiais ja estao prontos. Crie sua senha para acessar tudo agora.`
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${preview}</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <!-- Confirmacao -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.35);color:#34D399;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:7px 14px;border-radius:999px;">Compra confirmada</span>
    </div>

    <h1 style="font-size:24px;font-weight:800;margin:0 0 14px;line-height:1.25;color:#fff;text-align:center;">
      ${firstName}, seus materiais estao prontos.
    </h1>

    <p style="font-size:15px;color:rgba(255,255,255,.72);line-height:1.78;margin:0 0 24px;text-align:center;">
      Obrigado pela confianca. O que voce escolheu ja foi preparado e esta esperando por voce neste momento.
    </p>

    <!-- O que esta liberado -->
    <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.2);border-radius:14px;padding:20px 22px;margin-bottom:26px;">
      <p style="font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:rgba(167,139,250,.7);margin:0 0 14px;">O que esta liberado para voce</p>
      <p style="font-size:14px;color:rgba(255,255,255,.82);line-height:2.1;margin:0;">
        <span style="color:#A78BFA;">&#9632;</span> Diagnostico Espiritual completo<br>
        <span style="color:#A78BFA;">&#9632;</span> Plano de 21 Dias personalizado<br>
        <span style="color:#A78BFA;">&#9632;</span> Novena para o seu desafio real<br>
        <span style="color:#A78BFA;">&#9632;</span> Cartas para Deus<br>
        <span style="color:#34D399;font-weight:700;">&#9632;</span> <strong style="color:#34D399;">App Espiritualizei liberado</strong>
      </p>
    </div>

    <!-- CTA principal -->
    <div style="text-align:center;margin-bottom:20px;">
      <p style="font-size:13px;color:rgba(255,255,255,.45);margin:0 0 14px;">
        Para acessar tudo, crie uma senha de acesso agora. E rapido.
      </p>
      <a href="${createAccountUrl}" style="display:inline-block;background:linear-gradient(135deg,#A78BFA,#7C3AED);color:#ffffff;text-decoration:none;padding:18px 40px;border-radius:14px;font-weight:800;font-size:17px;letter-spacing:.3px;">
        Criar minha senha e acessar &rarr;
      </a>
    </div>

    <!-- Nota de rodape do card -->
    <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:13px 16px;">
      <p style="font-size:12px;color:rgba(255,255,255,.45);margin:0;line-height:1.7;text-align:center;">
        Seu e-mail ja vem preenchido na pagina. Escolha uma senha, confirme, e tudo fica acessivel em segundos.
      </p>
    </div>

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,.2);margin:0;">Com carinho, equipe Espiritualizei &middot; contato@espiritualizei.com</p>
  </div>

</div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const stripeKey          = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret      = Deno.env.get('STRIPE_ASSESSMENT_WEBHOOK_SECRET')
  const supabaseUrl        = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const resendApiKey       = Deno.env.get('RESEND_API_KEY') ?? ''

  if (!stripeKey || !webhookSecret) {
    console.error('STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET não configurado')
    return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('Header stripe-signature ausente')
    return new Response(JSON.stringify({ error: 'Assinatura ausente' }), { status: 401 })
  }

  const body = await req.text()
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Assinatura inválida:', err.message)
    return new Response(JSON.stringify({ error: `Assinatura inválida: ${err.message}` }), { status: 400 })
  }

  console.log(`Evento Stripe recebido: ${event.type} [${event.id}]`)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const quizSessionId = session.metadata?.quiz_session_id ?? null
    const rawEmail      = session.customer_email || session.customer_details?.email || ''
    const customerEmail = rawEmail.trim().toLowerCase() || null
    const customerName  = session.metadata?.name ?? null

    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // ── Idempotência nível-evento: o INSERT em payment_logs é a trava real.
    // Índice único em event_id faz retries concorrentes baterem em 23505.
    const { error: insertError } = await supabase.from('payment_logs').insert({
      provider:        'stripe',
      event_id:        event.id,
      payload:         session,
      status:          'quiz_paid',
      quiz_session_id: quizSessionId,
      created_at:      new Date().toISOString(),
    })

    if (insertError) {
      if ((insertError as any).code === '23505') {
        console.log(`Evento ${event.id} já processado (23505). Ignorando.`)
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
      console.error('Erro ao inserir payment_log:', insertError.message)
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    console.log(`Quiz pago registrado: session=${session.id} quiz_session=${quizSessionId} email=${customerEmail} nome=${customerName}`)

    // ── Cancelar recuperacao + resolver quiz_session em paralelo (mais rapido)
    const cancelRecovery = customerEmail
      ? supabase
          .from('quiz_recovery_emails')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('email', customerEmail)
          .eq('status', 'pending')
          .then(({ error: cancelErr }) => {
            if (cancelErr) console.warn('Aviso: falha ao cancelar recuperação:', cancelErr.message)
            else console.log(`🚫 Recuperação cancelada para ${customerEmail} — lead converteu`)
          })
      : Promise.resolve()

    const resolveQuizSession = (async (): Promise<{ id: string; name: string | null; purchase_email_sent: boolean; stripe_session_id: string | null } | null> => {
      try {
        let found: any = null
        if (quizSessionId) {
          const { data } = await supabase.from('quiz_sessions')
            .select('id,name,purchase_email_sent,stripe_session_id').eq('id', quizSessionId).maybeSingle()
          if (data) found = data
        }
        if (!found) {
          const { data } = await supabase.from('quiz_sessions')
            .select('id,name,purchase_email_sent,stripe_session_id').eq('stripe_session_id', session.id).maybeSingle()
          if (data) found = data
        }
        if (!found && customerEmail) {
          const { data } = await supabase.from('quiz_sessions')
            .select('id,name,purchase_email_sent,stripe_session_id')
            .eq('email', customerEmail).order('created_at', { ascending: false }).limit(1).maybeSingle()
          if (data) found = data
        }
        if (found && !found.stripe_session_id) {
          await supabase.from('quiz_sessions').update({ stripe_session_id: session.id }).eq('id', found.id)
        }
        return found
      } catch (e) {
        console.warn('Aviso: falha ao resolver quiz_session:', (e as any)?.message)
        return null
      }
    })()

    const [, qs] = await Promise.all([cancelRecovery, resolveQuizSession])

    // ── E-mail instantâneo de boas-vindas com link para criar o acesso.
    if (customerEmail && resendApiKey) {
      // Claim condicional: só envia se ninguém mais já marcou. Quando a linha
      // existe; se não houver quiz_session (webhook antes do save), envia mesmo
      // assim — o índice de event_id garante envio único.
      let shouldSend = true
      if (qs) {
        if (qs.purchase_email_sent) {
          shouldSend = false
        } else {
          const { data: claimed } = await supabase.from('quiz_sessions')
            .update({ purchase_email_sent: true })
            .eq('id', qs.id).eq('purchase_email_sent', false)
            .select('id')
          shouldSend = !!(claimed && claimed.length)
        }
      }

      if (shouldSend) {
        const fullName  = (qs?.name || customerName || '').trim()
        const firstName = fullName.split(' ')[0] || 'Caminhante'
        const createAccountUrl =
          `${APP_ORIGIN}/materiais`
          + `?email=${encodeURIComponent(customerEmail)}`
          + `&name=${encodeURIComponent(fullName)}`
          + `&session=${encodeURIComponent(session.id)}`

        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Espiritualizei <contato@espiritualizei.com>',
              to: [customerEmail],
              subject: `${firstName}, seus materiais estao prontos. Acesse agora`,
              html: buildPurchaseWelcomeEmail({ firstName, createAccountUrl }),
            }),
          })
          if (!r.ok) {
            const txt = await r.text().catch(() => '')
            console.error('Falha Resend (e-mail pós-compra):', r.status, txt)
            // Reverter o claim para permitir reenvio num próximo retry do Stripe
            if (qs) await supabase.from('quiz_sessions').update({ purchase_email_sent: false }).eq('id', qs.id)
          } else {
            console.log(`✉️ E-mail instantâneo de pós-compra enviado para ${customerEmail}`)
          }
        } catch (e) {
          console.error('Erro ao enviar e-mail pós-compra:', (e as any)?.message)
          if (qs) await supabase.from('quiz_sessions').update({ purchase_email_sent: false }).eq('id', qs.id)
        }
      } else {
        console.log(`E-mail pós-compra já enviado para ${customerEmail}. Pulando.`)
      }
    } else if (!resendApiKey) {
      console.warn('RESEND_API_KEY ausente — e-mail instantâneo não enviado')
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
