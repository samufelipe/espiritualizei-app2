import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY não configurado')
      return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const { email, name, quiz_session_id } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'email obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'brl',
          unit_amount: 1990, // R$19,90 em centavos
          product_data: {
            name: 'Diagnóstico Espiritual + Plano de 21 Dias',
            description: 'Seu caminho personalizado de volta à presença de Deus',
          },
        },
        quantity: 1,
      }],
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `https://www.espiritualizei.com/quiz/resultado?session={CHECKOUT_SESSION_ID}`,
      cancel_url: quiz_session_id
        ? `https://www.espiritualizei.com/quiz?resume=${quiz_session_id}`
        : `https://www.espiritualizei.com/quiz`,
      payment_intent_data: {
        metadata: { name: name || '' },
      },
      metadata: { name: name || '', source: 'quiz', quiz_session_id: quiz_session_id || '' },
    })

    console.log(`✅ Quiz checkout session criada: ${session.id} para ${email}`)

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar quiz checkout:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})