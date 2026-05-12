import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, name, quizData } = await req.json()

    if (!email || !quizData) {
      return new Response(JSON.stringify({ error: 'email e quizData são obrigatórios' }), {
        headers: { ...cors, 'Content-Type': 'application/json' }, status: 400,
      })
    }

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({ email, name: name || '', quiz_data: quizData })
      .select('id')
      .single()

    if (error) throw error

    console.log(`✅ Quiz session salva: ${data.id} para ${email}`)
    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (err: any) {
    console.error('save-quiz-session:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})