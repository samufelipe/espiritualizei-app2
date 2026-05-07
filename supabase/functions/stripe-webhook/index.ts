import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
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

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  // Fail-closed: variáveis obrigatórias
  if (!stripeKey || !webhookSecret) {
    console.error('STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET não configurado')
    return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  const supabase = createClient(supabaseUrl, supabaseServiceRole)

  // Verificar assinatura Stripe (HMAC-SHA256)
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('❌ Header stripe-signature ausente')
    return new Response(JSON.stringify({ error: 'Assinatura ausente' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('❌ Assinatura inválida:', err.message)
    return new Response(JSON.stringify({ error: `Assinatura inválida: ${err.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  console.log(`📦 Evento Stripe recebido: ${event.type} [${event.id}]`)

  // Idempotência: verificar se já processamos este evento
  const { data: existingLog } = await supabase
    .from('payment_logs')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle()

  if (existingLog) {
    console.log(`⚠️ Evento ${event.id} já processado. Ignorando.`)
    return new Response(JSON.stringify({ success: true, message: 'Evento já processado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }

  try {
    switch (event.type) {

      // ─── PAGAMENTO INICIAL ──────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string

        if (!userId) {
          console.error('❌ client_reference_id ausente no checkout.session.completed')
          break
        }

        await supabase.from('profiles').update({
          is_premium: true,
          subscription_status: 'active',
          subscription_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          stripe_customer_id: customerId,
          last_active_at: new Date().toISOString(),
        }).eq('id', userId)

        await supabase.from('payment_logs').insert({
          user_id: userId,
          provider: 'stripe',
          event_id: event.id,
          payload: session,
          status: 'success',
          created_at: new Date().toISOString(),
        })

        console.log(`✅ Premium ATIVADO: usuário ${userId}, customer ${customerId}`)
        break
      }

      // ─── RENOVAÇÃO MENSAL ───────────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Buscar usuário pelo stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) {
          console.warn(`⚠️ Nenhum perfil encontrado para customer ${customerId}`)
          break
        }

        await supabase.from('profiles').update({
          is_premium: true,
          subscription_status: 'active',
          subscription_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', profile.id)

        await supabase.from('payment_logs').insert({
          user_id: profile.id,
          provider: 'stripe',
          event_id: event.id,
          payload: invoice,
          status: 'renewal',
          created_at: new Date().toISOString(),
        })

        console.log(`🔄 Assinatura RENOVADA: usuário ${profile.id}`)
        break
      }

      // ─── CANCELAMENTO ───────────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) {
          console.warn(`⚠️ Nenhum perfil encontrado para customer ${customerId}`)
          break
        }

        await supabase.from('profiles').update({
          is_premium: false,
          subscription_status: 'canceled',
        }).eq('id', profile.id)

        await supabase.from('payment_logs').insert({
          user_id: profile.id,
          provider: 'stripe',
          event_id: event.id,
          payload: subscription,
          status: 'canceled',
          created_at: new Date().toISOString(),
        })

        console.log(`❌ Assinatura CANCELADA: usuário ${profile.id}`)
        break
      }

      // ─── FALHA DE COBRANÇA ──────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (profile) {
          await supabase.from('payment_logs').insert({
            user_id: profile.id,
            provider: 'stripe',
            event_id: event.id,
            payload: invoice,
            status: 'payment_failed',
            created_at: new Date().toISOString(),
          })
        }

        console.warn(`⚠️ Cobrança FALHOU para customer ${customerId}`)
        break
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar evento:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})