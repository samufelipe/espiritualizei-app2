import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const APP_ORIGIN = 'https://www.espiritualizei.com'

function buildPurchaseWelcomeEmail(params: { firstName: string; createAccountUrl: string }): string {
  const { firstName, createAccountUrl } = params
  const preview = `${firstName}, seus materiais estao prontos. Siga os 3 passos abaixo para acessar tudo agora.`
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

  <div style="text-align:center;margin-bottom:28px;">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.55);font-size:10px;letter-spacing:2.5px;margin:5px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <div style="text-align:center;margin-bottom:22px;">
      <span style="display:inline-block;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#34D399;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Compra confirmada</span>
    </div>

    <h1 style="font-size:22px;font-weight:800;margin:0 0 10px;line-height:1.3;color:#fff;text-align:center;">
      ${firstName}, seus materiais estao prontos.
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,.6);line-height:1.75;margin:0 0 24px;text-align:center;">
      Obrigado pela confianca. Tudo que voce adquiriu ja foi preparado. Siga os 3 passos abaixo para acessar agora.
    </p>

    <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:24px;"></div>

    <p style="font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:rgba(167,139,250,.65);margin:0 0 12px;">O que esta liberado para voce</p>
    <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);border-radius:12px;padding:16px 18px;margin-bottom:26px;">
      <p style="font-size:13.5px;color:rgba(255,255,255,.8);line-height:2.1;margin:0;">
        <span style="color:#A78BFA;font-size:10px;">&#9632;</span>&nbsp; Diagnostico Espiritual completo<br>
        <span style="color:#A78BFA;font-size:10px;">&#9632;</span>&nbsp; Plano de 21 Dias personalizado<br>
        <span style="color:#A78BFA;font-size:10px;">&#9632;</span>&nbsp; Novena para o seu desafio<br>
        <span style="color:#A78BFA;font-size:10px;">&#9632;</span>&nbsp; Cartas para Deus<br>
        <span style="color:#34D399;font-size:10px;">&#9632;</span>&nbsp; <strong style="color:#34D399;">App Espiritualizei liberado</strong>
      </p>
    </div>

    <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:24px;"></div>

    <p style="font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:rgba(167,139,250,.65);margin:0 0 16px;">Como acessar seus materiais agora</p>

    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12px;font-weight:800;color:#A78BFA;">1</span>
      </div>
      <div>
        <p style="font-size:13px;font-weight:700;color:#fff;margin:0 0 2px;">Clique no botao verde abaixo</p>
        <p style="font-size:12px;color:rgba(255,255,255,.45);margin:0;line-height:1.5;">Voce vai abrir a sua pagina exclusiva de materiais.</p>
      </div>
    </div>

    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12px;font-weight:800;color:#A78BFA;">2</span>
      </div>
      <div>
        <p style="font-size:13px;font-weight:700;color:#fff;margin:0 0 2px;">Seu e-mail ja vem preenchido automaticamente</p>
        <p style="font-size:12px;color:rgba(255,255,255,.45);margin:0;line-height:1.5;">Voce so precisa escolher uma senha.</p>
      </div>
    </div>

    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:26px;">
      <div style="width:28px;height:28px;border-radius:50%;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12px;font-weight:800;color:#34D399;">3</span>
      </div>
      <div>
        <p style="font-size:13px;font-weight:700;color:#fff;margin:0 0 2px;">Pronto: todos os seus materiais aparecem na tela</p>
        <p style="font-size:12px;color:rgba(255,255,255,.45);margin:0;line-height:1.5;">O acesso e permanente. Voce pode abrir quando quiser.</p>
      </div>
    </div>

    <div style="text-align:center;margin-bottom:18px;">
      <a href="${createAccountUrl}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#ffffff;text-decoration:none;padding:18px 44px;border-radius:14px;font-weight:800;font-size:16px;letter-spacing:.2px;">
        Acessar meus materiais agora &rarr;
      </a>
    </div>

    <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:12px 16px;text-align:center;">
      <p style="font-size:12px;color:rgba(255,255,255,.38);margin:0;line-height:1.7;">
        Esta pagina e diferente do aplicativo Espiritualizei. E o seu espaco exclusivo para acessar os materiais da sua compra.
      </p>
    </div>

  </div>

  <div style="text-align:center;padding-top:26px;">
    <p style="font-size:11px;color:rgba(255,255,255,.18);margin:0;">Com carinho, equipe Espiritualizei &middot; contato@espiritualizei.com</p>
  </div>

</div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const supabaseUrl     = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRole     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const resendApiKey    = Deno.env.get('RESEND_API_KEY') ?? ''
  const mpToken         = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  const mpWebhookSecret = Deno.env.get('MP_WEBHOOK_SECRET')

  try {
    const isInternal = req.headers.get('x-internal') === '1'
    let paymentId: string
    let pixRecord: any = null

    if (isInternal) {
      // Chamado pelo check-pix-status (polling confirmou aprovacao)
      const body = await req.json()
      paymentId = body.payment_id
      pixRecord = {
        email:           body.email,
        name:            body.name,
        quiz_session_id: body.quiz_session_id,
        processed:       true,
      }
    } else {
      // Chamado pelo Mercado Pago via webhook externo
      if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }

      const rawBody = await req.text()
      let body: any
      try { body = JSON.parse(rawBody) } catch { body = {} }

      console.log('MP webhook recebido:', JSON.stringify(body))

      // Validacao de assinatura (se configurado)
      if (mpWebhookSecret) {
        const xSignature = req.headers.get('x-signature') || ''
        const xRequestId = req.headers.get('x-request-id') || ''
        const url        = new URL(req.url)
        const dataId     = url.searchParams.get('data.id') || body.data?.id || ''
        const tsPart     = xSignature.split(',').find((p: string) => p.startsWith('ts='))?.split('=')[1] || ''
        const manifest   = `id:${dataId};request-id:${xRequestId};ts:${tsPart};`
        const encoder    = new TextEncoder()
        const key = await crypto.subtle.importKey(
          'raw', encoder.encode(mpWebhookSecret),
          { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        )
        const sig          = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
        const computedHash = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
        const receivedHash = xSignature.split(',').find((p: string) => p.startsWith('v1='))?.split('=')[1]
        if (receivedHash && computedHash !== receivedHash) {
          console.warn('MP webhook assinatura invalida')
          return new Response('Unauthorized', { status: 401 })
        }
      }

      // Extrai payment_id da notificacao (formato IPN ou Webhooks novos)
      if (body.action === 'payment.updated' || body.action === 'payment.created') {
        paymentId = String(body.data?.id)
      } else if (body.topic === 'payment') {
        paymentId = String(body.id || body.resource?.split('/').pop() || '')
      } else {
        return new Response('ok', { status: 200 })
      }
    }

    if (!paymentId) {
      return new Response('ok', { status: 200 })
    }

    // Consulta detalhes do pagamento na API MP (exceto quando chamado internamente com dados ja validados)
    let customerEmail = pixRecord?.email || ''
    let customerName  = pixRecord?.name  || ''
    let quizSessionId = pixRecord?.quiz_session_id || null

    if (!isInternal) {
      if (!mpToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN nao configurado')
        return new Response('ok', { status: 200 })
      }

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${mpToken}` },
      })

      if (!mpRes.ok) {
        console.error('MP API erro:', mpRes.status)
        return new Response('ok', { status: 200 })
      }

      const payment = await mpRes.json()

      if (payment.status !== 'approved') {
        return new Response('ok', { status: 200 })
      }

      customerEmail = payment.payer?.email || ''
      customerName  = `${payment.payer?.first_name || ''} ${payment.payer?.last_name || ''}`.trim()
      quizSessionId = payment.metadata?.quiz_session_id
        || payment.external_reference
        || null

      // Busca registro local para nome correto e quiz_session_id
      const supabase = createClient(supabaseUrl, serviceRole)
      const { data: rec } = await supabase.from('pix_payments')
        .select('*').eq('payment_id', paymentId).single()

      if (rec) {
        customerEmail = rec.email || customerEmail
        customerName  = rec.name  || customerName
        quizSessionId = rec.quiz_session_id || quizSessionId
        if (rec.processed) {
          console.log(`PIX ${paymentId} ja processado. Ignorando.`)
          return new Response('ok', { status: 200 })
        }
        // Marca atomicamente
        const { data: claimed } = await supabase.from('pix_payments')
          .update({ status: 'approved', processed: true, updated_at: new Date().toISOString() })
          .eq('payment_id', paymentId)
          .eq('processed', false)
          .select('id')
        if (!claimed || claimed.length === 0) {
          console.log(`PIX ${paymentId} sendo processado por outro worker. Ignorando.`)
          return new Response('ok', { status: 200 })
        }
      }
    }

    if (!customerEmail) {
      console.error('Email nao encontrado para PIX', paymentId)
      return new Response('ok', { status: 200 })
    }

    const supabase = createClient(supabaseUrl, serviceRole)

    // Idempotencia: payment_logs com indice unico em event_id
    const eventId = `mp_pix_${paymentId}`
    const { error: insertError } = await supabase.from('payment_logs').insert({
      provider:        'mercadopago',
      event_id:        eventId,
      payload:         { payment_id: paymentId, email: customerEmail },
      status:          'quiz_paid',
      quiz_session_id: quizSessionId,
      created_at:      new Date().toISOString(),
    })

    if (insertError) {
      if ((insertError as any).code === '23505') {
        console.log(`PIX ${paymentId} ja registrado em payment_logs. Ignorando.`)
        return new Response('ok', { status: 200 })
      }
      console.error('Erro ao inserir payment_log:', insertError.message)
      return new Response('ok', { status: 200 })
    }

    console.log(`PIX pago registrado: ${paymentId} email=${customerEmail}`)

    // Cancela emails de recuperacao pendentes
    if (customerEmail) {
      supabase.from('quiz_recovery_emails')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('email', customerEmail)
        .eq('status', 'pending')
        .then(({ error }: { error: any }) => {
          if (error) console.warn('Aviso: falha ao cancelar recuperacao:', error.message)
          else console.log(`Recuperacao cancelada para ${customerEmail}`)
        })
    }

    // Resolve quiz_session
    let qs: any = null
    if (quizSessionId) {
      const { data } = await supabase.from('quiz_sessions')
        .select('id,email,name,purchase_email_sent,drip_scheduled,quiz_data')
        .eq('id', quizSessionId).maybeSingle()
      if (data) qs = data
    }
    if (!qs && customerEmail) {
      const { data } = await supabase.from('quiz_sessions')
        .select('id,email,name,purchase_email_sent,drip_scheduled,quiz_data')
        .eq('email', customerEmail).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (data) qs = data
    }
    // Preferir o email original do quiz (antes de pre-preencher o payer do MP)
    if (qs?.email) customerEmail = qs.email
    if (qs?.name)  customerName  = qs.name

    // Envia email pos-compra
    if (customerEmail && resendApiKey) {
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
          + `&pix_payment_id=${encodeURIComponent(paymentId)}`

        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from:    'Espiritualizei <contato@espiritualizei.com>',
              to:      [customerEmail],
              subject: `${firstName}, seus materiais estao prontos. Acesse agora`,
              html:    buildPurchaseWelcomeEmail({ firstName, createAccountUrl }),
            }),
          })
          if (!r.ok) {
            const txt = await r.text().catch(() => '')
            console.error('Falha Resend (PIX pos-compra):', r.status, txt)
            if (qs) await supabase.from('quiz_sessions').update({ purchase_email_sent: false }).eq('id', qs.id)
          } else {
            console.log(`Email PIX pos-compra enviado para ${customerEmail}`)
          }
        } catch (e: any) {
          console.error('Erro ao enviar email PIX pos-compra:', e?.message)
          if (qs) await supabase.from('quiz_sessions').update({ purchase_email_sent: false }).eq('id', qs.id)
        }
      }
    }

    // Agenda drip
    if (quizSessionId || qs) {
      if (!qs?.drip_scheduled) {
        fetch(`${supabaseUrl}/functions/v1/schedule-quiz-drip`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${serviceRole}`,
            'apikey':        serviceRole,
          },
          body: JSON.stringify({
            quiz_session_id:   qs?.id || quizSessionId,
            pix_payment_id:    paymentId,
            email:             customerEmail,
            name:              qs?.name || customerName || '',
            plan_data:         null,
            quiz_data:         qs?.quiz_data || null,
          }),
        }).catch((e: any) => console.warn('Aviso: falha ao acionar schedule-quiz-drip:', e?.message))
      }
    }

  } catch (error: any) {
    console.error('pix-webhook-handler erro:', error.message)
  }

  return new Response('ok', { status: 200 })
})
