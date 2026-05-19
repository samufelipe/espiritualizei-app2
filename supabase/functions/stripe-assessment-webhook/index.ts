import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const stripeKey          = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret      = Deno.env.get('STRIPE_ASSESSMENT_WEBHOOK_SECRET')
  const supabaseUrl        = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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
    const customerEmail = session.customer_details?.email ?? null
    const customerName  = session.metadata?.name ?? null

    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Idempotência — não processar o mesmo evento duas vezes
    const { data: existing } = await supabase
      .from('payment_logs')
      .select('id')
      .eq('event_id', event.id)
      .maybeSingle()

    if (existing) {
      console.log(`Evento ${event.id} já processado. Ignorando.`)
      return new Response(JSON.stringify({ received: true }), { status: 200 })
    }

    const { error: insertError } = await supabase.from('payment_logs').insert({
      provider:        'stripe',
      event_id:        event.id,
      payload:         session,
      status:          'quiz_paid',
      quiz_session_id: quizSessionId,
      created_at:      new Date().toISOString(),
    })

    if (insertError) {
      console.error('Erro ao inserir payment_log:', insertError.message)
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    console.log(`Quiz pago registrado: session=${session.id} quiz_session=${quizSessionId} email=${customerEmail} nome=${customerName}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})