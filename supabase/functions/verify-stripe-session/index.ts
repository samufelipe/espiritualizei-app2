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
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Servidor mal configurado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { sessionId, userId } = await req.json()

    if (!sessionId || !userId) {
      return new Response(JSON.stringify({ error: 'sessionId e userId obrigatórios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    // Verificar a sessão diretamente no Stripe — sem confiar no cliente
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Validar que a sessão pertence a este usuário
    if (session.client_reference_id !== userId) {
      console.error(`Tentativa de fraude: userId=${userId} tentou usar session de ${session.client_reference_id}`)
      return new Response(JSON.stringify({ isPremium: false, error: 'Sessão não pertence a este usuário' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Só ativa se o pagamento foi realmente confirmado pelo Stripe
    const isPaid = session.payment_status === 'paid'

    if (isPaid) {
      const supabase = createClient(supabaseUrl, supabaseServiceRole)
      const customerId = session.customer as string

      await supabase.from('profiles').update({
        is_premium: true,
        subscription_status: 'active',
        subscription_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripe_customer_id: customerId || null,
      }).eq('id', userId)

      await supabase.from('payment_logs').insert({
        user_id: userId,
        provider: 'stripe',
        event_id: `session_verify_${sessionId}`,
        payload: { sessionId, payment_status: session.payment_status },
        status: 'success',
        created_at: new Date().toISOString(),
      })

      console.log(`✅ Premium verificado e ativado via session: ${sessionId} para usuário ${userId}`)
    } else {
      console.log(`⏳ Sessão ${sessionId} ainda não paga (status: ${session.payment_status})`)
    }

    return new Response(JSON.stringify({ isPremium: isPaid, paymentStatus: session.payment_status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar sessão:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})