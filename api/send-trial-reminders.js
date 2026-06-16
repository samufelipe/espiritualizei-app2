/**
 * Vercel Cron Handler — dispara lembretes de trial para usuarios em janelas especificas
 * Agendado em vercel.json: "0 12 * * *" (12h UTC = 9h BRT)
 *
 * Delega toda a logica para a Edge Function send-trial-reminders no Supabase.
 */

const SUPABASE_URL  = 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-trial-reminders`, {
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
    console.error('[send-trial-reminders]', e.message)
    return res.status(500).json({ error: e.message })
  }
}
