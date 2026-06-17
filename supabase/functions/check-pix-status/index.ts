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

  const url       = new URL(req.url)
  const paymentId = url.searchParams.get('paymentId')

  if (!paymentId) {
    return new Response(JSON.stringify({ error: 'paymentId obrigatorio' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const mpToken     = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    })

    if (!mpRes.ok) {
      throw new Error(`MP status check falhou: ${mpRes.status}`)
    }

    const payment = await mpRes.json()
    const supabase = createClient(supabaseUrl, serviceRole)

    // Atualiza status local
    await supabase.from('pix_payments')
      .update({ status: payment.status, updated_at: new Date().toISOString() })
      .eq('payment_id', paymentId)

    // Se aprovado e ainda nao processado, dispara pos-compra
    if (payment.status === 'approved') {
      const { data: pixRecord } = await supabase.from('pix_payments')
        .select('*').eq('payment_id', paymentId).single()

      if (pixRecord && !pixRecord.processed) {
        // Marca atomicamente — previne race com o webhook MP
        const { data: claimed } = await supabase.from('pix_payments')
          .update({ processed: true, updated_at: new Date().toISOString() })
          .eq('payment_id', paymentId)
          .eq('processed', false)
          .select('id')

        if (claimed && claimed.length > 0) {
          // Chama o webhook-handler internamente para executar pos-compra
          const supabasePublicUrl = supabaseUrl
          fetch(`${supabasePublicUrl}/functions/v1/pix-webhook-handler`, {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${serviceRole}`,
              'apikey':        serviceRole,
              'x-internal':    '1',
            },
            body: JSON.stringify({
              payment_id:      paymentId,
              email:           pixRecord.email,
              name:            pixRecord.name,
              quiz_session_id: pixRecord.quiz_session_id || null,
              internal:        true,
            }),
          }).catch((e: any) => console.warn('pos-compra interno erro:', e?.message))
        }
      }
    }

    return new Response(JSON.stringify({ status: payment.status, paymentId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('check-pix-status erro:', error.message)
    return new Response(JSON.stringify({ error: 'Erro ao verificar status PIX' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
