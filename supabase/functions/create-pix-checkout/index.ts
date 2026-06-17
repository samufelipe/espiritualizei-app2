import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const mpToken     = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!mpToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN nao configurado')
      return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const { email, name, quiz_session_id } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'email obrigatorio' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Idempotency key: mesmo email+sessao no mesmo dia nao gera dois PIX
    const idempotencyKey = btoa(`${email}:${quiz_session_id || 'no-session'}:${new Date().toISOString().slice(0, 10)}`)

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    // MP exige offset de timezone, nao 'Z'
    const expiresAtMp = expiresAt.toISOString().replace('Z', '-03:00')

    const pixPayload = {
      transaction_amount: 19.90,
      description: 'Diagnostico Espiritual + Plano de 21 Dias',
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: (name || '').split(' ')[0] || 'Cliente',
        last_name:  (name || '').split(' ').slice(1).join(' ') || 'Espiritualizei',
      },
      metadata: {
        quiz_session_id: quiz_session_id || '',
        name: name || '',
        source: 'quiz',
      },
      date_of_expiration: expiresAtMp,
      // MP chama esta URL ao aprovar o PIX — dispensa configuracao manual no dashboard
      notification_url: `${supabaseUrl}/functions/v1/pix-webhook-handler`,
    }

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization':       `Bearer ${mpToken}`,
        'Content-Type':        'application/json',
        'X-Idempotency-Key':   idempotencyKey,
      },
      body: JSON.stringify(pixPayload),
    })

    if (!mpRes.ok) {
      const errBody = await mpRes.text()
      console.error('MP error:', errBody)
      throw new Error(`Mercado Pago erro ${mpRes.status}: ${errBody}`)
    }

    const payment = await mpRes.json()

    // Registra cobranca pendente para polling e idempotencia do webhook
    const supabase = createClient(supabaseUrl, serviceRole)
    await supabase.from('pix_payments').insert({
      payment_id:      String(payment.id),
      email,
      name:            name || '',
      quiz_session_id: quiz_session_id || null,
      status:          'pending',
      amount:          1990,
      expires_at:      expiresAt.toISOString(),
      created_at:      new Date().toISOString(),
    })

    console.log(`PIX criado: ${payment.id} para ${email}`)

    return new Response(JSON.stringify({
      paymentId:         String(payment.id),
      pixCode:           payment.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64:   payment.point_of_interaction?.transaction_data?.qr_code_base64,
      expiresAt:         payment.date_of_expiration,
      status:            payment.status,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('create-pix-checkout erro:', error.message)
    return new Response(JSON.stringify({ error: 'Erro ao criar cobranca PIX', detail: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
