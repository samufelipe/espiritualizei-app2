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
    const priceId = Deno.env.get('STRIPE_QUIZ_PRICE_ID')

    if (!stripeKey || !priceId) {
      console.error('STRIPE_SECRET_KEY ou STRIPE_QUIZ_PRICE_ID não configurado')
      return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const { email, name, encoded } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'email obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `https://www.espiritualizei.com/quiz/resultado?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.espiritualizei.com/quiz`,
      payment_intent_data: {
        metadata: { name: name || '', encoded: encoded || '' },
      },
      metadata: { name: name || '', encoded: encoded || '' },
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