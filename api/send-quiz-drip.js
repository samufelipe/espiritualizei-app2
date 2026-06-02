/**
 * Vercel Cron Handler — dispara o processamento diário do drip de 21 dias
 * Agendado em vercel.json: "0 10 * * *" (10h UTC = 7h BRT)
 *
 * Delega toda a lógica para a Edge Function process-quiz-drip no Supabase,
 * que já tem acesso a RESEND_API_KEY e SUPABASE_SERVICE_ROLE_KEY como secrets.
 * Nenhuma variável de ambiente adicional necessária no Vercel.
 */

const SUPABASE_URL  = 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-quiz-drip`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
    })

    const data = await response.json().catch(() => ({}))
    return res.status(response.status).json(data)

  } catch (e) {
    console.error('[send-quiz-drip]', e.message)
    return res.status(500).json({ error: e.message })
  }
}
