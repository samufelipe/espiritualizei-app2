/**
 * verify-purchase-email — Edge Function pública (sem auth)
 *
 * Verifica se um e-mail possui uma compra confirmada (stripe_session_id NOT NULL)
 * em quiz_sessions. Se stripe_session_id for fornecido, verifica também se ele
 * pertence a esse e-mail — impede que alguém use o session de outra pessoa.
 *
 * Retorna apenas { eligible: boolean }. Nunca expõe dados da sessão.
 *
 * Usado pela página /materiais antes de exibir o formulário de criação de senha,
 * garantindo que apenas quem comprou pode criar uma conta naquele fluxo.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const ALLOWED_ORIGIN = 'https://www.espiritualizei.com'

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const respond = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...cors, 'Content-Type': 'application/json' },
    status,
  })

serve(async (req: any) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return respond({ eligible: false }, 405)

  let email = ''
  let stripeSessionId: string | null = null

  try {
    const body = await req.json()
    email          = (body.email || '').trim().toLowerCase()
    stripeSessionId = (body.stripe_session_id || '').trim() || null
  } catch {
    return respond({ eligible: false })
  }

  // Validação mínima: precisa ser um e-mail válido
  if (!email || !email.includes('@') || !email.includes('.')) {
    return respond({ eligible: false })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')             ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Verifica compra confirmada (stripe_session_id NOT NULL)
    //    Se stripe_session_id fornecido, confere que pertence a ESTE e-mail.
    let query = supabase
      .from('quiz_sessions')
      .select('id')
      .eq('email', email)
      .not('stripe_session_id', 'is', null)

    if (stripeSessionId) {
      query = query.eq('stripe_session_id', stripeSessionId)
    }

    const { data: purchase, error: purchaseErr } = await query.maybeSingle()

    if (purchaseErr) {
      console.error('[verify-purchase-email] DB purchase error:', purchaseErr.message)
      return respond({ eligible: false, hasAccount: false })
    }

    if (!purchase) {
      return respond({ eligible: false, hasAccount: false })
    }

    // 2. Verifica se o usuário já criou uma conta (perfil existe)
    //    Assim a página sabe se deve mostrar "criar senha" ou "entrar".
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    const hasAccount = !!profile

    console.log(`[verify-purchase-email] ${email} → eligible=true hasAccount=${hasAccount}`)
    return respond({ eligible: true, hasAccount })

  } catch (e: any) {
    console.error('[verify-purchase-email] Unexpected error:', e?.message)
    return respond({ eligible: false, hasAccount: false })
  }
})
