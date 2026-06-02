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

    // Agendar 3 e-mails de recuperação de carrinho (idempotente via UNIQUE)
    const sessionId = data.id
    const challenge = quizData?.answers?.challenge || 'anxiety'
    const firstName = (name || '').split(' ')[0] || 'Caminhante'
    const now       = new Date()

    const recoveryRecords = [
      {
        quiz_session_id: sessionId,
        email,
        name:          firstName,
        challenge,
        sequence_step: 1,
        scheduled_at:  new Date(now.getTime() + 10 * 60 * 1000).toISOString(),      // +10min
      },
      {
        quiz_session_id: sessionId,
        email,
        name:          firstName,
        challenge,
        sequence_step: 2,
        scheduled_at:  new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // +24h
      },
      {
        quiz_session_id: sessionId,
        email,
        name:          firstName,
        challenge,
        sequence_step: 3,
        scheduled_at:  new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(), // +72h
      },
    ]

    const { error: recoveryError } = await supabase
      .from('quiz_recovery_emails')
      .upsert(recoveryRecords, { onConflict: 'quiz_session_id,sequence_step', ignoreDuplicates: true })

    if (recoveryError) {
      console.warn('Aviso: falha ao agendar recuperação:', recoveryError.message)
    } else {
      console.log(`📅 3 e-mails de recuperação agendados para ${email}`)
    }

    console.log(`✅ Quiz session salva: ${sessionId} para ${email}`)
    return new Response(JSON.stringify({ id: sessionId }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (err: any) {
    console.error('save-quiz-session:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})