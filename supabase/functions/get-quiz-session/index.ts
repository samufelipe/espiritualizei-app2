import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { ...cors, 'Content-Type': 'application/json' }, status })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Leitura segura de UMA quiz_session por um segredo de posse:
 *   - id (UUID da sessão) — usado pela recuperação de carrinho (?resume=ID)
 *   - stripe_session_id   — usado para alinhar o perfil de quem veio do quiz
 *
 * Ambos são segredos não-enumeráveis enviados apenas ao dono (e-mail/Stripe),
 * mesmo modelo dos links de materiais. Roda com service role, devolvendo só os
 * campos mínimos. Substitui a leitura anônima direta da tabela (RLS aberta).
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { id, stripe_session_id } = await req.json().catch(() => ({}))

    let query = supabase
      .from('quiz_sessions')
      .select('quiz_data,name,email,plan_data,stripe_session_id')
      .limit(1)

    if (id) {
      if (!UUID_RE.test(String(id))) return json({ error: 'id inválido' }, 400)
      query = query.eq('id', id)
    } else if (stripe_session_id) {
      query = query.eq('stripe_session_id', String(stripe_session_id)).order('created_at', { ascending: false })
    } else {
      return json({ error: 'id ou stripe_session_id obrigatório' }, 400)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    if (!data) return json({ found: false }, 404)

    return json({
      found: true,
      quiz_data: data.quiz_data,
      name: data.name,
      email: data.email,
      plan_data: data.plan_data,
      stripe_session_id: data.stripe_session_id,
    })
  } catch (e: any) {
    console.error('get-quiz-session erro:', e?.message)
    return json({ error: 'Falha ao buscar sessão' }, 500)
  }
})
