import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

    const preference = {
      items: [{
        title:       'Diagnostico Espiritual + Plano de 21 Dias',
        quantity:    1,
        unit_price:  19.90,
        currency_id: 'BRL',
      }],
      back_urls: {
        success: 'https://www.espiritualizei.com/materiais',
        failure: quiz_session_id
          ? `https://www.espiritualizei.com/diagnostico?resume=${quiz_session_id}`
          : 'https://www.espiritualizei.com/diagnostico',
        pending: 'https://www.espiritualizei.com/materiais',
      },
      auto_return:        'approved',
      external_reference: quiz_session_id || '',
      notification_url:   `${supabaseUrl}/functions/v1/pix-webhook-handler`,
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!mpRes.ok) {
      const errBody = await mpRes.text()
      console.error('MP Preferences error:', errBody)
      throw new Error(`Mercado Pago erro ${mpRes.status}: ${errBody}`)
    }

    const pref = await mpRes.json()

    console.log(`MP Preference criada: ${pref.id} para ${email}`)

    return new Response(JSON.stringify({ url: pref.init_point, prefId: pref.id }), {
      status:  200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('create-mp-checkout erro:', error.message)
    return new Response(JSON.stringify({ error: 'Erro ao criar checkout', detail: error.message }), {
      status:  500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
